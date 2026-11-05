# 💻 ICD-11 Assistant — Frontend Review Client

High-performance Next.js 16 (App Router) clinical review interface styled with Tailwind CSS v4, shadcn/ui components, OKLCH design tokens, and fluid micro-animations.

[![Next.js](https://img.shields.io/badge/Next.js-16.4.5-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.3.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Preset_b3bXza9jg8-black?style=flat-square)](https://ui.shadcn.com)

---

## ✨ Features & Motion Design

1. **Encounter Catalog Dashboard (`/`)**:
   - Modern grid of clinical encounters with status indicators.
   - Micro-interaction hover states with smooth transition easing.
   - Real-time connection feedback with the FastAPI backend.

2. **Split-Screen Review Workspace (`/review/[noteId]`)**:
   - **Left Pane (`NoteViewer.tsx`)**: Raw clinical note rendered with dynamic, non-overlapping highlighted spans based on exact character offsets.
     - 🟢 **Verified**: Emerald highlight (`bg-emerald-100`).
     - 🟡 **Needs Review**: Amber warning highlight (`bg-amber-100`).
     - 🔴 **Rejected**: Rose highlight with strike-through styling.
   - **Right Pane (`SuggestionCard.tsx`)**:
     - Status badges with Lucide icons (`CheckCircle2`, `AlertTriangle`, `XCircle`).
     - Collapsed-by-default state for verifier-rejected suggestions to prevent accidental approval.
     - Inline code editing mode allowing clinicians to override candidate codes.
     - Enforced written justification input when overriding a rejected suggestion.
   - **Real-Time Audit Trail (`DecisionLogPanel.tsx`)**:
     - Append-only decision list updating immediately on approval, edit, or rejection.

3. **Motion & Feedback**:
   - Extraction loading spinner (`Loader2`, `animate-spin`) during AI analysis.
   - Accordion collapse/expand transitions for rejected candidate cards.
   - React Suspense boundaries for zero-blocking initial page renders.

---

## 🎨 Theme & Design Tokens

Configured with shadcn/ui preset `b3bXza9jg8` with OKLCH color space:

- `--primary`: `oklch(0.488 0.243 264.376)`
- `--background`: `oklch(1 0 0)` (Dark: `oklch(0.141 0.005 285.823)`)
- `--card`: `oklch(1 0 0)` (Dark: `oklch(0.21 0.006 285.885)`)
- Complete dark mode support automatically matching OS color preferences.

---

## 🚀 Development & Build

```bash
# Start development server on port 3000
bun run dev

# Run Next.js production build with Turbopack & TypeScript check
bun run build

# Run ESLint validation
bun run lint
```
