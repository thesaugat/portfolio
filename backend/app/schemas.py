from pydantic import BaseModel
from typing import Optional, List, Any


class StartSessionResponse(BaseModel):
    session_id: str


class AskRequest(BaseModel):
    session_id: Optional[str] = None
    question: str
    user_id: Optional[str] = "anonymous"
    k: Optional[int] = 6


class AskResponse(BaseModel):
    answer: str
    sources: Optional[str] = None
    reasoning: Optional[str] = None
    session_id: str
    timestamp: str


class KBRebuildResponse(BaseModel):
    status: str
    summary: dict


class ChatMessage(BaseModel):
    session_id: str
    timestamp: str
    user_id: str
    role: str
    message: str
    sources: Optional[str] = None
    reasoning: Optional[str] = None
