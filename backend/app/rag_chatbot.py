import os, glob, shutil, asyncio
from typing import Optional, Dict, Any, List
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

from motor.motor_asyncio import AsyncIOMotorClient
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnablePassthrough
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings


class AnswerWithSources(BaseModel):
    answer: str = Field(description="The model's response to the question")
    sources: str = Field(description="Exact content from documents used to answer")
    reasoning: str = Field(description="Explanation of how the answer was derived")


class EnhancedPDFRAGChatbot:
    def __init__(
        self,
        mongo_uri: str,
        mongo_db: str,
        mongo_collection: str,
        api_key: str,
        vectorstore_path: str,
        executor_workers: int = 4,
    ):
        if not api_key:
            raise RuntimeError("GEM_API_KEY missing")

        self.vectorstore_path = vectorstore_path
        self._vectorstore: Optional[Chroma] = None

        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-001",
            api_key=api_key,
            temperature=0.2,
            top_p=0.95,
            max_output_tokens=4096,
        )
        self._embeddings = None
        self.executor = ThreadPoolExecutor(max_workers=executor_workers)

        self.mongo_client = AsyncIOMotorClient(mongo_uri)
        self.db = self.mongo_client[mongo_db]
        self.chat_collection = self.db[mongo_collection]

        if os.path.exists(self.vectorstore_path):
            try:
                self.init_vectorstore()
            except Exception:
                self._vectorstore = None

    @property
    def embeddings(self):
        if self._embeddings is None:
            self._embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=(
                    self.llm.client.api_key
                    if hasattr(self.llm, "client")
                    else os.getenv("GEM_API_KEY")
                ),
            )
        return self._embeddings

    # --------- KB build helpers ---------
    def load_and_split_pdf(self, file_path: str):
        pages = PyPDFLoader(file_path).load()
        file_name = os.path.basename(file_path)
        for p in pages:
            p.metadata["source"] = file_path
            p.metadata["file_name"] = file_name

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1500,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", ".", " ", ""],
        )
        return splitter.split_documents(pages)

    def init_vectorstore(self):
        self._vectorstore = Chroma(
            persist_directory=self.vectorstore_path, embedding_function=self.embeddings
        )

    def prepare_knowledge_base(
        self, files: List[str], append: bool = False
    ) -> Dict[str, Any]:

        all_chunks = []
        for f in files:
            all_chunks.extend(self.load_and_split_pdf(f))
        print(all_chunks)

        if not append and os.path.exists(self.vectorstore_path):
            shutil.rmtree(self.vectorstore_path)

        if append and os.path.exists(self.vectorstore_path):
            self._vectorstore = Chroma(
                persist_directory=self.vectorstore_path,
                embedding_function=self.embeddings,
            )
            self._vectorstore.add_documents(all_chunks)
            self._vectorstore.persist()
        else:
            self._vectorstore = Chroma.from_documents(
                documents=all_chunks,
                embedding=self.embeddings,
                persist_directory=self.vectorstore_path,
            )
            self._vectorstore.persist()

        return {"num_files": len(files), "num_chunks": len(all_chunks)}

    def rebuild_knowledge_base(self, kb_folder: str) -> Dict[str, Any]:
        pdfs = sorted(glob.glob(os.path.join(kb_folder, "*.pdf")))
        if not pdfs:
            raise FileNotFoundError(f"No PDFs found in {kb_folder}")
        return self.prepare_knowledge_base(pdfs, append=False)

    # --------- RAG inference ---------

    def _format_docs(self, docs):
        return "\n\n".join([d.page_content for d in docs])

    async def _run_blocking(self, fn, *args, **kwargs):
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(self.executor, lambda: fn(*args, **kwargs))

    async def ask_question(
        self, session_id: str, question: str, user_id: str = "anonymous", k: int = 6
    ):
        if not self._vectorstore:
            if os.path.exists(self.vectorstore_path):
                self.init_vectorstore()
            else:
                raise RuntimeError("Vectorstore not initialized. Build the KB first.")

        # fetch chat history for this session
        hist_cursor = self.chat_collection.find({"session_id": session_id}).sort(
            "timestamp", 1
        )
        history_docs = await hist_cursor.to_list(length=None)
        chat_context = "\n".join(
            f"{d.get('role','user').capitalize()} ({d.get('timestamp','')}): {d.get('message','')}"
            for d in history_docs
        )

        retriever = self._vectorstore.as_retriever(
            search_type="similarity", search_kwargs={"k": k}
        )
        retrieval_chain = {
            "context": retriever | self._format_docs,
            "chat_context": (
                (lambda _: chat_context) if chat_context else (lambda _: "")
            ),
            "question": RunnablePassthrough(),
        }

        prompt = ChatPromptTemplate.from_template(
            """
You are a helpful assistant grounded in the user's personal documents.

DOCUMENT CONTEXT:
{context}

CHAT HISTORY:
{chat_context}

QUESTION:
{question}

INSTRUCTIONS:
- Use only the DOCUMENT CONTEXT and relevant CHAT HISTORY.
- Do not hallucinate. If info is missing, say: "I’m not sure based on the current documents."
- Provide a concise answer and, if helpful, mention which snippets informed it.

ANSWER:
"""
        )
        chain = (
            retrieval_chain
            | prompt
            | self.llm.with_structured_output(AnswerWithSources)
        )

        # log user message
        await self.chat_collection.insert_one(
            {
                "session_id": session_id,
                "timestamp": datetime.utcnow().isoformat(),
                "user_id": user_id,
                "role": "user",
                "message": question,
            }
        )

        # run LLM
        result = await self._run_blocking(chain.invoke, question)

        ans = getattr(result, "answer", None) or result.get("answer")
        src = getattr(result, "sources", None) or result.get("sources")
        rsn = getattr(result, "reasoning", None) or result.get("reasoning")

        # log bot message
        ts = datetime.utcnow().isoformat()
        await self.chat_collection.insert_one(
            {
                "session_id": session_id,
                "timestamp": ts,
                "user_id": "bot",
                "role": "bot",
                "message": ans,
                "sources": src,
                "reasoning": rsn,
            }
        )

        return {
            "answer": ans,
            "sources": src,
            "reasoning": rsn,
            "session_id": session_id,
            "timestamp": ts,
        }
