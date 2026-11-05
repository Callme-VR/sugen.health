from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ICD_MODE: str = "mock"  # "mock" or "live"
    ICD_CLIENT_ID: str = ""
    ICD_CLIENT_SECRET: str = ""
    ICD_RELEASE: str = "2024-01"

    LLM_PROVIDER: str = "google"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gemini-flash-lite-latest"

    DATA_DIR: str = "./data"
    DECISION_LOG: str = "./data/decisions.jsonl"
    ALLOWED_ORIGIN: str = "http://localhost:3000"


@lru_cache
def get_settings() -> Settings:
    return Settings()
