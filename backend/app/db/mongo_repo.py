# app/db/mongo_repo.py
import datetime
from typing import List, Tuple, Dict, Any, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ReturnDocument
from ..config import settings

_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


async def init_mongo() -> AsyncIOMotorDatabase:
    global _client, _db
    if _db is None:
        _client = AsyncIOMotorClient(settings.MONGO_URI)
        _db = _client[settings.DB_NAME]
        await ensure_indexes(_db)
    return _db


async def ensure_indexes(db: AsyncIOMotorDatabase) -> None:
    await db["sessions"].create_index([("last_activity_at", -1)])
    # Unique only when the field exists (prevents conflicts on missing field)
    await db["sessions"].create_index(
        [("session_key", 1)],
        unique=True,
        partialFilterExpression={"session_key": {"$exists": True}},
        name="uniq_session_key_if_present",
    )
    await db["messages"].create_index([("session_id", 1), ("created_at", 1)])


def _is_valid_object_id(val: str) -> bool:
    if not isinstance(val, str) or len(val) != 24:
        return False
    try:
        ObjectId(val)
        return True
    except Exception:
        return False


async def get_or_create_session(
    db: AsyncIOMotorDatabase, session_id: Optional[str]
) -> ObjectId:
    now = datetime.datetime.utcnow()

    # No id provided → create new session
    if not session_id:
        res = await db["sessions"].insert_one(
            {"created_at": now, "last_activity_at": now, "meta": {}}
        )
        return res.inserted_id

    # If a canonical Mongo ObjectId was provided
    if _is_valid_object_id(session_id):
        oid = ObjectId(session_id)
        doc = await db["sessions"].find_one({"_id": oid})
        if not doc:
            raise ValueError("Session not found")
        return oid

    # Otherwise treat as external key (e.g., UUID) and upsert atomically
    doc = await db["sessions"].find_one_and_update(
        {"session_key": session_id},
        {
            "$setOnInsert": {
                "created_at": now,
                "last_activity_at": now,
                "meta": {},
                "session_key": session_id,
            }
        },
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return doc["_id"]


async def save_message(
    db: AsyncIOMotorDatabase,
    session_oid: ObjectId,
    role: str,
    content: str,
    sources: Optional[List[Dict[str, Any]]] = None,
) -> None:
    now = datetime.datetime.utcnow()
    await db["messages"].insert_one(
        {
            "session_id": session_oid,
            "role": role,
            "content": content,
            "sources": sources or [],
            "created_at": now,
        }
    )
    await db["sessions"].update_one(
        {"_id": session_oid}, {"$set": {"last_activity_at": now}}
    )


async def fetch_history_pairs(
    db: AsyncIOMotorDatabase, session_oid: ObjectId, limit_pairs: int
) -> List[Tuple[str, str]]:
    cur = db["messages"].find({"session_id": session_oid}).sort("created_at", 1)
    convo = await cur.to_list(length=2000)
    pairs: List[Tuple[str, str]] = []
    last_user: Optional[str] = None
    for m in convo:
        if m["role"] == "user":
            last_user = m["content"]
        elif m["role"] == "assistant" and last_user is not None:
            pairs.append((last_user, m["content"]))
            last_user = None
    return pairs[-limit_pairs:]


async def list_sessions(db: AsyncIOMotorDatabase) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    async for s in db["sessions"].find().sort("last_activity_at", -1):
        out.append(
            {
                "session_id": str(s["_id"]),  # canonical id
                "external_key": s.get("session_key"),  # if client used a UUID
                "created_at": s.get("created_at"),
                "last_activity_at": s.get("last_activity_at"),
                "title": s.get("title"),
            }
        )
    return out


async def get_session_messages(
    db: AsyncIOMotorDatabase, session_id: str
) -> List[Dict[str, Any]]:
    # Here we *expect* the canonical ObjectId string
    if not _is_valid_object_id(session_id):
        raise ValueError("Invalid session_id; must be a 24-char hex ObjectId")
    oid = ObjectId(session_id)
    out: List[Dict[str, Any]] = []
    async for m in db["messages"].find({"session_id": oid}).sort("created_at", 1):
        out.append(
            {
                "role": m["role"],
                "content": m["content"],
                "sources": m.get("sources", []),
                "created_at": m.get("created_at"),
            }
        )
    return out
