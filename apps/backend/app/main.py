from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.models import (
    AnalyzeResponse,
    Decision,
    DecisionCreate,
    NoteDetail,
    NoteSummary,
)

settings = get_settings()

app = FastAPI(
    title="Evidence-Checked ICD-11 Coding Assistant",
    description="Demo backend on synthetic clinical data with zero trust in LLM output.",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.ALLOWED_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


def _get_notes_dir() -> Path:
    return Path(settings.DATA_DIR) / "notes"


@app.get("/notes", response_model=List[NoteSummary])
def list_notes():
    notes_dir = _get_notes_dir()
    if not notes_dir.exists():
        return []

    notes = []
    for file_path in sorted(notes_dir.glob("*.txt")):
        note_id = file_path.stem
        title = note_id.replace("_", " ").title()
        try:
            content = file_path.read_text(encoding="utf-8")
            valid_lines = [line.strip() for line in content.splitlines() if line.strip()]
            if valid_lines:
                first_line = valid_lines[0].rstrip(":")
                title = f"{note_id}: {first_line[:50]}"
        except Exception:
            pass
        notes.append(NoteSummary(id=note_id, title=title))
    return notes


@app.get("/notes/{note_id}", response_model=NoteDetail)
def get_note(note_id: str):
    notes_dir = _get_notes_dir()
    file_path = notes_dir / f"{note_id}.txt"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Note '{note_id}' not found")

    content = file_path.read_text(encoding="utf-8")
    title = note_id.replace("_", " ").title()
    valid_lines = [line.strip() for line in content.splitlines() if line.strip()]
    if valid_lines:
        title = f"{note_id}: {valid_lines[0].rstrip(':')[:50]}"

    return NoteDetail(id=note_id, title=title, text=content)


@app.post("/notes/{note_id}/analyze", response_model=AnalyzeResponse)
async def analyze_note(note_id: str):
    from app.icd import get_icd_client
    from app.llm import get_llm_client
    from app.verifier import verify_suggestion

    note = get_note(note_id)
    llm = get_llm_client()
    icd = get_icd_client()

    raw_suggestions = await llm.analyze(note.text)
    verified = [
        verify_suggestion(sug, note.text, icd)
        for sug in raw_suggestions
    ]
    return AnalyzeResponse(suggestions=verified)


@app.post("/decisions", response_model=Decision)
def create_decision(decision: DecisionCreate):
    from app.store import append_decision
    return append_decision(decision)


@app.get("/decisions", response_model=List[Decision])
def list_decisions(note_id: Optional[str] = Query(None)):
    from app.store import get_decisions
    return get_decisions(note_id)
