"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  fetchNote,
  analyzeNote,
  submitDecision,
  fetchDecisions,
  NoteDetail,
  VerifiedSuggestion,
  Decision,
  DecisionCreate,
} from "@/lib/api";
import { NoteViewer } from "@/components/NoteViewer";
import { SuggestionCard } from "@/components/SuggestionCard";
import { DecisionLogPanel } from "@/components/DecisionLogPanel";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle,
  FileCheck,
  Layers,
} from "lucide-react";

/* ─── Review Content ─────────────────────────────────────────────────────── */
function ReviewContent() {
  const params = useParams();
  const noteId = params?.noteId as string;

  const [note, setNote] = useState<NoteDetail | null>(null);
  const [suggestions, setSuggestions] = useState<VerifiedSuggestion[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      if (!noteId) return;
      try {
        const [noteData, decisionData] = await Promise.all([
          fetchNote(noteId),
          fetchDecisions(noteId),
        ]);
        if (!ignore) {
          setNote(noteData);
          setDecisions(decisionData);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const message =
            err instanceof Error ? err.message : "Failed to load note data.";
          setError(message);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchData();
    return () => { ignore = true; };
  }, [noteId]);

  const handleAnalyze = async () => {
    if (!noteId) return;
    setAnalyzing(true);
    setError("");
    try {
      const res = await analyzeNote(noteId);
      setSuggestions(res.suggestions);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "AI Analysis failed.";
      setError(message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDecision = async (decCreate: DecisionCreate) => {
    try {
      const saved = await submitDecision(decCreate);
      setDecisions((prev) => [...prev, saved]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`Error saving decision: ${message}`);
    }
  };

  /* Loading */
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background gap-2"
        role="status"
        aria-label="Loading clinical encounter note"
      >
        <Loader2
          className="w-4 h-4 animate-spin text-primary"
          aria-hidden="true"
        />
        <span className="text-xs text-muted-foreground font-semibold">
          Loading clinical encounter note…
        </span>
      </div>
    );
  }

  /* Fatal error */
  if (error && !note) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-6">
        <div
          role="alert"
          className="flex items-center gap-2 p-4 border border-destructive/30 bg-destructive/5 rounded-sm text-destructive text-sm font-semibold"
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Return to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const highlights = suggestions.map((s) => ({
    start: s.start,
    end: s.end,
    status: s.status,
    code: s.code,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── Top Nav ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          {/* Back + title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" aria-label="Return to clinical catalog">
              <Button variant="outline" size="sm" className="gap-1.5 font-semibold shrink-0">
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                Catalog
              </Button>
            </Link>

            {/* Structural divider */}
            <span
              className="hidden sm:block w-px h-5 bg-border shrink-0"
              aria-hidden="true"
            />

            <div className="min-w-0">
              <h1 className="text-sm font-bold text-foreground truncate">
                {note?.title}
              </h1>
              <p className="text-xs font-mono text-muted-foreground font-semibold">
                Record ID: {noteId}
              </p>
            </div>
          </div>

          {/* Primary action */}
          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="shrink-0 gap-2 font-bold"
            aria-busy={analyzing}
          >
            {analyzing ? (
              <>
                <Loader2
                  className="w-3.5 h-3.5 animate-spin"
                  aria-hidden="true"
                />
                <span>Verifying…</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Extract &amp; Verify ICD-11</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* ── Workspace ─────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 space-y-4">
        {/* Inline error banner */}
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 p-3 border border-destructive/30 bg-destructive/5 rounded-sm text-destructive text-xs font-semibold"
          >
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── Left pane: Clinical Note ─────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-3">
            {/* Pane header */}
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <FileCheck
                  className="w-3.5 h-3.5 text-secondary"
                  aria-hidden="true"
                />
                Encounter Chart &amp; Cited Evidence Spans
              </h2>

              {/* Legend — only visible after analysis */}
              {suggestions.length > 0 && (
                <div
                  className="flex items-center gap-3 text-[11px] text-muted-foreground font-semibold"
                  aria-label="Highlight legend"
                >
                  <span className="flex items-center gap-1">
                    <span
                      className="inline-block w-2 h-2 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                    Verified
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      className="inline-block w-2 h-2 rounded-full bg-warning"
                      aria-hidden="true"
                    />
                    Needs Review
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      className="inline-block w-2 h-2 rounded-full bg-destructive"
                      aria-hidden="true"
                    />
                    Rejected
                  </span>
                </div>
              )}
            </div>

            <NoteViewer text={note?.text || ""} highlights={highlights} />
          </div>

          {/* ── Right pane: Suggestions & Decisions ─────────────────────── */}
          <div className="lg:col-span-5 space-y-5">
            {/* Candidate codes section */}
            <section aria-label="ICD-11 candidate diagnoses">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Layers
                    className="w-3.5 h-3.5 text-primary"
                    aria-hidden="true"
                  />
                  Candidate Diagnoses (ICD-11)
                </h2>
                {suggestions.length > 0 && (
                  <span className="text-[11px] text-secondary font-bold tabular-nums">
                    {suggestions.length} suggestion{suggestions.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {suggestions.length === 0 ? (
                /* Empty state */
                <div className="border border-dashed border-border rounded-sm bg-card p-8 text-center space-y-2">
                  <Sparkles
                    className="w-5 h-5 text-secondary mx-auto opacity-60"
                    aria-hidden="true"
                  />
                  <p className="text-xs font-bold text-foreground">
                    No candidate codes extracted yet.
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold max-w-xs mx-auto">
                    Click &ldquo;Extract &amp; Verify ICD-11&rdquo; above to run LLM
                    candidate extraction through deterministic evidence and
                    negation verification.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3" role="list" aria-label="ICD-11 suggestions">
                  {suggestions.map((sug, idx) => (
                    <li key={`${sug.code}-${idx}`}>
                      <SuggestionCard
                        suggestion={sug}
                        noteId={noteId}
                        onDecision={handleDecision}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Decision log */}
            <DecisionLogPanel decisions={decisions} />
          </div>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-xs text-muted-foreground font-semibold">
            Demo on synthetic data. Not certified for live clinical decision
            support.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ─── Review Page (with Suspense boundary) ──────────────────────────────── */
export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center bg-background gap-2"
          role="status"
          aria-label="Loading review workspace"
        >
          <Loader2
            className="w-4 h-4 animate-spin text-primary"
            aria-hidden="true"
          />
          <span className="text-xs text-muted-foreground font-semibold">
            Loading review workspace…
          </span>
        </div>
      }
    >
      <ReviewContent />
    </Suspense>
  );
}
