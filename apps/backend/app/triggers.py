"""Trigger definitions for deterministic clinical verifier.
Rule-based matching on clauses preceding evidence quotes.
"""

# Negation indicators
NEGATION_TRIGGERS = [
    "no",
    "denies",
    "denied",
    "denying",
    "without",
    "negative for",
    "absence of",
    "ruled out",
    "rules out",
    "not present",
    "free of",
    "never had",
    "no evidence of",
    "no history of",
]

# Hypothetical, differential, or uncertain mentions
HYPOTHETICAL_TRIGGERS = [
    "possible",
    "possibly",
    "suspected",
    "suspicion of",
    "rule out",
    "r/o",
    "query",
    "differential",
    "evaluate for",
    "consider",
    "unlikely",
    "potential",
]

# Family history indicators
FAMILY_HISTORY_TRIGGERS = [
    "mother",
    "father",
    "parent",
    "parents",
    "brother",
    "sister",
    "sibling",
    "siblings",
    "maternal",
    "paternal",
    "grandmother",
    "grandfather",
    "family history",
    "family history of",
    "fhx",
    "fh:",
]

