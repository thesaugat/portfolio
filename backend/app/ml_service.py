"""
RAG bot service for PDF knowledge bases (Chroma + Gemini).

- Index PDFs from a folder into a persisted Chroma vector store (one-time or on-demand)
- Answer questions strictly from retrieved context
- Safe rebuild for Docker volumes (does not delete the mount itself)

Usage:
    bot = EnhancedPDFRAGChatbot(
        persist_directory="/data/kb_chroma",
        api_key=os.getenv("gem_api_key")
    )

    # Build (or rebuild) the index from PDFs
    bot.build_vectorstore_from_folder(kb_folder="/data/knowledge_base", reset=False)
    # or
    bot.rebuild_knowledge_base(kb_folder="/data/knowledge_base")

    # Ask questions
    answer, sources = bot.chat("What are the main findings about X?", k=6)
"""

import os
import re
import uuid
import shutil
from typing import List, Dict, Any, Optional, Tuple

from langchain_community.document_loaders import PyPDFLoader
from langchain.docstore.document import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_core.runnables import RunnablePassthrough
from langchain_core.retrievers import BaseRetriever
from langchain.prompts import ChatPromptTemplate

from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings

# Prefer the shared schema if present; otherwise define a local fallback
try:  # pragma: no cover
    from .db.schemas import AnswerWithSources as _AnswerWithSources

    AnswerWithSources = _AnswerWithSources  # type: ignore
except Exception:  # pragma: no cover
    from pydantic import BaseModel, Field

    class AnswerWithSources(BaseModel):  # minimal fallback
        answer: str = Field(description="Answer to question")
        sources: str = Field(description="Full direct text used from context")
        reasoning: str = Field(description="Reasoning based on the sources")


class EnhancedPDFRAGChatbot:
    """RAG-based chatbot over a persisted Chroma knowledge base built from PDFs."""

    def __init__(
        self,
        persist_directory: str,
        api_key: Optional[str] = None,
        model: str = "gemini-2.0-flash-001",
        temperature: float = 0.2,
        max_output_tokens: int = 2048,
    ) -> None:
        self.persist_directory = persist_directory
        self.GENAI_API_KEY = api_key or os.getenv("gem_api_key", "default_key")
        os.makedirs(self.persist_directory, exist_ok=True)

        # LLM
        self.llm = ChatGoogleGenerativeAI(
            model=model,
            api_key=self.GENAI_API_KEY,
            temperature=temperature,
            top_p=0.95,
            max_output_tokens=max_output_tokens,
        )

        # Lazy state
        self._embeddings = None
        self._vectorstore: Optional[Chroma] = None
        self._retriever: Optional[BaseRetriever] = None

    # -------------------------------
    # Embeddings
    # -------------------------------
    @property
    def embeddings(self):
        if self._embeddings is None:
            self._embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001", google_api_key=self.GENAI_API_KEY
            )
        return self._embeddings

    # -------------------------------
    # PDF Loading & Splitting
    # -------------------------------
    @staticmethod
    def _load_and_split_pdf(file_path: str) -> List[Document]:
        loader = PyPDFLoader(file_path)
        pages = loader.load()

        if pages:
            file_name = os.path.basename(file_path)
            for page in pages:
                page.metadata.setdefault("source", file_path)
                page.metadata.setdefault("file_name", file_name)

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1500,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", ".", " ", ""],
        )
        return splitter.split_documents(pages)

    # -------------------------------
    # Vectorstore Building
    # -------------------------------
    def _safe_clear_persist_dir(self) -> None:
        """Clear contents of the persist directory without deleting the mount itself.
        Useful for Docker volumes to avoid 'Device or resource busy'.
        """
        os.makedirs(self.persist_directory, exist_ok=True)
        # Drop handles before clearing
        self._vectorstore = None
        self._retriever = None
        for name in os.listdir(self.persist_directory):
            path = os.path.join(self.persist_directory, name)
            try:
                if os.path.isdir(path) and not os.path.islink(path):
                    shutil.rmtree(path, ignore_errors=True)
                else:
                    try:
                        os.remove(path)
                    except IsADirectoryError:
                        shutil.rmtree(path, ignore_errors=True)
            except Exception as e:
                print(f"[persist clear] Skipped {path}: {e}")

    def build_vectorstore_from_folder(
        self, kb_folder: str, reset: bool = False
    ) -> None:
        if not os.path.isdir(kb_folder):
            raise FileNotFoundError(f"Knowledge base folder not found: {kb_folder}")

        if reset:
            self._safe_clear_persist_dir()

        all_chunks: List[Document] = []

        for root, _, files in os.walk(kb_folder):
            for fname in files:
                if fname.lower().endswith(".pdf"):
                    fpath = os.path.join(root, fname)
                    chunks = self._load_and_split_pdf(fpath)
                    for i, ch in enumerate(chunks):
                        base_id = f"{fpath}::{i}::{uuid.uuid5(uuid.NAMESPACE_URL, ch.page_content[:200])}"
                        ch.metadata["doc_id"] = base_id
                    all_chunks.extend(chunks)

        if not all_chunks:
            raise ValueError("No PDF content found to index.")

        ids = [ch.metadata.get("doc_id", str(uuid.uuid4())) for ch in all_chunks]

        _ = Chroma.from_documents(
            documents=all_chunks,
            ids=ids,
            embedding=self.embeddings,
            persist_directory=self.persist_directory,
        )

        # Reset cache so future queries use the new index
        self.reload()

    def rebuild_knowledge_base(self, kb_folder: str) -> None:
        """Force rebuild (clear safely, then re-index)."""
        self._safe_clear_persist_dir()
        self.build_vectorstore_from_folder(kb_folder=kb_folder, reset=False)

    # -------------------------------
    # Retriever Setup
    # -------------------------------
    def _ensure_retriever(self, k: int = 6) -> BaseRetriever:
        if self._vectorstore is None:
            self._vectorstore = Chroma(
                embedding_function=self.embeddings,
                persist_directory=self.persist_directory,
            )
        if self._retriever is None:
            self._retriever = self._vectorstore.as_retriever(
                search_type="similarity",
                search_kwargs={"k": k},
            )
        else:
            # keep retriever but allow k to change between calls
            self._retriever.search_kwargs["k"] = k
        return self._retriever

    # -------------------------------
    # Prompt & Formatting
    # -------------------------------
    @staticmethod
    def _format_docs(docs: List[Document]) -> str:
        parts = []
        for d in docs:
            src = d.metadata.get("file_name") or d.metadata.get("source") or "unknown"
            parts.append(f"[SOURCE: {src}]\n{d.page_content}")
        return "\n\n".join(parts)

    def _chat_prompt(self) -> ChatPromptTemplate:
        return ChatPromptTemplate.from_template(
            (
                "You are a helpful assistant that strictly answers from the provided context.\n"
                "If the answer is not in the context, say you don't know. Cite sources.\n\n"
                "CONTEXT:\n{context}\n\n"
                "QUESTION:\n{question}\n\n"
                "INSTRUCTIONS:\n"
                "- Answer concisely and factually.\n"
                "- Include a brief citation line listing file names you used.\n"
                "- Do not fabricate information.\n"
            )
        )

    # -------------------------------
    # Chat
    # -------------------------------
    def chat(
        self,
        question: str,
        k: int = 6,
        structured: bool = False,
    ) -> Tuple[str, List[Dict[str, Any]]]:
        retriever = self._ensure_retriever(k=k)

        docs = retriever.get_relevant_documents(question)
        context = self._format_docs(docs)

        prompt = self._chat_prompt()
        chain = {
            "context": lambda _: context,
            "question": RunnablePassthrough(),
        } | prompt

        if structured:
            chain = chain | self.llm.with_structured_output(AnswerWithSources)
            result: AnswerWithSources = chain.invoke(question)
            answer_text = result.answer
        else:
            chain = chain | self.llm
            result = chain.invoke(question)
            answer_text = getattr(result, "content", str(result))

        source_list: List[Dict[str, Any]] = []
        for d in docs:
            source_list.append(
                {
                    "file_name": d.metadata.get("file_name"),
                    "source": d.metadata.get("source"),
                    "snippet": d.page_content[:500],
                }
            )

        return answer_text, source_list

    def reload(self) -> None:
        self._vectorstore = None
        self._retriever = None

    # -------------------------------
    # Optional helper
    # -------------------------------
    @staticmethod
    def normalize_abstract_header(text: str) -> str:
        text = re.sub(
            r"\b(?:a\s*)?(?:b\s*)?(?:s\s*)?(?:t\s*)?(?:r\s*)?(?:a\s*)?(?:c\s*)?(?:t)\s*[\.:]?",
            "Abstract",
            text,
            flags=re.IGNORECASE,
        )
        text = re.sub(
            r"\b(summary|overview|executive\s+summary)\b",
            "Abstract",
            text,
            flags=re.IGNORECASE,
        )
        return text
