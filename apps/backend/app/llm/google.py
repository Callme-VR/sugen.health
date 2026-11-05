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

# Fallback models in priority order if Google throws a 503 spike on one model
FALLBACK_MODELS = [
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash",
]


class GoogleLLMClient(LLMClient):
    def __init__(self):
        settings = get_settings()
        self.api_key = settings.LLM_API_KEY
        self.primary_model = settings.LLM_MODEL or "gemini-flash-lite-latest"
        self.client = genai.Client(api_key=self.api_key) if self.api_key else None

    async def analyze(self, note_text: str) -> list[Suggestion]:
        if not self.client:
            logger.warning("Google LLM client initialized without API key. Returning empty suggestions.")
            return []

        prompt = f"Analyze the following synthetic clinical note and extract ICD-11 code suggestions:\n\n{note_text}"

        # Construct candidate models with primary model first
        models_to_try = [self.primary_model] + [m for m in FALLBACK_MODELS if m != self.primary_model]

        for model_name in models_to_try:
            logger.info(f"Attempting analysis using model: {model_name}")
            try:
                response = self.client.models.generate_content(
                    model=model_name,
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
                results = [Suggestion(**item) for item in data.get("suggestions", [])]
                logger.info(f"Successfully generated {len(results)} suggestions with {model_name}")
                return results
            except Exception as e:
                logger.warning(f"Model {model_name} failed: {e}. Trying next candidate...")

        logger.error("All candidate LLM models failed or experienced demand spikes.")
        return []
