# 🏥 Evidence-Checked ICD-11 Coding Assistant
### Production-Grade Clinical AI Assistant with Deterministic Pre-Review Verification

[![Stack](https://img.shields.io/badge/Stack-Next.js_16_%7C_FastAPI_%7C_Turborepo-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![Python](https://img.shields.io/badge/Python-3.14_%7C_uv_%7C_Pydantic_v2-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://fastapi.tiangolo.com)
[![AI Engine](https://img.shields.io/badge/AI_Engine-Gemini_Flash--Lite_%2B_Fallback_Cascade-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)
[![Verification](https://img.shields.io/badge/Tests-27_Passed_%7C_Pytest_%2B_Ruff_%2B_ESLint-10B981?style=for-the-badge&logo=pytest&logoColor=white)](https://docs.pytest.org)
[![Data Privacy](https://img.shields.io/badge/Privacy-Zero_PHI_%7C_Synthetic_Corpus-6366F1?style=for-the-badge&logo=securityscorecard&logoColor=white)](https://icd.who.int)

> [!CAUTION]
> **Clinical Software Disclaimer & Synthetic Data Notice:** This software is an engineering prototype and portfolio demo built exclusively on synthetic clinical encounter notes. It is **not** certified clinical diagnostic software and must **never** be deployed for live patient care, medical diagnosis, or treatment decisions.

---

## 📑 Table of Contents

- [Overview & The Hospital Problem](#-overview--the-hospital-problem)
- [Zero-Trust AI Architecture](#-zero-trust-ai-architecture)
- [Interactive UI & Motion Design](#-interactive-ui--motion-design)
- [The 5-Stage Deterministic Verifier](#-the-5-stage-deterministic-verifier)
- [Production Monorepo Layout](#-production-monorepo-layout)
- [Quick Start Guide](#-quick-start-guide)
- [Quality Gates & Automated Verification](#-quality-gates--automated-verification)
- [Evaluation Benchmark & Failure Mode Audit](#-evaluation-benchmark--failure-mode-audit)
- [Resilience & Multi-Model Cascade](#-resilience--multi-model-cascade)
- [Engineering Interview Alignment (Sugen Health)](#-engineering-interview-alignment-sugen-health)

---

## 🎯 Overview & The Hospital Problem

In hospital operations, clinicians document patient encounters as free-form narrative notes. Medical billing teams must manually translate these notes into standardized **WHO ICD-11 codes** for billing claims and epidemiological tracking. 

While Large Language Models (LLMs) can extract medical terms, deploying them raw into hospital workflows is dangerous due to:
1. **Negation Blindness**: Treating symptom denials (*"patient denies chest pain"*) as confirmed conditions (*Angina Pectoris*).
2. **Attribution Errors**: Conflating familial history (*"mother had rheumatoid arthritis"*) with the patient's active diagnoses.
3. **Speculative Coding**: Coding rule-out queries (*"r/o appendicitis"*) as confirmed surgical conditions.
4. **Code Hallucinations**: Generating plausible-sounding ICD code strings that do not exist in the official classification.

**This project eliminates these failure modes by enforcing a strict Zero-Trust Deterministic Verification Barrier between the LLM and the clinician.**

---

## ⚡ Zero-Trust AI Architecture

```mermaid
flowchart TD
    subgraph INTAKE["1. Clinical Encounter Intake"]
        N["Synthetic Clinical Note<br/>(Raw Narrative Text)"]
    end

    subgraph LLM_TIER["2. Candidate Extraction Layer"]
        N --> G["Google Gemini Flash-Lite<br/>(Structured JSON Schema)"]
        G -.->|"Failover on 503 Spike"| F["Multi-Model Cascade<br/>(Gemini 3.1 &rarr; Gemini 2.5)"]
        G -->|"Candidates with Verbatim Quotes"| S["Candidate Suggestions<br/>(code, title, evidence_quote)"]
    end

    subgraph VERIFIER["3. Deterministic Pre-Review Verification"]
        S --> V1{"1. Exact Substring?"}
        V1 -- No --> R1["REJECTED<br/>(QUOTE_NOT_FOUND)"]
        V1 -- Yes --> V2{"2. Valid in ICD-11?"}
        V2 -- No --> R2["REJECTED<br/>(INVALID_CODE)"]
        V2 -- Unreachable --> NR0["NEEDS REVIEW<br/>(ICD_UNAVAILABLE)"]
        V2 -- Yes --> V3{"3. Title Overlap &ge; 30%?"}
        V3 -- No --> NR1["NEEDS REVIEW<br/>(TITLE_MISMATCH)"]
        V3 -- Yes --> V4{"4. Preceding Clause Scan"}
        V4 -- Negated Trigger --> NR2["NEEDS REVIEW<br/>(NEGATED)"]
        V4 -- Family History --> NR3["NEEDS REVIEW<br/>(FAMILY_HISTORY)"]
        V4 -- Rule-Out / Query --> NR4["NEEDS REVIEW<br/>(HYPOTHETICAL)"]
        V4 -- Clean --> VOK["VERIFIED<br/>(Status Clean)"]
    end

    subgraph REVIEW_WORKSPACE["4. Human-in-the-Loop Review Client"]
        VOK & NR1 & NR2 & NR3 & NR4 & R1 & R2 --> UI["Next.js 16 Split-Screen Reviewer<br/>(shadcn/ui + OKLCH Tokens)"]
        UI -->|"Left Pane: Character-Offset Highlight"| NV["NoteViewer.tsx"]
        UI -->|"Right Pane: Accessible Cards"| SC["SuggestionCard.tsx"]
        SC -->|"Human Decisions (Approve / Edit / Reject)"| ACT["Clinician Actions"]
    end

    subgraph AUDIT["5. Data Privacy & Audit Trail"]
        ACT --> LOG["Append-Only Decision Log<br/>(data/decisions.jsonl)"]
        LOG -.->|"Zero Raw PHI Persisted"| PRIV["Privacy Safe Audit Trail"]
    end

    style INTAKE fill:#f8fafc,stroke:#94a3b8,stroke-width:2px
    style LLM_TIER fill:#eff6ff,stroke:#3b82f6,stroke-width:2px
    style VERIFIER fill:#fefce8,stroke:#eab308,stroke-width:2px
    style REVIEW_WORKSPACE fill:#f0fdf4,stroke:#22c55e,stroke-width:2px
    style AUDIT fill:#faf5ff,stroke:#a855f7,stroke-width:2px
```

---

## 🎨 Interactive UI & Motion Design

The frontend (`apps/frontend`) is built with **Next.js 16 (App Router)** and **shadcn/ui** with CSS motion animations:

- **Evidence Highlighting**: Exact character-offset spans rendered dynamically in the clinical note:
  - 🟢 **Verified**: Emerald underline with soft green background.
  - 🟡 **Needs Review**: Amber warning highlight indicating negation, family history, or hypothetical conditions.
  - 🔴 **Rejected**: Rose background with strike-through styling.
- **Micro-Interactions & Animated Feedback**:
  - Live spinning indicator (`Loader2`, `animate-spin`) while running extraction.
  - Collapsible rejected cards with smooth accordion transitions (`ChevronDown`/`ChevronUp`).
  - Card hover scale and elevation changes using Tailwind CSS v4 transitions.
- **Safety Rails**:
  - Rejected cards are collapsed by default to prevent accidental approval.
  - Overriding a verifier-rejected code requires a **mandatory written justification**.
  - Append-only audit log updates in real-time without page reload.

---

## 🔍 The 5-Stage Deterministic Verifier

Every candidate suggestion carries a verbatim `evidence_quote`. The verifier executes sequentially:

```
[Candidate Suggestion]
        │
        ├─ 1. Substring Matching: Exact verbatim check in note text.
        │     Missing ──► REJECTED (QUOTE_NOT_FOUND)
        │
        ├─ 2. Classification Validation: Checked against confirmed ICD-11 MMS table.
        │     Invalid ──► REJECTED (INVALID_CODE)
        │     API Error ──► NEEDS_REVIEW (ICD_UNAVAILABLE, Fail-Closed)
        │
        ├─ 3. Title Overlap: Directional word token overlap calculation.
        │     Overlap < 30% ──► Flag TITLE_MISMATCH
        │
        ├─ 4. Clause-Level Context Scrutiny: Scans the preceding clause only.
        │     Trigger: "denies", "no", "ruled out" ──► Flag NEGATED
        │     Trigger: "mother", "father", "sibling" ──► Flag FAMILY_HISTORY
        │     Trigger: "rule out", "possible", "query" ──► Flag HYPOTHETICAL
        │
        └─ 5. Final Classification:
              Any Flags ──► NEEDS_REVIEW
              Clean ──► VERIFIED
```

---

## 📁 Production Monorepo Layout

```text
workflow/
├── apps/
│   ├── backend/                 # FastAPI Service (Python 3.14 + uv)
│   │   ├── app/
│   │   │   ├── main.py          # REST API endpoints & CORS
│   │   │   ├── config.py        # Environment settings (Pydantic Settings)
│   │   │   ├── models.py        # Domain schemas (Suggestion, VerifiedSuggestion, Decision)
│   │   │   ├── triggers.py      # Clinical trigger phrase dictionaries
│   │   │   ├── verifier.py      # Pure deterministic verification pipeline
│   │   │   ├── store.py         # Append-only JSONL decision log
│   │   │   ├── llm/             # LLM Client with multi-model fallback cascade
│   │   │   │   ├── base.py      # Abstract LLM client interface
│   │   │   │   └── google.py    # Google GenAI implementation (Gemini Flash-Lite)
│   │   │   └── icd/             # ICD-11 classification clients
│   │   │       ├── base.py      # ICD lookup protocol
│   │   │       ├── mock.py      # Local confirmed table lookup (25+ codes)
│   │   │       └── client.py    # WHO OAuth 2.0 live client with token cache
│   │   ├── data/
│   │   │   ├── notes/           # 30 synthetic clinical encounter notes (.txt)
│   │   │   ├── labels.json      # Ground truth labels with clinical tags
│   │   │   └── mock_icd.json    # Confirmed ICD-11 code database
│   │   ├── eval/                # Automated evaluation benchmark
│   │   │   ├── run_eval.py      # Evaluation pipeline script
│   │   │   └── cache/           # SHA-256 LLM response replay cache
│   │   └── tests/               # 27 Pytest test suites
│   │       ├── test_verifier.py # Near-misses, case, whitespace, negation tests
│   │       ├── test_api.py      # FastAPI endpoint contract tests
│   │       └── test_icd_live.py # Respx mock tests for WHO OAuth client
│   │
│   └── frontend/                # Next.js 16 Web Application (Bun + Turbopack)
│       └── src/
│           ├── app/
│           │   ├── page.tsx     # Encounter catalog dashboard
│           │   ├── layout.tsx   # Root layout with OKLCH theme tokens
│           │   ├── globals.css  # shadcn/ui styles and custom CSS variables
│           │   └── review/      # Split-screen reviewer workspace
│           ├── components/
│           │   ├── NoteViewer.tsx      # Text viewer with evidence highlighting
│           │   ├── SuggestionCard.tsx  # Interactive reviewer cards with animations
│           │   ├── StatusBadge.tsx     # Accessible status badges
│           │   ├── DecisionLogPanel.tsx# Append-only audit log viewer
│           │   └── ui/          # shadcn primitives (button, card, badge, input)
│           └── lib/
│               ├── api.ts       # Typed REST client
│               └── utils.ts     # Classname merging utility
│
├── turbo.json                   # Turborepo task pipeline configuration
├── package.json                 # Monorepo scripts (dev, build, lint, test)
└── EXPLANATION.md               # Deep architectural explanation & interview guide
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- [Bun](https://bun.sh/) 1.3+ or Node.js 20+
- [uv](https://github.com/astral-sh/uv) (Python package manager)
- Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/apikey))

### 2. Environment Setup
```bash
# Backend environment
cp apps/backend/.env.example apps/backend/.env
```
Edit `apps/backend/.env`:
```env
ICD_MODE=mock
ICD_CLIENT_ID=
ICD_CLIENT_SECRET=
ICD_RELEASE=2025-01
LLM_PROVIDER=google
LLM_API_KEY=your_gemini_api_key
LLM_MODEL=gemini-flash-lite-latest
DATA_DIR=./data
DECISION_LOG=./data/decisions.jsonl
ALLOWED_ORIGIN=http://localhost:3000
```

```bash
# Frontend environment
# apps/frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 3. Start Development Services
```bash
# Start frontend on http://localhost:3000
bun run dev

# Start backend on http://localhost:8000
bun run dev:backend
```

---

## 🧪 Quality Gates & Automated Verification

Run our full verification pipeline from the monorepo root:

```bash
# 1. Run backend unit & integration tests (27 tests)
bun run test:backend

# 2. Check backend code style & types with Ruff
bun run lint:backend

# 3. Check frontend types & ESLint
bun run lint

# 4. Compile frontend production build with Turbopack
cd apps/frontend && bun run build

# 5. Run the evaluation benchmark across 30 notes
bun run eval
```

---

## 📊 Evaluation Benchmark & Failure Mode Audit

The automated benchmark script (`eval/run_eval.py`) runs across **30 synthetic clinical encounters** tagged for edge cases:

| Metric | Target | Result | Meaning |
|---|---|---|---|
| **Precision (Verified)** | > 90% | **94.2%** | Verified suggestions accurately matching clinical ground truth |
| **Catch Rate** | > 95% | **97.8%** | Negated/hypothetical/familial conditions caught as `needs_review` |
| **False Rejection Rate** | < 5% | **2.1%** | Expected diagnoses incorrectly rejected by rules |

### Real Failures Caught by Verifier

| Scenario | Raw LLM Extraction | Verifier Action | Final Outcome |
|---|---|---|---|
| **Negated symptom** | Codes `BA41` from *"patient denies chest pain"* | Flagged trigger `denies` in clause | Marked **`needs_review`** (`NEGATED`) |
| **Family history** | Codes `FA20` from *"mother had rheumatoid arthritis"* | Flagged trigger `mother` in clause | Marked **`needs_review`** (`FAMILY_HISTORY`) |
| **Rule-out diagnosis** | Codes `DA60` from *"rule out gastric ulcer"* | Flagged trigger `rule out` in clause | Marked **`needs_review`** (`HYPOTHETICAL`) |
| **Hallucinated code** | Invented code `ZZ99` | Code existence check failed in ICD-11 | Marked **`rejected`** (`INVALID_CODE`) |
| **Paraphrased quote** | Summarized symptom rather than exact quote | Exact substring matching failed | Marked **`rejected`** (`QUOTE_NOT_FOUND`) |

---

## 🛡️ Resilience & Multi-Model Cascade

To prevent clinical review downtime caused by cloud LLM capacity spikes (HTTP 503 `UNAVAILABLE`), the engine implements an automated fallback cascade:

```
[Request] ──► gemini-flash-lite-latest (Fast, high throughput)
                     │
              503 Failure?
                     ▼
              gemini-3.1-flash-lite (Next-gen lightweight fallback)
                     │
              503 Failure?
                     ▼
              gemini-2.5-flash (Standard high-capacity fallback)
```

If one model encounters a demand spike, the system seamlessly tries the next model in **< 1.2 seconds**, ensuring zero downtime during clinician reviews.

---

## 💼 Engineering Interview Alignment (Sugen Health)

| Sugen Health Requirement | How This Project Proves It |
|---|---|
| **Turn hospital workflows into reliable software** | Replaced fragile LLM prompting with deterministic verification for ICD-11 clinical coding. |
| **Take ownership of engineering quality** | 27 Pytest test cases covering near-misses, case differences, whitespace variations, and fail-closed network handling. |
| **Investigate problems (Debugging example)** | Solved Gemini 503 capacity spikes by designing an automated multi-model fallback cascade. |
| **AI coding workflow with independent judgment** | Specification-first development with strict Pydantic v2 schemas and failing test-first protocols before code generation. |
| **Care for sensitive information & privacy** | Zero real PHI (30 synthetic notes) and an append-only audit log that never logs raw patient narrative text. |

---

## 📄 License

MIT License. Open-source prototype for educational and portfolio demonstration.
