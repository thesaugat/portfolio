from fastapi import FastAPI
from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain.vectorstores import Chroma
from langchain_core.runnables import RunnablePassthrough
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict, List, Tuple

from langchain.evaluation import load_evaluator

from langchain_core.retrievers import BaseRetriever
from langchain.document_loaders import PyPDFLoader
from langchain.chains import RetrievalQA
from langchain.schema import Document
import re

# Other modules and packages
import os
import tempfile
import streamlit as st
import pandas as pd
import shutil
import uuid
from typing import Dict, List, Any, Optional

# from ml_back import predict

app = FastAPI()


class Input(BaseModel):
    message: str


@app.post("/predict")
def summarize(file: UploadFile = File(...)):
    # api_key = os.getenv("gem_api_key", "default_key")
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    temp_path = os.path.join("temp_files", unique_filename)

    # Ensure temp directory exists
    os.makedirs("temp_files", exist_ok=True)

    # Save the uploaded file to disk
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # summarizer = Summarize()
    # resp = summarizer.summarize_file(file_path=temp_path)
    summarizer = EnhancedPDFSummarizer()
    result = summarizer.summarize_file(temp_path)
    output_dict = {
        "title": result.get("title", "Unknown"),
        "abstract": result.get("abstract", "Not available"),
        "key_points": result.get("key_points", "Not available"),
        "detailed_summary": result.get("detailed_summary", "Not available"),
    }

    return result

    # return {"response": f"Processed  with key {output_dict}"}


class AnswerWithSources(BaseModel):
    """An answer to the question, with sources and reasoning."""

    answer: str = Field(description="Answer to question")
    sources: str = Field(
        description="Full direct text chunk from the context used to answer the question"
    )
    reasoning: str = Field(
        description="Explain the reasoning of the answer based on the sources"
    )


class EnhancedPDFSummarizer:
    """A class to extract key information and summaries from PDF documents"""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the summarizer with Google AI API credentials

        Args:
            api_key: Google Generative AI API key (optional, will use environment variable if not provided)
        """
        # Load the Gemini API key from parameter, environment or use a default
        self.GENAI_API_KEY = api_key or os.getenv("gem_api_key", "default_key")

        # Initialize the Gemini LLM with a more capable model
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-001",  # Using a more advanced model for better summaries
            api_key=self.GENAI_API_KEY,
            temperature=0.2,  # Lower temperature for more factual responses
            top_p=0.95,  # Control diversity while maintaining accuracy
            max_output_tokens=4096,  # Allow for longer, more detailed responses
        )

        # Create embeddings instance for vector operations
        self._embeddings = None

    @property
    def embeddings(self):
        """Lazy-load embeddings to avoid unnecessary API calls"""
        if self._embeddings is None:
            self._embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001", google_api_key=self.GENAI_API_KEY
            )
        return self._embeddings

    def load_and_split_pdf(self, file_path: str) -> List[Document]:
        """
        Load a PDF file and split it into manageable chunks

        Args:
            file_path: Path to the PDF file

        Returns:
            List of document chunks
        """
        # Load PDF content
        loader = PyPDFLoader(file_path)
        pages = loader.load()

        # Extract metadata from the first page for later use
        if pages:
            file_name = os.path.basename(file_path)
            for page in pages:
                if not page.metadata.get("source"):
                    page.metadata["source"] = file_path
                if not page.metadata.get("file_name"):
                    page.metadata["file_name"] = file_name

        # Create a text splitter that respects document structure
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1500,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", ".", " ", ""],
        )

        # Split documents while preserving metadata
        chunks = text_splitter.split_documents(pages)
        return chunks

    def create_vectorstore(self, chunks: List[Document], vectorstore_path: str):
        """
        Create a vector store from document chunks

        Args:
            chunks: List of document chunks
            vectorstore_path: Path to store the vector database

        Returns:
            Chroma vector store
        """
        # Create a list of unique ids for each document based on the content
        ids = [str(uuid.uuid5(uuid.NAMESPACE_DNS, doc.page_content)) for doc in chunks]

        # Ensure that only unique docs with unique ids are kept
        unique_ids = set()
        unique_chunks = []

        for chunk, id in zip(chunks, ids):
            if id not in unique_ids:
                unique_ids.add(id)
                unique_chunks.append(chunk)

        # Create a new Chroma database from the documents
        vectorstore = Chroma.from_documents(
            documents=unique_chunks,
            ids=list(unique_ids),
            embedding=self.embeddings,
            persist_directory=vectorstore_path,
        )

        vectorstore.persist()
        return vectorstore

    def extract_title(self, chunks: List[Document]) -> str:
        """
        Extract the title from the document chunks

        Args:
            chunks: List of document chunks

        Returns:
            Extracted title
        """
        # Use first few chunks for title extraction
        first_chunks = chunks[:3]

        # Concatenate the content of first chunks
        content = "\n\n".join([chunk.page_content for chunk in first_chunks])

        title_prompt = ChatPromptTemplate.from_template(
            """
        You are an expert at extracting accurate document titles. 
        Examine the following text from the beginning of a document and extract its TITLE ONLY.
        
        TEXT:
        {text}
        
        INSTRUCTIONS:
        1. Return ONLY the title of the document.
        2. If you can't find a clear title, extract what appears to be the main heading.
        3. Do not include any explanation, headers, or other text.
        4. If absolutely no title can be determined, respond with "Untitled Document".
        """
        )

        title_chain = title_prompt | self.llm.with_structured_output(AnswerWithSources)
        title = title_chain.invoke({"text": content})

        return title

    def extract_author(self, chunks: List[Document]) -> str:
        """
        Extract the author(s) from the document chunks

        Args:
            chunks: List of document chunks

        Returns:
            Extracted author(s)
        """
        # Use first few chunks where author info is typically found
        first_chunks = chunks[:3]

        # Concatenate the content of the first chunks
        content = "\n\n".join([chunk.page_content for chunk in first_chunks])

        author_prompt = ChatPromptTemplate.from_template(
            """
            You are an expert at extracting author names from academic documents.
            Examine the following text from the beginning of the document and extract the AUTHOR NAME(S) ONLY.
            
            TEXT:
            {text}
            
            INSTRUCTIONS:
            1. Return ONLY the full name(s) of the author(s).
            2. If there are multiple authors, separate them with commas.
            3. Do NOT include titles (e.g., Dr., Prof.) or affiliations (e.g., university names).
            4. If you cannot find any author names, respond with "Unknown Author".
            5. Do not include any explanation, headers, or other text.
            """
        )

        author_chain = author_prompt | self.llm.with_structured_output(
            AnswerWithSources
        )
        author = author_chain.invoke({"text": content})

        return author

    def normalize_abstract_header(self, text: str) -> str:
        # Fix spaced-out versions of "abstract" (e.g., "a b s t r a c t .")
        text = re.sub(
            r"\b(?:a\s*)?(?:b\s*)?(?:s\s*)?(?:t\s*)?(?:r\s*)?(?:a\s*)?(?:c\s*)?(?:t)\s*[\.:]?",
            "Abstract",
            text,
            flags=re.IGNORECASE,
        )

        # Also normalize common variants
        text = re.sub(
            r"\b(summary|overview|executive\s+summary)\b",
            "Abstract",
            text,
            flags=re.IGNORECASE,
        )

        return text

    def generate_summary(self, retriever: BaseRetriever) -> Dict[str, str]:
        """
        Generate a comprehensive summary of the document

        Args:
            retriever: Document retriever

        Returns:
            Dictionary with title, abstract, key points and detailed summary
        """
        # Dictionary to store all generated information
        result = {}

        # Create a general-purpose retrieval chain
        def format_docs(docs):
            return "\n\n".join(doc.page_content for doc in docs)

        retrieval_chain = {
            "context": retriever | format_docs,
            "question": RunnablePassthrough(),
        }

        # Define prompts for different summarization tasks
        summary_prompt = ChatPromptTemplate.from_template(
            """
        You are an expert summarizer who distills complex documents into clear, accurate summaries.
        Based on the following document excerpts, provide a comprehensive summary of the entire document.
        
        DOCUMENT EXCERPTS:
        {context}
        
        INSTRUCTIONS:
        1. Focus on the main points, findings, and conclusions
        2. Maintain an objective tone
        3. Organize the information logically
        4. Keep the summary concise but comprehensive (300-500 words)
        5. DO NOT include your own analysis or opinion
        6. DO NOT make up information not present in the text
        
        COMPREHENSIVE SUMMARY:
        """
        )

        key_points_prompt = ChatPromptTemplate.from_template(
            """
        You are an expert at extracting the most important information from documents.
        Based on the following document excerpts, identify and list the key points.
        
        DOCUMENT EXCERPTS:
        {context}
        
        INSTRUCTIONS:
        1. Extract the 5-8 most important points from the document
        2. Present them as a bulleted list
        3. Be specific and factual
        4. Focus on main findings, conclusions, and significant information
        5. DO NOT include minor details or examples
        6. DO NOT make up information not present in the text
        
        KEY POINTS:
        """
        )

        keywords_prompt = ChatPromptTemplate.from_template(
            """
    You are an expert at analyzing documents to identify the most relevant keywords.
    Based on the following document excerpts, extract the most representative keywords.
    
    DOCUMENT EXCERPTS:
    {context}
    
    INSTRUCTIONS:
    1. Identify exactly 7 keywords that best represent the content of the document
    2. Keywords should be concise (typically one to three words)
    3. Focus on high-level topics, entities, and domain-specific terms
    4. Do NOT include generic or irrelevant words
    5. Do NOT invent information that is not present in the text
    6. Do not include any explanation, headers, or other text.
    
    KEYWORDS:
    """
        )

        # abstract_prompt = ChatPromptTemplate.from_template(
        #     """
        # You are an expert at writing concise abstracts for academic and professional documents.
        # Based on the following document excerpts, write a brief abstract.

        # DOCUMENT EXCERPTS:
        # {context}

        # INSTRUCTIONS:
        # 1. Create a concise abstract (100-150 words)
        # 2. Include purpose, methods, main findings, and significance
        # 3. Use formal, objective language
        # 4. DO NOT include citations, references, or details
        # 5. DO NOT make up information not present in the text

        # ABSTRACT:
        # """
        # )
        abstract_prompt = ChatPromptTemplate.from_template(
            """
            You are an expert at analyzing academic and professional documents.
            Based on the following document excerpts, extract the original abstract if it is present.

            DOCUMENT EXCERPTS:
            {context}

            INSTRUCTIONS:
            1. Extract the abstract exactly as it appears in the document.
            2. The abstract may be labeled as "Abstract", "Summary", "Executive Summary", or "Overview".
            3. Be flexible and look for sections that serve the purpose of an abstract, even if the heading is slightly different.
            4. Do NOT rewrite, rephrase, or summarize the abstract.
            5. DO NOT include any content outside the abstract.
            6. If no abstract or similar section is found, respond with: "No abstract found."

            ABSTRACT:
            """
        )
        # 5. If no abstract or similar section is found, respond with: "No abstract found."

        # Create chains for each summarization task
        summary_chain = (
            retrieval_chain
            | summary_prompt
            | self.llm.with_structured_output(AnswerWithSources)
        )

        key_points_chain = retrieval_chain | key_points_prompt | self.llm

        key_words_chain = (
            retrieval_chain
            | keywords_prompt
            | self.llm.with_structured_output(AnswerWithSources)
        )

        abstract_chain = (
            retrieval_chain
            | abstract_prompt
            | self.llm.with_structured_output(AnswerWithSources)
        )

        # Execute summarization tasks
        result["detailed_summary"] = summary_chain.invoke(
            "What is this document about?"
        )
        result["key_points"] = key_points_chain.invoke(
            "What are the key points of this document?"
        ).content
        result["abstract"] = abstract_chain.invoke(
            "Write an abstract for this document"
        )

        result["keywords"] = key_words_chain.invoke(
            "What are the key words of this document?"
        )

        return result

    def summarize_file(self, file_path: str) -> Dict[str, Any]:
        """
        Summarize a PDF file and extract key information

        Args:
            file_path: Path to the PDF file

        Returns:
            Dictionary with title and summary information
        """
        try:
            # Create a unique vectorstore path for this file
            file_hash = str(uuid.uuid5(uuid.NAMESPACE_DNS, file_path))
            vectorstore_path = f"vectorstore/vectorstore_chroma_{file_hash}"

            # Remove existing vectorstore if it exists
            if os.path.exists(vectorstore_path):
                shutil.rmtree(vectorstore_path)

            # Load and split the PDF
            chunks = self.load_and_split_pdf(file_path)

            if not chunks:
                return {"error": "No content found in the PDF file"}

            # Create vectorstore and retriever
            vectorstore = self.create_vectorstore(
                chunks=chunks, vectorstore_path=vectorstore_path
            )

            # Configure retriever for better recall
            retriever = vectorstore.as_retriever(
                search_type="similarity",
                search_kwargs={"k": 6},  # Retrieve more documents for better context
            )

            # Extract title
            title = self.extract_title(chunks)

            # Extract Author
            author = self.extract_author(chunks)

            # Generate comprehensive summary
            summary_info = self.generate_summary(retriever)
            print(summary_info)

            # Create a complete output dictionary
            output_dict = {"title": title, "author": author, "summary": summary_info}

            # Clean up vector store to free disk space
            if os.path.exists(vectorstore_path):
                shutil.rmtree(vectorstore_path)

            return output_dict

        except Exception as e:
            import traceback

            return {"error": str(e), "traceback": traceback.format_exc()}


class RecommendationService:
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    def _compute_pairwise_similarity(self, source_text: str, target_text: str) -> float:
        """Helper method to compute similarity between two texts"""
        embeddings = self.model.encode(
            [source_text, target_text], convert_to_tensor=True
        )
        similarity = cosine_similarity(
            embeddings[0].cpu().detach().numpy().reshape(1, -1),
            embeddings[1].cpu().detach().numpy().reshape(1, -1),
        )[0][0]

        return similarity

    def compute_similarity(
        self, target_paper: dict, papers_data: List[dict]
    ) -> List[dict]:
        """
        Compute similarities between target paper and other papers using pairwise comparisons

        Args:
            target_paper: Dict containing 'keywords', 'title', and 'summary' of target paper
            papers_data: List of dicts containing paper info (id, keywords, title, summary)

        Returns:
            List of dicts with paper_id and similarity scores
        """
        # Prepare target texts
        target_keywords_text = " ".join(target_paper["keywords"])
        target_title_text = target_paper["title"]
        target_summary_text = target_paper["summary"]

        results = []

        # Compare target paper with each paper individually
        for paper in papers_data:
            paper_keywords_text = " ".join(paper["keywords"])
            paper_title_text = paper["title"]
            paper_summary_text = paper["summary"]

            # Compute similarities for each feature
            keyword_similarity = self._compute_pairwise_similarity(
                target_keywords_text, paper_keywords_text
            )
            title_similarity = self._compute_pairwise_similarity(
                target_title_text, paper_title_text
            )
            summary_similarity = self._compute_pairwise_similarity(
                target_summary_text, paper_summary_text
            )

            results.append(
                {
                    "paper_id": paper["id"],
                    "title": paper["title"],
                    "relevance_keywords": float(keyword_similarity),
                    "relevance_title": float(title_similarity),
                    "relevance_summary": float(summary_similarity),
                }
            )
        # Limit result to top 5
        results = results[:5]

        # Set negative scores to zero
        results = [
            dict(
                result,
                relevance_keywords=max(0, result["relevance_keywords"]),
                relevance_title=max(0, result["relevance_title"]),
                relevance_summary=max(0, result["relevance_summary"]),
            )
            for result in results
        ]

        return results


@app.post("/get-similarities")
async def get_similarities(target_paper: dict, papers_data: List[dict]):
    """
    Compute similarity scores between target paper and other papers using multiple features
    """
    try:
        recommendation_service = RecommendationService()
        similarity_scores = recommendation_service.compute_similarity(
            target_paper, papers_data
        )
        return similarity_scores
    except Exception as e:
        return {"error": str(e)}
