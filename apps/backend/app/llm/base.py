from abc import ABC, abstractmethod

from app.models import Suggestion


class LLMClient(ABC):
    @abstractmethod
    async def analyze(self, note_text: str) -> list[Suggestion]:
        """Analyze a clinical note and return a list of ICD-11 Suggestions."""
