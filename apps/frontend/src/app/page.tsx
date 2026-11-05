"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchNotes, NoteSummary } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, Activity, AlertCircle, ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6 md:p-12">
      <main className="max-w-4xl mx-auto w-full space-y-8">
        <header className="space-y-3 border-b border-border/80 pb-6">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              Verified Coding Workspace
            </Badge>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              ICD-11 + Gemini 2.5
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Evidence-Checked ICD-11 Coding Assistant
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Clinical review environment with zero trust in raw LLM outputs. Every suggested code requires exact cited text evidence and deterministic negation, family history, and hypothetical boundary checks.
          </p>
        </header>

        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-3">
            <Activity className="w-6 h-6 animate-pulse text-primary" />
            <span>Connecting to FastAPI backend and retrieving clinical encounters...</span>
          </div>
        ) : errorMsg ? (
          <Card className="border-destructive/30 bg-destructive/5 text-destructive p-5 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-sm">Backend Service Offline</p>
                <p className="text-xs text-destructive/90">{errorMsg}</p>
                <p className="text-xs text-muted-foreground pt-2">
                  Please ensure the FastAPI backend is running via <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">bun run dev:backend</code> on port 8000.
                </p>
              </div>
            </div>
          </Card>
        ) : notes.length === 0 ? (
          <Card className="border-dashed p-10 text-center text-muted-foreground text-sm">
            No synthetic clinical notes found in backend data catalog.
          </Card>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>Available Synthetic Encounters</span>
              <span>{notes.length} notes</span>
            </div>
            <div className="grid gap-3">
              {notes.map((note) => (
                <Card
                  key={note.id}
                  className="group hover:border-primary/50 hover:shadow-sm transition-all duration-200"
                >
                  <CardHeader className="p-5 flex flex-row items-center justify-between space-y-0 gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        <CardTitle className="text-base font-semibold truncate group-hover:text-primary transition-colors">
                          {note.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="font-mono text-xs text-muted-foreground pl-6">
                        Identifier: {note.id}
                      </CardDescription>
                    </div>
                    <Link href={`/review/${note.id}`}>
                      <Button size="sm" className="shrink-0 gap-1.5 shadow-xs">
                        Review <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 text-center text-xs text-muted-foreground border-t border-border/70 pt-6">
        Demo on synthetic data. Not certified for live clinical decision support.
      </footer>
    </div>
  );
}
