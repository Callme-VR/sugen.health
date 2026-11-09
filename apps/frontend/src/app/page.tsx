"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchNotes, NoteSummary } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, Activity, AlertCircle, ShieldCheck, HeartPulse, CheckCircle2, Stethoscope, FileSearch } from "lucide-react";

export default function HomePage() {
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchNotes()
      .then((data) => setNotes(data))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Failed to connect to backend.";
        setErrorMsg(message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between items-center p-6 md:p-12 relative overflow-hidden">
      {/* Ambient Balanced Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-b from-[#0075ff]/12 via-[#00b24b]/6 to-transparent blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <main className="max-w-4xl w-full mx-auto flex flex-col items-center space-y-10">
        {/* Hospital Health Startup Centered Hero */}
        <header className="w-full flex flex-col items-center text-center space-y-6 border-b border-border/80 pb-10">
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Badge
              variant="secondary"
              className="gap-1.5 px-3.5 py-1 text-xs rounded-full bg-[#00b24b]/12 text-[#00b24b] border border-[#00b24b]/30 font-bold tracking-wide shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              SUGEN HEALTH &bull; HOSPITAL CDI INTELLIGENCE
            </Badge>
            <Badge
              variant="outline"
              className="text-xs text-muted-foreground rounded-full px-3.5 py-1 font-semibold border-border/80 bg-card/40"
            >
              <HeartPulse className="w-3.5 h-3.5 mr-1 text-[#0075ff]" />
              Zero-Hallucination ICD-11 &bull; Deterministic Engine
            </Badge>
          </div>

          <div className="space-y-4 max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.16]">
              Autonomous Clinical Coding with{" "}
              <span className="text-[#00b24b] drop-shadow-[0_0_24px_rgba(0,178,75,0.25)]">
                Deterministic Verification
              </span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium max-w-2xl mx-auto">
              Engineered for hospital health systems and clinical documentation improvement (CDI) teams. Reconciles unstructured inpatient encounter charts into verified WHO ICD-11 classifications with 100% cited text spans and deterministic guardrails.
            </p>
          </div>

          {/* Clinical Assurance Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-3xl pt-2">
            <div className="flex items-start gap-3 rounded-[16px] bg-card/80 border border-border/80 p-4 text-left shadow-xs hover:border-[#00b24b]/40 transition-colors">
              <div className="p-2 rounded-[10px] bg-[#00b24b]/10 text-[#00b24b] shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-xs text-foreground block">Zero Hallucinations</span>
                <span className="text-[11px] text-muted-foreground leading-snug block">
                  Every suggested code requires character-exact cited chart evidence.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-[16px] bg-card/80 border border-border/80 p-4 text-left shadow-xs hover:border-[#0075ff]/40 transition-colors">
              <div className="p-2 rounded-[10px] bg-[#0075ff]/10 text-[#0075ff] shrink-0 mt-0.5">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-xs text-foreground block">Clinical Guardrails</span>
                <span className="text-[11px] text-muted-foreground leading-snug block">
                  Deterministic filters for negation, family history &amp; screening boundaries.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-[16px] bg-card/80 border border-border/80 p-4 text-left shadow-xs hover:border-emerald-500/40 transition-colors">
              <div className="p-2 rounded-[10px] bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                <FileSearch className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-xs text-foreground block">WHO ICD-11 Standard</span>
                <span className="text-[11px] text-muted-foreground leading-snug block">
                  Standardized code ontology with human-in-the-loop auditable signoff.
                </span>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="p-16 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-3">
            <Activity className="w-6 h-6 animate-pulse text-[#00b24b]" />
            <span className="font-semibold">Connecting to FastAPI backend and retrieving clinical encounters...</span>
          </div>
        ) : errorMsg ? (
          <Card className="rounded-[16px] border border-rose-500/30 bg-rose-500/10 text-rose-500 p-5 w-full max-w-3xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1 text-left">
                <p className="font-bold text-sm">Clinical Backend Service Offline</p>
                <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
                <p className="text-xs text-muted-foreground pt-2 font-medium">
                  Please ensure the FastAPI service is running on port 8000 via <code className="font-mono bg-muted px-1.5 py-0.5 rounded-md text-foreground">bun run dev:backend</code>.
                </p>
              </div>
            </div>
          </Card>
        ) : notes.length === 0 ? (
          <Card className="rounded-[16px] border border-dashed border-border/80 p-10 text-center text-muted-foreground text-sm font-semibold w-full max-w-3xl">
            No clinical encounter notes found in backend catalog.
          </Card>
        ) : (
          <div className="w-full max-w-3xl space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1 font-bold uppercase tracking-wider">
              <span>Patient Encounters &amp; Inpatient Notes</span>
              <span className="text-[#0075ff] font-semibold">{notes.length} charts ready for review</span>
            </div>
            <div className="grid gap-3.5">
              {notes.map((note) => (
                <Card
                  key={note.id}
                  className="rounded-[16px] border border-border/80 bg-card/90 group hover:border-[#0075ff]/60 hover:shadow-lg transition-all duration-200"
                >
                  <CardHeader className="p-5 flex flex-row items-center justify-between space-y-0 gap-4">
                    <div className="space-y-1.5 min-w-0 text-left">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-[8px] bg-muted/60 text-muted-foreground group-hover:text-[#0075ff] group-hover:bg-[#0075ff]/10 transition-colors shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <CardTitle className="text-base font-bold truncate group-hover:text-[#0075ff] transition-colors tracking-tight">
                          {note.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="font-mono text-xs text-muted-foreground pl-10 font-semibold">
                        Medical Record / Note ID: <span className="text-foreground/80">{note.id}</span>
                      </CardDescription>
                    </div>
                    <Link href={`/review/${note.id}`}>
                      <Button size="sm" className="shrink-0 gap-1.5 bg-[#0075ff] hover:bg-[#0060d4] text-white font-bold rounded-[10px] px-4 shadow-sm">
                        Review Encounter <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 text-center text-xs text-muted-foreground border-t border-border/70 pt-6 font-medium">
        Demo on synthetic data. Not certified for live clinical decision support.
      </footer>
    </div>
  );
}
