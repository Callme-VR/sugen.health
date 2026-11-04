# ICD-11 Assistant — Frontend

Next.js 16 (App Router) review interface for the evidence-checked ICD-11 coding assistant.

> **Disclaimer:** Operates on synthetic clinical notes for demonstration and review. Never commit or display real patient health information (PHI).

---

## User Interface Overview

The frontend acts as a pure presentation and human-in-the-loop review client:

1. **Note Catalog (`/`)**:
   - Browse synthetic clinical notes.
   - Quick navigation into the review workspace for each note.

2. **Review Workspace (`/review/[noteId]`)**:
   - **Split-Screen Layout**:
     - **Left Pane (`NoteViewer.tsx`)**: Displays raw note text with exact character offset highlighting for cited evidence quotes (handles overlapping spans).
     - **Right Pane (`SuggestionCard.tsx`)**: Displays suggested ICD-11 codes, official code titles, accessible status badges, plain-English verifier explanations, and human reviewer action controls (`Approve`, `Edit`, `Reject`).
   - **Accessible Status Badges (`StatusBadge.tsx`)**: Status displayed with distinctive text and icons alongside color coding (`verified`, `needs_review`, `rejected`).
   - **Reviewer Safeguards**:
     - Codes marked `rejected` are collapsed by default.
     - Approving a verifier-rejected code enforces an explicit written justification.
     - Editing permits typing alternative ICD-11 codes with rationale.
   - **Audit Trail**: Panel displaying append-only reviewer decision records from `/decisions`.
   - **Footer Disclaimer**: Visible disclaimer on all pages: *"Demo on synthetic data. Not for clinical use."*

---

## Technical Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Package Manager**: Bun
- **API Integration**: Typed HTTP client (`src/lib/api.ts`) connecting to FastAPI backend via `NEXT_PUBLIC_API_BASE_URL`.

---

## Getting Started

### 1. Environment Configuration

```bash
# apps/frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 2. Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Quality & Build Commands

```bash
# Lint frontend
bun run lint

# Production build
bun run build
```
