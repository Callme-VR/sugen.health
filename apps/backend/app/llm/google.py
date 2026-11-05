import json
import logging

from google import genai
from google.genai import types
from pydantic import BaseModel

from app.config import get_settings
from app.llm.base import LLMClient
from app.models import Suggestion

logger = logging.getLogger(__name__)


class SuggestionsWrapper(BaseModel):
    suggestions: list[Suggestion]


SYSTEM_INSTRUCTION = """You are an ICD-11 coding assistant analyzing clinical notes.
Rules:
1. Suggest accurate ICD-11 codes for active diagnoses, conditions, and symptoms described in the note.
2. For every suggestion, you MUST provide an 'evidence_quote' copied verbatim, word-for-word, from the note text.
3. If unsure about a condition or code, DO NOT return a code. Return an empty list instead.
4. Never code a negated condition, a purely hypothetical/differential suspicion, or a family member's condition as the patient's active diagnosis.
5. Provide structured output containing code, title, and evidence_quote.
"""


class GoogleLLMClient(LLMClient):
    def __init__(self):
        self.settings = get_settings()
        api_key = self.settings.LLM_API_KEY
        self.model_name = self.settings.LLM_MODEL or "gemini-2.5-flash"
        self.client = genai.Client(api_key=api_key) if api_key else None

    async def analyze(self, note_text: str) -> list[Suggestion]:
        if not self.client:
            logger.warning("Google LLM client initialized without API key. Returning empty suggestions.")
            return []

        prompt = f"Analyze the following synthetic clinical note and extract ICD-11 code suggestions:\n\n{note_text}"

        # Try once, with one retry on JSON parse failure
        for attempt in range(2):
            try:
                # Use structured JSON schema enforcement
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_INSTRUCTION,
                        response_mime_type="application/json",
                        response_schema=SuggestionsWrapper,
                        temperature=0.0,
                    ),
                )
                text = response.text
                data = json.loads(text)
                return [Suggestion(**item) for item in data.get("suggestions", [])]
            except Exception as e:
                logger.warning(f"Google LLM attempt {attempt+1} error: {e}")
                if attempt == 1:
                    # After retry, return empty or raise structured error
                    return []
        return []
