from abc import ABC, abstractmethod


class ICDClient(ABC):
    @abstractmethod
    def code_exists(self, code: str) -> bool:
        """Return True if code exists in ICD-11, else False."""

    @abstractmethod
    def lookup(self, code: str) -> str | None:
        """Return the official ICD-11 title for code, or None."""
