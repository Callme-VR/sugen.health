"use client";

import React from "react";

interface SpanHighlight {
  start: number;
  end: number;
  status: "verified" | "needs_review" | "rejected";
  code: string;
}

interface NoteViewerProps {
  text: string;
  highlights: SpanHighlight[];
}

/* ─── NoteViewer ─────────────────────────────────────────────────────────── */
/* Renders the clinical note with inline evidence highlights.                  */
/* Colors use CSS tokens — no hardcoded hex values in template.                */
export const NoteViewer: React.FC<NoteViewerProps> = ({ text, highlights }) => {
  /* Filter valid non-negative offsets and sort by start */
  const validHighlights = highlights
    .filter((h) => h.start >= 0 && h.end > h.start && h.end <= text.length)
    .sort((a, b) => a.start - b.start);

  /* Compute non-overlapping visual segments */
  const segments: React.ReactNode[] = [];
  let currentIdx = 0;

  validHighlights.forEach((hl, i) => {
    if (hl.start > currentIdx) {
      segments.push(
        <span key={`text-${currentIdx}`}>
          {text.slice(currentIdx, hl.start)}
        </span>
      );
    }

    if (hl.end > currentIdx) {
      const actualStart = Math.max(currentIdx, hl.start);
      const highlightedSub = text.slice(actualStart, hl.end);

      /* Status-driven semantic color classes — tokens, not raw hex */
      let colorClass =
        "bg-warning/15 border-b-2 border-warning text-foreground";
      if (hl.status === "verified") {
        colorClass =
          "bg-success/15 border-b-2 border-success text-foreground";
      } else if (hl.status === "rejected") {
        colorClass =
          "bg-destructive/15 border-b-2 border-destructive text-foreground line-through decoration-destructive";
      }

      segments.push(
        <mark
          key={`hl-${i}-${actualStart}`}
          className={`px-1 py-0.5 rounded-sm font-semibold transition-snap ${colorClass}`}
          title={`Evidence for ICD code ${hl.code} (${hl.status})`}
          aria-label={`${hl.status} evidence for ${hl.code}`}
        >
          {highlightedSub}
        </mark>
      );
      currentIdx = hl.end;
    }
  });

  if (currentIdx < text.length) {
    segments.push(
      <span key={`tail-${currentIdx}`}>{text.slice(currentIdx)}</span>
    );
  }

  return (
    <div className="border border-border rounded-sm bg-card shadow-xs overflow-hidden">
      <div
        className="p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap select-text text-foreground"
        role="document"
        aria-label="Clinical encounter note with evidence highlights"
      >
        {segments.length > 0 ? segments : text}
      </div>
    </div>
  );
};
