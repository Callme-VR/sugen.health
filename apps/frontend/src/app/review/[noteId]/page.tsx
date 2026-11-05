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
          const message = err instanceof Error ? err.message : "Failed to load note data.";
          setError(message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [noteId]);

  const handleAnalyze = async () => {
    if (!noteId) return;
    setAnalyzing(true);
    setError("");
    try {
      const res = await analyzeNote(noteId);
      setSuggestions(res.suggestions);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "AI Analysis failed.";
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500 text-sm">
        Loading encounter note...
      </div>
    );
  }

  if (error && !note) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950 p-6">
        <p className="text-rose-600 text-sm font-semibold">{error}</p>
        <Link
          href="/"
          className="text-xs font-semibold text-blue-600 hover:underline"
        >
          &larr; Return to Catalog
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between p-6 md:p-10">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Navigation Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold px-2.5 py-1 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 transition-colors"
            >
              &larr; Back
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {note?.title}
              </h1>
              <p className="text-xs text-zinc-500">ID: {noteId}</p>
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <span className="animate-spin text-xs">&#x27F3;</span>
                <span>Running Verifier...</span>
              </>
            ) : (
              <span>Run AI Extraction & Verification</span>
            )}
          </button>
        </header>

        {error && (
          <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-lg border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        {/* Split Screen Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Pane: Raw Clinical Note with Highlighted Evidence */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Synthetic Clinical Note & Evidence Spans
              </h2>
              <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                  Verified
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                  Needs Review
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                  Rejected
                </span>
              </div>
            </div>
            <NoteViewer text={note?.text || ""} highlights={highlights} />
          </div>

          {/* Right Pane: Suggestions & Decisions */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                Suggested ICD-11 Codes ({suggestions.length})
              </h2>

              {suggestions.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl p-8 text-center text-xs text-zinc-500 space-y-2">
                  <p>No suggestions generated yet.</p>
                  <p className="text-[11px] text-zinc-400">
                    Click &ldquo;Run AI Extraction & Verification&rdquo; above to analyze the note text.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestions.map((sug, idx) => (
                    <SuggestionCard
                      key={`${sug.code}-${idx}`}
                      suggestion={sug}
                      noteId={noteId}
                      onDecision={handleDecision}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Decision Log Panel */}
            <DecisionLogPanel decisions={decisions} />
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center text-xs text-zinc-400 dark:text-zinc-600 border-t border-zinc-200 dark:border-zinc-800 pt-4">
        Demo on synthetic data. Not for clinical use.
      </footer>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500 text-sm">
          Loading review workspace...
        </div>
      }
    >
      <ReviewContent />
    </Suspense>
  );
}
