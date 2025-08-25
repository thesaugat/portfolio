from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class AnswerWithSources(BaseModel):
    """Structured answer from the LLM with provenance."""

    answer: str = Field(description="Answer to question")
    sources: str = Field(description="Full direct text used from context")
    reasoning: str = Field(description="Reasoning based on the sources")


class ChatRequest(BaseModel):
    question: str
    session_id: Optional[str] = None
    k: int = 6
    structured: bool = False
    use_history: bool = True
    history_limit: int = 8


class ChatResponse(BaseModel):
    session_id: str
    answer: str
    sources: List[Dict[str, Any]]


class MessageOut(BaseModel):
    role: str
    content: str
    sources: List[Dict[str, Any]] = []
    created_at: Optional[str] = None


class SessionOut(BaseModel):
    session_id: str
    created_at: Optional[str]
    last_activity_at: Optional[str]
    title: Optional[str] = None
