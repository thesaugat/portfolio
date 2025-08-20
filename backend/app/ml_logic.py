import os
import uuid
import re
import shutil
import glob
from typing import List, Optional, Dict

from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnablePassthrough
from langchain_core.pydantic_v1 import BaseModel, Field

from langchain_google_genai import (
    ChatGoogleGenerativeAI,
    GoogleGenerativeAIEmbeddings,
)


class AnswerWithSources(BaseModel):
    answer: str = Field(description="The model's response to the question")
    sources: str = Field(description="Exact content from documents used to answer")
    reasoning: str = Field(description="Explanation of how the answer was derived")


class EnhancedPDFRAGChatbot:
    """Optimized chatbot that builds and interacts with a RAG knowledge base"""

    def __init__(
        self,
        api_key: Optional[str] = None,
        vectorstore_path: str = "vectorstore/default",
    ):
        self.GENAI_API_KEY = api_key or os.getenv("gem_api_key", "default_key")
        self.vectorstore_path = vectorstore_path
        self._vectorstore = None

        # Initialize LLM
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-001",
            api_key=self.GENAI_API_KEY,
            temperature=0.2,
            top_p=0.95,
            max_output_tokens=4096,
        )

        self._embeddings = None

        # Load vectorstore if exists
        if os.path.exists(self.vectorstore_path):
            self.init_vectorstore()

    @property
    def embeddings(self):
        if self._embeddings is None:
            self._embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001", google_api_key=self.GENAI_API_KEY
            )
        return self._embeddings

    def load_and_split_pdf(self, file_path: str):
        loader = PyPDFLoader(file_path)
        pages = loader.load()

        file_name = os.path.basename(file_path)
        for page in pages:
            page.metadata["source"] = file_path
            page.metadata["file_name"] = file_name

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1500,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", ".", " ", ""],
        )

        return text_splitter.split_documents(pages)

    def init_vectorstore(self):
        """Load an existing vectorstore"""
        self._vectorstore = Chroma(
            persist_directory=self.vectorstore_path, embedding_function=self.embeddings
        )

    def prepare_knowledge_base(self, files: List[str], append: bool = False):
        """Build or update the knowledge base"""
        all_chunks = []
        for file in files:
            chunks = self.load_and_split_pdf(file)
            all_chunks.extend(chunks)

        if not append and os.path.exists(self.vectorstore_path):
            shutil.rmtree(self.vectorstore_path)

        if append and os.path.exists(self.vectorstore_path):
            # Load existing and add new
            self._vectorstore = Chroma(
                persist_directory=self.vectorstore_path,
                embedding_function=self.embeddings,
            )
            self._vectorstore.add_documents(all_chunks)
            self._vectorstore.persist()
        else:
            # Create new vectorstore
            self._vectorstore = Chroma.from_documents(
                documents=all_chunks,
                embedding=self.embeddings,
                persist_directory=self.vectorstore_path,
            )
            self._vectorstore.persist()

    def ask_question(self, query: str) -> Dict[str, str]:
        """Ask a question based on the stored knowledge base"""
        if not self._vectorstore:
            self.init_vectorstore()

        retriever = self._vectorstore.as_retriever(
            search_type="similarity", search_kwargs={"k": 6}
        )

        def format_docs(docs):
            return "\n\n".join([doc.page_content for doc in docs])

        retrieval_chain = {
            "context": retriever | format_docs,
            "question": RunnablePassthrough(),
        }

        prompt = ChatPromptTemplate.from_template(
            """
            You are a helpful assistant grounded in the user's personal documents.

            CONTEXT:
            {context}

            QUESTION:
            {question}

            INSTRUCTIONS:
            - Answer only using the context provided.
            - Do not hallucinate or fabricate content.
            - If unsure or if the answer is not found, reply: "I’m not sure based on the current documents."

            ANSWER:
            """
        )

        chain = (
            retrieval_chain
            | prompt
            | self.llm.with_structured_output(AnswerWithSources)
        )
        return chain.invoke(query)

    def rebuild_knowledge_base(self, kb_folder: str = "knowledge_base"):
        """Rebuild the knowledge base from all PDFs in the given folder."""
        pdf_files = glob.glob(os.path.join(kb_folder, "*.pdf"))

        if not pdf_files:
            raise FileNotFoundError(f"No PDF files found in '{kb_folder}'.")

        print(
            f"Found {len(pdf_files)} PDF(s) in {kb_folder}. Rebuilding vectorstore..."
        )
        self.prepare_knowledge_base(pdf_files, append=False)
        print("Knowledge base rebuilt successfully.")
