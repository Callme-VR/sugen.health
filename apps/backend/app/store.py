import json
from pathlib import Path

from app.config import get_settings
from app.models import Decision, DecisionCreate


def _get_log_path() -> Path:
    settings = get_settings()
    log_path = Path(settings.DECISION_LOG)
    log_path.parent.mkdir(parents=True, exist_ok=True)
    return log_path


def append_decision(decision_in: DecisionCreate) -> Decision:
    """Append a decision record to JSONL log. Never logs full note text."""
    decision = Decision(**decision_in.model_dump())
    log_path = _get_log_path()
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(decision.model_dump_json() + "\n")
    return decision


def get_decisions(note_id: str | None = None) -> list[Decision]:
    """Retrieve decisions from the append-only log, optionally filtered by note_id."""
    log_path = _get_log_path()
    if not log_path.exists():
        return []

    results = []
    with open(log_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                data = json.loads(line)
                dec = Decision(**data)
                if note_id is None or dec.note_id == note_id:
                    results.append(dec)
            except Exception:
                continue
    return results
