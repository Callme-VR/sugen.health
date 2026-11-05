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
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Loader2, AlertCircle, FileCheck, Layers } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span>Loading clinical encounter note...</span>
      </div>
    );
  }

  if (error && !note) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-6">
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Return to Catalog
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
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 md:p-8">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Navigation Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" /> Catalog
              </Button>
            </Link>
            <div className="border-l border-border/70 pl-3">
              <h1 className="text-lg md:text-xl font-bold tracking-tight">
                {note?.title}
              </h1>
              <p className="text-xs font-mono text-muted-foreground">ID: {noteId}</p>
            </div>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="gap-2 shadow-xs"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Deterministic Verifier...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Extract & Verify ICD-11 Codes</span>
              </>
            )}
          </Button>
        </header>

        {error && (
          <div className="p-3 text-xs bg-destructive/10 text-destructive rounded-lg border border-destructive/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Split Screen Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Pane: Raw Clinical Note with Highlighted Evidence */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" /> Note Text & Cited Evidence Spans
              </h2>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="text-[11px] font-normal gap-1 py-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Verified
                </Badge>
                <Badge variant="outline" className="text-[11px] font-normal gap-1 py-0 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                  Needs Review
                </Badge>
                <Badge variant="outline" className="text-[11px] font-normal gap-1 py-0 bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                  Rejected
                </Badge>
              </div>
            </div>
            <NoteViewer text={note?.text || ""} highlights={highlights} />
          </div>

          {/* Right Pane: Suggestions & Decisions */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Candidate Diagnoses
                </h2>
                <Badge variant="secondary" className="text-[11px] font-normal">
                  {suggestions.length} suggestions
                </Badge>
              </div>

              {suggestions.length === 0 ? (
                <div className="border border-dashed border-border/80 rounded-xl p-8 text-center text-xs text-muted-foreground space-y-2">
                  <Sparkles className="w-6 h-6 text-muted-foreground/50 mx-auto" />
                  <p className="font-medium text-foreground">No suggestions extracted yet.</p>
                  <p className="text-[11px]">
                    Click &ldquo;Extract & Verify ICD-11 Codes&rdquo; above to run the AI and verification engine.
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

      <footer className="mt-12 text-center text-xs text-muted-foreground border-t border-border/70 pt-4">
        Demo on synthetic data. Not certified for live clinical decision support.
      </footer>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span>Loading review workspace...</span>
        </div>
      }
    >
      <ReviewContent />
    </Suspense>
  );
}
