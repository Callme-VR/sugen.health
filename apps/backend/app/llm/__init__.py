from app.llm.base import LLMClient
from app.llm.google import GoogleLLMClient

_llm_instance = None


def get_llm_client() -> LLMClient:
    global _llm_instance
    if _llm_instance is None:
        _llm_instance = GoogleLLMClient()
    return _llm_instance
