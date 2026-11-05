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

export const NoteViewer: React.FC<NoteViewerProps> = ({ text, highlights }) => {
  // Filter valid non-negative offsets and sort by start
  const validHighlights = highlights
    .filter((h) => h.start >= 0 && h.end > h.start && h.end <= text.length)
    .sort((a, b) => a.start - b.start);

  // Compute non-overlapping visual segments
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

      let colorClass = "bg-amber-200/70 border-b-2 border-amber-500 text-amber-950";
      if (hl.status === "verified") {
        colorClass = "bg-emerald-200/70 border-b-2 border-emerald-500 text-emerald-950";
      } else if (hl.status === "rejected") {
        colorClass = "bg-rose-200/70 border-b-2 border-rose-500 text-rose-950 line-through decoration-rose-500";
      }

      segments.push(
        <mark
          key={`hl-${i}-${actualStart}`}
          className={`px-1 py-0.5 rounded-sm font-medium transition-colors ${colorClass}`}
          title={`Evidence for ${hl.code} (${hl.status})`}
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
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs font-mono text-sm leading-relaxed whitespace-pre-wrap select-text text-zinc-900 dark:text-zinc-100">
      {segments.length > 0 ? segments : text}
    </div>
  );
};

