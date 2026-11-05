import pytest

from app.models import ReasonCode, Suggestion, SuggestionStatus
from app.verifier import verify_suggestion


class DummyICD:
    def __init__(self, table=None):
        self.table = table or {
            "BA41": "Angina pectoris",
            "5A11": "Type 2 diabetes mellitus",
            "BA00": "Essential hypertension",
            "CA40": "Asthma",
            "DB10": "Acute appendicitis",
            "FA20": "Rheumatoid arthritis",
            "DA60": "Gastric ulcer",
        }

    def code_exists(self, code: str) -> bool:
        return code in self.table

    def lookup(self, code: str) -> str:
        return self.table.get(code)


@pytest.fixture
def icd():
    return DummyICD()


# 1. QUOTE_NOT_FOUND tests (at least 3 cases including near misses)
def test_quote_not_found_completely_missing(icd):
    note = "Patient has essential hypertension and mild cough."
    sug = Suggestion(code="BA00", title="Essential hypertension", evidence_quote="severe headache")
    res = verify_suggestion(sug, note, icd)
    assert res.status == SuggestionStatus.REJECTED
    assert ReasonCode.QUOTE_NOT_FOUND.value in res.reasons
    assert res.start == -1
    assert res.end == -1


def test_quote_not_found_case_difference(icd):
    # Verifier rule requires exact case-sensitive substring
    note = "Patient has essential hypertension."
    sug = Suggestion(code="BA00", title="Essential hypertension", evidence_quote="Essential Hypertension")
    res = verify_suggestion(sug, note, icd)
    assert res.status == SuggestionStatus.REJECTED
    assert ReasonCode.QUOTE_NOT_FOUND.value in res.reasons


def test_quote_not_found_whitespace_difference(icd):
    note = "Patient has essential hypertension."
    sug = Suggestion(code="BA00", title="Essential hypertension", evidence_quote="essential  hypertension")
    res = verify_suggestion(sug, note, icd)
    assert res.status == SuggestionStatus.REJECTED
    assert ReasonCode.QUOTE_NOT_FOUND.value in res.reasons


# 2. INVALID_CODE tests (at least 3 cases)
def test_invalid_code_hallucinated(icd):
    note = "Patient diagnosed with asthma."
    sug = Suggestion(code="ZZ999", title="Asthma", evidence_quote="asthma")
    res = verify_suggestion(sug, note, icd)
    assert res.status == SuggestionStatus.REJECTED
    assert ReasonCode.INVALID_CODE.value in res.reasons


def test_invalid_code_empty(icd):
    note = "Patient diagnosed with asthma."
    sug = Suggestion(code="", title="Asthma", evidence_quote="asthma")
    res = verify_suggestion(sug, note, icd)
    assert res.status == SuggestionStatus.REJECTED
    assert ReasonCode.INVALID_CODE.value in res.reasons


def test_invalid_code_typo(icd):
    note = "Patient diagnosed with asthma."
    sug = Suggestion(code="CA40X", title="Asthma", evidence_quote="asthma")
    res = verify_suggestion(sug, note, icd)
    assert res.status == SuggestionStatus.REJECTED
    assert ReasonCode.INVALID_CODE.value in res.reasons


# 3. TITLE_MISMATCH tests (at least 3 cases)
def test_title_mismatch_completely_unrelated(icd):
    note = "Patient presents with angina pectoris."
    sug = Suggestion(code="BA41", title="Skin rash lesion", evidence_quote="angina pectoris")
    res = verify_suggestion(sug, note, icd)
    assert res.status == SuggestionStatus.NEEDS_REVIEW
    assert ReasonCode.TITLE_MISMATCH.value in res.reasons


def test_title_mismatch_wrong_organ_system(icd):
    note = "Patient has type 2 diabetes mellitus."
    sug = Suggestion(code="5A11", title="Acute heart failure", evidence_quote="type 2 diabetes mellitus")
    res = verify_suggestion(sug, note, icd)
    assert res.status == SuggestionStatus.NEEDS_REVIEW
    assert ReasonCode.TITLE_MISMATCH.value in res.reasons


def test_title_mismatch_partial_words_insufficient(icd):
    note = "Patient presents with acute appendicitis."
    sug = Suggestion(code="DB10", title="Chronic inflammation", evidence_quote="acute appendicitis")
    res = verify_suggestion(sug, note, icd)
    assert res.status == SuggestionStatus.NEEDS_REVIEW
    assert ReasonCode.TITLE_MISMATCH.value in res.reasons


# 4. Context checks: NEGATED (at least 3 cases including subtleties)
def test_negated_denies(icd):
    note = "Patient denies chest pain and denies angina pectoris."
    sug = Suggestion(code="BA41", title="Angina pectoris", evidence_quote="angina pectoris")
    res = verify_suggestion(sug, note, icd)
    assert res.status == SuggestionStatus.NEEDS_REVIEW
    assert ReasonCode.NEGATED.value in res.reasons


def test_negated_no_history_of(icd):
    note = "Patient has no history of asthma."
    sug = Suggestion(code="CA40", title="Asthma", evidence_quote="asthma")
    res = verify_suggestion(sug, note, icd)
    assert res.status == SuggestionStatus.NEEDS_REVIEW
    assert ReasonCode.NEGATED.value in res.reasons


def test_negated_vs_positive_history(icd):
    # positive history should NOT be negated
    note = "Patient has a history of asthma."
    sug = Suggestion(code="CA40", title="Asthma", evidence_quote="asthma")
    res = verify_suggestion(sug, note, icd)
    assert res.status == SuggestionStatus.VERIFIED
    assert ReasonCode.NEGATED.value not in res.reasons


def test_negation_in_multi_condition_note(icd):
    # Note with two conditions where only one is negated
    note = "Patient has essential hypertension. Denies angina pectoris."
    sug_verified = Suggestion(code="BA00", title="Essential hypertension", evidence_quote="essential hypertension")
    res_verified = verify_suggestion(sug_verified, note, icd)
    assert res_verified.status == SuggestionStatus.VERIFIED
    assert ReasonCode.NEGATED.value not in res_verified.reasons

    sug_neg = Suggestion(code="BA41", title="Angina pectoris", evidence_quote="angina pectoris")
    res_neg = verify_suggestion(sug_neg, note, icd)
    assert res_neg.status == SuggestionStatus.NEEDS_REVIEW
    assert ReasonCode.NEGATED.value in res_neg.reasons


# 5. Context checks: HYPOTHETICAL (at least 3 cases)
def test_hypothetical_rule_out(icd):
    note = "Plan: Rule out gastric ulcer."
    sug = Suggestion(code="DA60", title="Gastric ulcer", evidence_quote="gastric ulcer")
    res = verify_suggestion(sug, note, icd)
    assert res.status == SuggestionStatus.NEEDS_REVIEW
    assert ReasonCode.HYPOTHETICAL.value in res.reasons


def test_hypothetical_possible(icd):
    note = "Assessment: Possible acute appendicitis."
    sug = Suggestion(code="DB10", title="Acute appendicitis", evidence_quote="acute appendicitis")
    res = verify_suggestion(sug, note, icd)
    assert res.status == SuggestionStatus.NEEDS_REVIEW
    assert ReasonCode.HYPOTHETICAL.value in res.reasons


def test_hypothetical_differential(icd):
    note = "Differential diagnosis includes angina pectoris."
    sug = Suggestion(code="BA41", title="Angina pectoris", evidence_quote="angina pectoris")
    res = verify_suggestion(sug, note, icd)
    assert res.status == SuggestionStatus.NEEDS_REVIEW
    assert ReasonCode.HYPOTHETICAL.value in res.reasons


# 6. Context checks: FAMILY_HISTORY (at least 3 cases)
def test_family_history_mother(icd):
    note = "Mother had rheumatoid arthritis."
    sug = Suggestion(code="FA20", title="Rheumatoid arthritis", evidence_quote="rheumatoid arthritis")
    res = verify_suggestion(sug, note, icd)
    assert res.status == SuggestionStatus.NEEDS_REVIEW
    assert ReasonCode.FAMILY_HISTORY.value in res.reasons


def test_family_history_father(icd):
    note = "Father diagnosed with type 2 diabetes mellitus at age 60."
    sug = Suggestion(code="5A11", title="Type 2 diabetes mellitus", evidence_quote="type 2 diabetes mellitus")
    res = verify_suggestion(sug, note, icd)
    assert res.status == SuggestionStatus.NEEDS_REVIEW
    assert ReasonCode.FAMILY_HISTORY.value in res.reasons


def test_family_history_explicit_phrase(icd):
    note = "Family history of asthma noted in chart."
    sug = Suggestion(code="CA40", title="Asthma", evidence_quote="asthma")
    res = verify_suggestion(sug, note, icd)
    assert res.status == SuggestionStatus.NEEDS_REVIEW
    assert ReasonCode.FAMILY_HISTORY.value in res.reasons


# 7. Fully verified condition
def test_fully_verified_condition(icd):
    note = "Patient presents with confirmed acute appendicitis."
    sug = Suggestion(code="DB10", title="Acute appendicitis", evidence_quote="acute appendicitis")
    res = verify_suggestion(sug, note, icd)
    assert res.status == SuggestionStatus.VERIFIED
    assert len(res.reasons) == 0
    assert res.start == note.index("acute appendicitis")
    assert res.end == res.start + len("acute appendicitis")
