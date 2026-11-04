# ICD-11 Assistant — Backend API

FastAPI backend for the evidence-checked ICD-11 coding assistant. Implements the LLM suggestion pipeline (Google Gemini), deterministic verification engine, mock/live WHO ICD-11 clients, and append-only decision logging.

> **Note:** Operates exclusively on synthetic clinical notes. Contains zero real patient data.

---

## Architecture & Responsibilities

- **`app/main.py`**: FastAPI application with CORS restricted to `ALLOWED_ORIGIN`.
- **`app/config.py`**: Pydantic `BaseSettings` reading environment variables from `.env`.
- **`app/models.py`**: Pydantic v2 schemas:
  - `Suggestion` (`code`, `title`, `evidence_quote`)
  - `VerifiedSuggestion` (`Suggestion` + `start`, `end`, `status`, `reasons`)
  - `Decision` (`note_id`, `code`, `action`, `edited_code`, `reason`, `reviewer`, `timestamp`)
- **`app/verifier.py`**: Deterministic verification pipeline (pure functions; no external network dependency except injected ICD client):
  1. `QUOTE_NOT_FOUND`: Exact case-sensitive substring matching against the note.
  2. `INVALID_CODE`: ICD-11 code validation against local mock dataset or WHO ICD API.
  3. `TITLE_MISMATCH`: Word overlap ratio check between LLM title and official title.
  4. Context checks on the clause containing the quote:
     - `NEGATED` (*no, denies, without, negative for, absence of, ruled out*)
     - `HYPOTHETICAL` (*possible, suspected, rule out, query, differential*)
     - `FAMILY_HISTORY` (*mother, father, sibling, family history of*)
- **`app/llm/`**: Interface `LLMClient` with structured output parsing and retry mechanism. Implemented with Google GenAI (`gemini-2.5-flash`).
- **`app/icd/`**:
  - `MockICD`: Fast local lookup against `data/mock_icd.json`.
  - `LiveICD`: WHO ICD API OAuth 2.0 client with token caching and fail-closed handling (`ICD_UNAVAILABLE`).
- **`app/store.py`**: Append-only JSONL log (`data/decisions.jsonl`). Never logs full note text.
- **`eval/`**: Synthetic evaluation benchmark (`run_eval.py`) with record-and-replay cache (`eval/cache/`).

---

## API Endpoints

| Endpoint | Method | Purpose | Returns |
|---|---|---|---|
| `/health` | `GET` | Health / Liveness check | `{"status": "ok"}` |
| `/notes` | `GET` | List synthetic clinical notes | `[{"id": "...", "title": "..."}]` |
| `/notes/{id}` | `GET` | Retrieve full synthetic note | `{"id": "...", "title": "...", "text": "..."}` |
| `/notes/{id}/analyze` | `POST` | Run LLM extraction + deterministic verifier | `{"suggestions": [VerifiedSuggestion]}` |
| `/decisions` | `POST` | Record reviewer action (`approve`, `edit`, `reject`) | `Decision` |
| `/decisions` | `GET` | List decisions filtered by `?note_id=` | `[Decision]` |

---

## Local Development & Setup

Managed with [`uv`](https://github.com/astral-sh/uv).

### 1. Environment Configuration

```bash
cp .env.example .env
```

Configure `.env`:
```env
ICD_MODE=mock
ICD_CLIENT_ID=
ICD_CLIENT_SECRET=
ICD_RELEASE=
LLM_PROVIDER=google
LLM_API_KEY=your_gemini_api_key
LLM_MODEL=gemini-2.5-flash
DATA_DIR=./data
DECISION_LOG=./data/decisions.jsonl
ALLOWED_ORIGIN=http://localhost:3000
```

### 2. Run Server

```bash
uv run uvicorn app.main:app --reload --port 8000
```

---

## Testing & Linting

```bash
# Run pytest suite (pure mock tests, zero external calls)
uv run pytest

# Run Ruff linter and formatter check
uv run ruff check .
```

