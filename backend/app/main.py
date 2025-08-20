import uuid
from fastapi import FastAPI, HTTPException, Query
from typing import Optional
from app.schemas import StartSessionResponse, AskRequest, AskResponse, KBRebuildResponse
from app.settings import settings
from app.rag_chatbot import EnhancedPDFRAGChatbot

app = FastAPI(title="RAG Chatbot API")

bot = EnhancedPDFRAGChatbot(
    mongo_uri=settings.MONGO_URI,
    mongo_db=settings.MONGO_DB,
    mongo_collection=settings.MONGO_COLLECTION,
    api_key=settings.GEM_API_KEY,
    vectorstore_path=settings.VECTORSTORE_PATH,
)


@app.get("/start-session", response_model=StartSessionResponse)
def start_session():
    return {"session_id": str(uuid.uuid4())}


@app.post("/ask", response_model=AskResponse)
async def ask(req: AskRequest):
    try:
        session_id = req.session_id or str(uuid.uuid4())
        result = await bot.ask_question(
            session_id=session_id,
            question=req.question,
            user_id=req.user_id or "anonymous",
            k=req.k or 6,
        )
        return AskResponse(
            answer=result["answer"],
            sources=result.get("sources"),
            reasoning=result.get("reasoning"),
            session_id=session_id,
            timestamp=result["timestamp"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/rebuild-kb", response_model=KBRebuildResponse)
def rebuild_kb(folder: Optional[str] = None):
    try:
        summary = bot.rebuild_knowledge_base(folder or settings.KB_FOLDER)
        return {"status": "rebuilt", "summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/chat-history/{session_id}")
async def get_chat_history(session_id: str, limit: int = 200):
    cursor = (
        bot.chat_collection.find({"session_id": session_id})
        .sort("timestamp", 1)
        .limit(limit)
    )
    return await cursor.to_list(length=limit)
