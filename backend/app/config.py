import os


class Settings:
    GEM_API_KEY: str = os.getenv("gem_api_key", "default_key")
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://mongo:27017")
    DB_NAME: str = os.getenv("DB_NAME", "ragdb")
    KB_FOLDER: str = os.getenv("KB_FOLDER", "/data/knowledge_base")
    PERSIST_DIR: str = os.getenv("PERSIST_DIR", "/data/kb_chroma")


settings = Settings()
