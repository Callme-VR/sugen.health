"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchNotes, NoteSummary } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileText,
  Activity,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  FileSearch,
} from "lucide-react";

/* ─── Home Page ───────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchNotes()
      .then((data) => setNotes(data))
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Failed to connect to backend.";
        setErrorMsg(message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── Top Nav ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Wordmark */}
          <div className="flex items-center gap-2.5">
            <ShieldCheck
              className="w-5 h-5 text-primary"
              aria-hidden="true"
            />
            <span className="text-sm font-bold tracking-tight text-foreground">
              Sugen Health
            </span>
            <span className="text-muted-foreground/40 text-sm font-light select-none">
              /
            </span>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">
              CDI Intelligence
            </span>
          </div>

          {/* System status pill */}
          <span className="text-xs text-muted-foreground font-semibold">
            ICD-11 · WHO Verified
          </span>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col gap-12">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="border-b border-border pb-10 space-y-6">
          <h1 className="text-[30px] font-black tracking-tight leading-[1.1] max-w-2xl">
            Autonomous Clinical Coding with{" "}
            <span className="text-primary">
              Deterministic Verification
            </span>
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl font-semibold">
            Engineered for hospital health systems and CDI teams. Reconciles
            unstructured inpatient encounter charts into verified WHO ICD-11
            classifications with 100% cited text spans and deterministic
            guardrails.
          </p>

          {/* Clinical Assurance Pillars — editorial 3-col strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px border border-border rounded-md overflow-hidden bg-border">
            {/* Pillar 1 */}
            <div className="bg-background p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="text-xs font-bold text-foreground">
                  Zero Hallucinations
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-snug font-semibold pl-6">
                Every suggested code requires character-exact cited chart
                evidence.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-background p-4 space-y-1.5 border-l border-r border-border sm:border-l sm:border-r-0 border-t sm:border-t-0">
              <div className="flex items-center gap-2 text-secondary">
                <Stethoscope className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="text-xs font-bold text-foreground">
                  Clinical Guardrails
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-snug font-semibold pl-6">
                Deterministic filters for negation, family history & screening
                boundaries.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-background p-4 space-y-1.5 border-t sm:border-t-0 sm:border-l border-border">
              <div className="flex items-center gap-2 text-primary">
                <FileSearch className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="text-xs font-bold text-foreground">
                  WHO ICD-11 Standard
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-snug font-semibold pl-6">
                Standardized code ontology with human-in-the-loop auditable
                signoff.
              </p>
            </div>
          </div>
        </section>

        {/* ── Encounter Catalog ─────────────────────────────────────────── */}
        <section className="space-y-4" aria-label="Patient encounter catalog">
          {loading ? (
            /* Loading state */
            <div
              className="flex flex-col items-center justify-center gap-3 py-16 text-center"
              role="status"
              aria-label="Loading clinical encounters"
            >
              <Activity
                className="w-5 h-5 animate-pulse text-primary"
                aria-hidden="true"
              />
              <span className="text-xs text-muted-foreground font-semibold">
                Connecting to backend — retrieving clinical encounters…
              </span>
            </div>
          ) : errorMsg ? (
            /* Error state */
            <div
              role="alert"
              className="flex items-start gap-3 p-4 border border-destructive/30 bg-destructive/5 rounded-sm text-destructive"
            >
              <AlertCircle
                className="w-4 h-4 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="space-y-1 text-left">
                <p className="text-sm font-bold">
                  Clinical Backend Service Offline
                </p>
                <p className="text-xs font-semibold opacity-80">{errorMsg}</p>
                <p className="text-xs text-muted-foreground font-semibold pt-1">
                  Ensure the FastAPI service is running on port 8000 via{" "}
                  <code className="font-mono bg-muted px-1.5 py-0.5 rounded-sm text-foreground">
                    bun run dev:backend
                  </code>
                  .
                </p>
              </div>
            </div>
          ) : notes.length === 0 ? (
            /* Empty state */
            <div className="border border-dashed border-border rounded-sm p-10 text-center">
              <p className="text-xs text-muted-foreground font-semibold">
                No clinical encounter notes found in backend catalog.
              </p>
            </div>
          ) : (
            /* Note list */
            <>
              {/* Table-style column header */}
              <div
                className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-2 border-b border-border"
                aria-hidden="true"
              >
                <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">
                  Patient Encounters &amp; Inpatient Notes
                </span>
                <span className="text-[11px] text-secondary font-semibold tabular-nums">
                  {notes.length} chart{notes.length !== 1 ? "s" : ""} ready
                </span>
              </div>

              {/* Encounter rows */}
              <ul className="divide-hairline border border-border rounded-sm overflow-hidden" role="list">
                {notes.map((note) => (
                  <li
                    key={note.id}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3.5 bg-card transition-snap hover:bg-muted/40"
                  >
                    {/* Icon */}
                    <FileText
                      className="w-4 h-4 text-muted-foreground group-hover:text-secondary transition-snap shrink-0"
                      aria-hidden="true"
                    />

                    {/* Meta */}
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-bold text-foreground truncate group-hover:text-secondary transition-snap">
                        {note.title}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground font-semibold">
                        Record ID:{" "}
                        <span className="text-foreground/70">{note.id}</span>
                      </p>
                    </div>

                    {/* CTA */}
                    <Link href={`/review/${note.id}`} tabIndex={-1}>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="shrink-0 gap-1.5 font-bold"
                        aria-label={`Review encounter: ${note.title}`}
                      >
                        Review
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <p className="text-xs text-muted-foreground font-semibold">
            Demo on synthetic data. Not certified for live clinical decision
            support.
          </p>
        </div>
      </footer>
    </div>
  );
}
