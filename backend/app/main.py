import os, uuid, shutil
from fastapi import FastAPI, HTTPException, UploadFile, File
from .config import settings
from .db.schemas import ChatRequest, ChatResponse
from app.db.mongo_repo import (
    init_mongo,
    get_or_create_session,
    save_message,
    fetch_history_pairs,
    list_sessions,
    get_session_messages,
)
from .ml_service import EnhancedPDFRAGChatbot


app = FastAPI(title="PDF RAG Chatbot API")


# Global resources
bot = EnhancedPDFRAGChatbot(
    persist_directory=settings.PERSIST_DIR, api_key=settings.GEM_API_KEY
)


a_sync_db = None


@app.on_event("startup")
async def _startup():
    global a_sync_db
    a_sync_db = await init_mongo()


# ---------- Helpers ----------


def _build_enriched_question(history_pairs, new_q: str) -> str:
    if not history_pairs:
        return new_q
    hist_lines = [f"User: {u}\nAssistant: {a}" for (u, a) in history_pairs]
    history_str = "\n\n".join(hist_lines)
    return (
        "Use the chat history to keep continuity. If the answer isn’t in the provided context, say you don’t know.\n"
        f"CHAT HISTORY:\n{history_str}\n\nNEW QUESTION: {new_q}"
    )


# ---------- KB mgmt ----------


@app.post("/index")
async def index_kb(reset: bool = False):
    if not os.path.isdir(settings.KB_FOLDER):
        raise HTTPException(
            400, f"Knowledge base folder not found: {settings.KB_FOLDER}"
        )
    bot.build_vectorstore_from_folder(kb_folder=settings.KB_FOLDER, reset=reset)
    bot.reload()
    return {"status": "ok", "action": "index", "reset": reset}


@app.post("/rebuild")
async def rebuild_kb():
    if not os.path.isdir(settings.KB_FOLDER):
        raise HTTPException(
            400, f"Knowledge base folder not found: {settings.KB_FOLDER}"
        )
    bot.rebuild_knowledge_base(kb_folder=settings.KB_FOLDER)
    bot.reload()
    return {"status": "ok", "action": "rebuild"}


@app.post("/ingest-file")
async def ingest_file(file: UploadFile = File(...), reset: bool = False):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only .pdf files are supported.")
    os.makedirs(settings.KB_FOLDER, exist_ok=True)
    safe_name = f"{uuid.uuid4()}_{file.filename}"
    dest_path = os.path.join(settings.KB_FOLDER, safe_name)
    try:
        with open(dest_path, "wb") as buf:
            shutil.copyfileobj(file.file, buf)
    finally:
        file.file.close()
    bot.build_vectorstore_from_folder(kb_folder=settings.KB_FOLDER, reset=reset)
    bot.reload()
    return {"status": "ok", "added": safe_name, "reset": reset}


# ---------- Chat ----------


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if a_sync_db is None:
        raise HTTPException(500, "Database not initialized")

    # get/create a session
    try:
        session_oid = await get_or_create_session(a_sync_db, req.session_id)
    except ValueError as e:
        raise HTTPException(404, str(e))

    # store user message
    await save_message(a_sync_db, session_oid, "user", req.question)

    # build question with history
    history_pairs = (
        await fetch_history_pairs(a_sync_db, session_oid, req.history_limit)
        if req.use_history
        else []
    )
    enriched_q = _build_enriched_question(history_pairs, req.question)

    # ask RAG
    answer, sources = bot.chat(question=enriched_q, k=req.k, structured=req.structured)

    # store assistant response
    await save_message(a_sync_db, session_oid, "assistant", answer, sources)

    return {"session_id": str(session_oid), "answer": answer, "sources": sources}


# ---------- Sessions ----------


@app.get("/sessions")
async def api_list_sessions():
    if a_sync_db is None:
        raise HTTPException(500, "Database not initialized")
    return await list_sessions(a_sync_db)


@app.get("/sessions/{session_id}/messages")
async def api_get_session_messages(session_id: str):
    if a_sync_db is None:
        raise HTTPException(500, "Database not initialized")
    return await get_session_messages(a_sync_db, session_id)


# ---------- Debug ----------


@app.get("/fs-check")
async def fs_check():
    return {
        "cwd": os.getcwd(),
        "kb_exists": os.path.isdir(settings.KB_FOLDER),
        "kb_path": settings.KB_FOLDER,
        "persist_path": settings.PERSIST_DIR,
        "kb_list": (
            sorted(os.listdir(settings.KB_FOLDER))
            if os.path.isdir(settings.KB_FOLDER)
            else []
        ),
    }
