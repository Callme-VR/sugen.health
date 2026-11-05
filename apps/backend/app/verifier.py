import re
from typing import Any, Protocol

from app.models import ReasonCode, Suggestion, SuggestionStatus, VerifiedSuggestion
from app.triggers import (
    FAMILY_HISTORY_TRIGGERS,
    HYPOTHETICAL_TRIGGERS,
    NEGATION_TRIGGERS,
)


class ICDLookupProtocol(Protocol):
    def code_exists(self, code: str) -> bool: ...
    def lookup(self, code: str) -> str: ...


def _tokenize(text: str) -> set:
    """Normalize text into lower-case alphanumeric tokens."""
    return set(re.findall(r"\b\w+\b", text.lower()))


def _compute_title_overlap(official_title: str, llm_title: str) -> float:
    """Compute word overlap ratio (Jaccard-like or directional)."""
    t1 = _tokenize(official_title)
    t2 = _tokenize(llm_title)
    if not t1 or not t2:
        return 0.0
    common = t1.intersection(t2)
    # Check what proportion of official title words or LLM title words match
    return max(len(common) / len(t1), len(common) / len(t2))


def _extract_preceding_clause(note: str, start_offset: int) -> str:
    """Extract the clause or sentence leading up to the quote in the same sentence.
    Clauses are bounded by sentence terminators (., !, ?, newline) or clause boundaries (;, comma occasionally).
    """
    preceding_text = note[:start_offset]
    # Find last sentence boundary
    boundaries = [m.end() for m in re.finditer(r"[\n\.\!\?]", preceding_text)]
    sentence_start = boundaries[-1] if boundaries else 0
    sentence_clause = preceding_text[sentence_start:].strip()
    return sentence_clause


def _contains_trigger_phrase(clause: str, trigger_list: list[str]) -> bool:
    """Check if any trigger phrase from trigger_list appears as whole words in clause."""
    lower_clause = clause.lower()
    for trigger in trigger_list:
        # Match as whole phrase / word boundary
        pattern = r"\b" + re.escape(trigger.lower()) + r"\b"
        if re.search(pattern, lower_clause):
            return True
    return False


def verify_suggestion(
    suggestion: Suggestion,
    note_text: str,
    icd_client: Any,
) -> VerifiedSuggestion:
    """Pure verifier function. Applies deterministic checks in strict order:
    1. QUOTE_NOT_FOUND
    2. INVALID_CODE
    3. TITLE_MISMATCH
    4. Context checks on the clause containing the quote (NEGATED, HYPOTHETICAL, FAMILY_HISTORY)
    5. Otherwise VERIFIED
    """
    reasons: list[str] = []

    # 1. QUOTE_NOT_FOUND: exact case-sensitive substring
    quote = suggestion.evidence_quote
    if not quote or quote not in note_text:
        return VerifiedSuggestion(
            code=suggestion.code,
            title=suggestion.title,
            evidence_quote=suggestion.evidence_quote,
            start=-1,
            end=-1,
            status=SuggestionStatus.REJECTED,
            reasons=[ReasonCode.QUOTE_NOT_FOUND.value],
        )

    start = note_text.index(quote)
    end = start + len(quote)

    # 2. INVALID_CODE: code must exist in ICD
    try:
        exists = icd_client.code_exists(suggestion.code)
    except Exception:
        # Fail closed on ICD error
        return VerifiedSuggestion(
            code=suggestion.code,
            title=suggestion.title,
            evidence_quote=suggestion.evidence_quote,
            start=start,
            end=end,
            status=SuggestionStatus.NEEDS_REVIEW,
            reasons=[ReasonCode.ICD_UNAVAILABLE.value],
        )

    if not exists:
        return VerifiedSuggestion(
            code=suggestion.code,
            title=suggestion.title,
            evidence_quote=suggestion.evidence_quote,
            start=start,
            end=end,
            status=SuggestionStatus.REJECTED,
            reasons=[ReasonCode.INVALID_CODE.value],
        )

    # 3. TITLE_MISMATCH: official title check
    official_title = icd_client.lookup(suggestion.code) or ""
    overlap = _compute_title_overlap(official_title, suggestion.title)
    if overlap < 0.30:  # configurable threshold
        reasons.append(ReasonCode.TITLE_MISMATCH.value)

    # 4. Context checks on preceding clause
    clause = _extract_preceding_clause(note_text, start)

    # Special handling: "history of" vs "no history of"
    if _contains_trigger_phrase(clause, NEGATION_TRIGGERS):
        reasons.append(ReasonCode.NEGATED.value)

    if _contains_trigger_phrase(clause, HYPOTHETICAL_TRIGGERS):
        reasons.append(ReasonCode.HYPOTHETICAL.value)

    if _contains_trigger_phrase(clause, FAMILY_HISTORY_TRIGGERS):
        reasons.append(ReasonCode.FAMILY_HISTORY.value)

    # Determine final status
    if reasons:
        status = SuggestionStatus.NEEDS_REVIEW
    else:
        status = SuggestionStatus.VERIFIED

    return VerifiedSuggestion(
        code=suggestion.code,
        title=suggestion.title,
        evidence_quote=suggestion.evidence_quote,
        start=start,
        end=end,
        status=status,
        reasons=reasons,
    )
