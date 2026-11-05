from datetime import UTC, datetime
from enum import Enum

from pydantic import BaseModel, Field


class SuggestionStatus(str, Enum):
    VERIFIED = "verified"
    NEEDS_REVIEW = "needs_review"
    REJECTED = "rejected"


class ReasonCode(str, Enum):
    QUOTE_NOT_FOUND = "QUOTE_NOT_FOUND"
    INVALID_CODE = "INVALID_CODE"
    TITLE_MISMATCH = "TITLE_MISMATCH"
    NEGATED = "NEGATED"
    HYPOTHETICAL = "HYPOTHETICAL"
    FAMILY_HISTORY = "FAMILY_HISTORY"
    ICD_UNAVAILABLE = "ICD_UNAVAILABLE"


class DecisionAction(str, Enum):
    APPROVE = "approve"
    EDIT = "edit"
    REJECT = "reject"


class Suggestion(BaseModel):
    code: str = Field(description="Suggested ICD-11 code")
    title: str = Field(description="Clinical title or description according to the LLM")
    evidence_quote: str = Field(description="Exact verbatim excerpt from the clinical note")


class VerifiedSuggestion(Suggestion):
    start: int = Field(default=-1, description="Start character offset of evidence_quote in note")
    end: int = Field(default=-1, description="End character offset of evidence_quote in note")
    status: SuggestionStatus = Field(description="verified, needs_review, or rejected")
    reasons: list[str] = Field(default_factory=list, description="Reason codes triggering status")


class NoteSummary(BaseModel):
    id: str
    title: str


class NoteDetail(BaseModel):
    id: str
    title: str
    text: str


class AnalyzeResponse(BaseModel):
    suggestions: list[VerifiedSuggestion]


class DecisionCreate(BaseModel):
    note_id: str
    code: str
    action: DecisionAction
    edited_code: str | None = None
    reason: str | None = None
    reviewer: str = Field(default="reviewer")


class Decision(DecisionCreate):
    timestamp: str = Field(
        default_factory=lambda: datetime.now(UTC).isoformat()
    )
