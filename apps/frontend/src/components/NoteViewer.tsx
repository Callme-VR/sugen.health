"use client";

import React from "react";
import { Card } from "@/components/ui/card";

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

      let colorClass = "bg-amber-500/20 dark:bg-amber-500/25 border-b-2 border-amber-500 text-amber-900 dark:text-amber-200";
      if (hl.status === "verified") {
        colorClass = "bg-[#00b24b]/20 dark:bg-[#00b24b]/25 border-b-2 border-[#00b24b] text-emerald-950 dark:text-[#00e660]";
      } else if (hl.status === "rejected") {
        colorClass = "bg-rose-500/20 dark:bg-rose-500/25 border-b-2 border-rose-500 text-rose-950 dark:text-rose-200 line-through decoration-rose-500";
      }

      segments.push(
        <mark
          key={`hl-${i}-${actualStart}`}
          className={`px-1.5 py-0.5 rounded font-semibold transition-all duration-150 ${colorClass}`}
          title={`Evidence quote for ICD code ${hl.code} (${hl.status})`}
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
    <Card className="rounded-[16px] border border-border/80 bg-card shadow-xs">
      <div className="p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap select-text text-foreground">
        {segments.length > 0 ? segments : text}
      </div>
    </Card>
  );
};
