"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchNotes, NoteSummary } from "@/lib/api";

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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between p-6 md:p-12">
      <main className="max-w-4xl mx-auto w-full space-y-8">
        <header className="space-y-2 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div className="inline-block px-2.5 py-1 rounded text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 mb-2">
            ICD-11 Review Workspace
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Evidence-Checked ICD-11 Coding Assistant
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Select a synthetic clinical encounter note to evaluate AI suggestions and verify cited evidence before sign-off.
          </p>
        </header>

        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            Connecting to backend and loading encounter notes...
          </div>
        ) : errorMsg ? (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm">
            <p className="font-semibold">Backend Connection Notice</p>
            <p className="text-xs mt-1">{errorMsg}</p>
            <p className="text-xs mt-2 text-zinc-500">
              Ensure the FastAPI backend is running at <code className="font-mono">http://localhost:8000</code>.
            </p>
          </div>
        ) : notes.length === 0 ? (
          <div className="p-8 text-center border border-dashed rounded-xl border-zinc-300 dark:border-zinc-700 text-zinc-500 text-sm">
            No synthetic clinical notes found in backend/data/notes.
          </div>
        ) : (
          <div className="grid gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex items-center justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                    {note.title}
                  </h3>
                  <p className="text-xs font-mono text-zinc-500 mt-0.5">
                    ID: {note.id}
                  </p>
                </div>
                <Link
                  href={`/review/${note.id}`}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                >
                  Open Review &rarr;
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-16 text-center text-xs text-zinc-400 dark:text-zinc-600 border-t border-zinc-200 dark:border-zinc-800 pt-6">
        Demo on synthetic data. Not for clinical use.
      </footer>
    </div>
  );
}
