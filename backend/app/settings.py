import os


class Settings:
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB: str = os.getenv("MONGO_DB", "rag_chatbot")
    MONGO_COLLECTION: str = os.getenv("MONGO_COLLECTION", "chat_history")

    GEM_API_KEY: str = os.getenv(
        "GEM_API_KEY", "AIzaSyAj5kU6P2eZmB5uHltpEgvBwhfththpgPo"
    )
    VECTORSTORE_PATH: str = os.getenv("VECTORSTORE_PATH", "vectorstore")
    KB_FOLDER: str = os.getenv("KB_FOLDER", "knowledge_base")  # folder with PDFs


settings = Settings()
