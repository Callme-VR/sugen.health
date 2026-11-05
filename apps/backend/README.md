# ⚙️ ICD-11 Assistant — Backend API Engine

Production-ready FastAPI service delivering deterministic pre-review verification, Google Gemini extraction with multi-model failover, and append-only decision audit logging.

[![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.162.0-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Pydantic](https://img.shields.io/badge/Pydantic-v2.14-E92063?style=flat-square&logo=pydantic&logoColor=white)](https://docs.pydantic.dev)
[![Tests](https://img.shields.io/badge/Tests-27_Passed-10B981?style=flat-square&logo=pytest&logoColor=white)](https://docs.pytest.org)

---

## 🏗️ Architecture & Modules

```
backend/
├── app/
│   ├── main.py          # FastAPI application, CORS, and endpoint definitions
│   ├── config.py        # Settings via pydantic-settings (.env management)
│   ├── models.py        # Pydantic v2 domain schemas (Suggestion, Decision, etc.)
│   ├── triggers.py      # Trigger phrase dictionaries (Negation, Family, Rule-Out)
│   ├── verifier.py      # Pure deterministic verification pipeline
│   ├── store.py         # Append-only JSONL decision log engine
│   ├── llm/
│   │   ├── base.py      # Abstract LLM client interface
│   │   └── google.py    # Google GenAI client with multi-model fallback cascade
│   └── icd/
│       ├── base.py      # Abstract ICD client interface
│       ├── mock.py      # High-performance local table lookup (25+ confirmed codes)
│       └── client.py    # Live WHO ICD API client (OAuth 2.0 + token cache)
├── data/
│   ├── notes/           # 30 synthetic clinical notes (.txt)
│   ├── labels.json      # Ground truth labels with tags
│   └── mock_icd.json    # Confirmed ICD-11 classification table
├── eval/
│   ├── run_eval.py      # Benchmark evaluation script
│   └── cache/           # SHA-256 replay cache
└── tests/
    ├── test_verifier.py # Near-misses, case, whitespace, negation tests
    ├── test_api.py      # FastAPI endpoint integration tests
    └── test_icd_live.py # Respx mock tests for WHO OAuth 2.0 client
```

---

## 🛡️ Multi-Model Fallback Cascade

To eliminate HTTP 503 capacity errors and latency spikes, `app/llm/google.py` implements an automated cascade:

```python
FALLBACK_MODELS = [
    "gemini-flash-lite-latest",  # 1st priority: lowest latency (<1.2s)
    "gemini-3.1-flash-lite",    # 2nd priority: next-gen lightweight
    "gemini-2.5-flash",         # 3rd priority: standard fallback
]
```

If one model encounters a provider demand spike, the engine immediately and seamlessly tries the next candidate before returning a structured response to the clinician.

---

## 🔌 API Endpoints Reference

| Endpoint | Method | Purpose | Response |
|---|---|---|---|
| `/health` | `GET` | Service liveness probe | `{"status": "ok"}` |
| `/notes` | `GET` | List available synthetic encounters | `[{"id": "...", "title": "..."}]` |
| `/notes/{id}` | `GET` | Fetch single encounter note text | `{"id": "...", "title": "...", "text": "..."}` |
| `/notes/{id}/analyze` | `POST` | Extract candidates & run verifier | `{"suggestions": [VerifiedSuggestion]}` |
| `/decisions` | `POST` | Record reviewer decision | `Decision` |
| `/decisions` | `GET` | Fetch decision log (`?note_id=`) | `[Decision]` |

---

## 🧪 Testing & Quality Assurance

```bash
# Run 27 pytest test suites (unit tests, near-misses, mock HTTP)
uv run pytest

# Check code formatting and import order with Ruff
uv run ruff check .

# Run automated evaluation benchmark
uv run python eval/run_eval.py
```
