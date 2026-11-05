const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export interface NoteSummary {
  id: string;
  title: string;
}

export interface NoteDetail {
  id: string;
  title: string;
  text: string;
}

export type SuggestionStatus = "verified" | "needs_review" | "rejected";

export interface VerifiedSuggestion {
  code: string;
  title: string;
  evidence_quote: string;
  start: number;
  end: number;
  status: SuggestionStatus;
  reasons: string[];
}

export interface AnalyzeResponse {
  suggestions: VerifiedSuggestion[];
}

export interface Decision {
  note_id: string;
  code: string;
  action: "approve" | "edit" | "reject";
  edited_code?: string;
  reason?: string;
  reviewer: string;
  timestamp: string;
}

export interface DecisionCreate {
  note_id: string;
  code: string;
  action: "approve" | "edit" | "reject";
  edited_code?: string;
  reason?: string;
  reviewer?: string;
}

export async function fetchNotes(): Promise<NoteSummary[]> {
  const res = await fetch(`${API_BASE}/notes`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch notes: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchNote(noteId: string): Promise<NoteDetail> {
  const res = await fetch(`${API_BASE}/notes/${noteId}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch note ${noteId}: ${res.statusText}`);
  }
  return res.json();
}

export async function analyzeNote(noteId: string): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/notes/${noteId}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Analyze failed: ${res.statusText}`);
  }
  return res.json();
}

export async function submitDecision(decision: DecisionCreate): Promise<Decision> {
  const res = await fetch(`${API_BASE}/decisions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(decision),
  });
  if (!res.ok) {
    throw new Error(`Failed to submit decision: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchDecisions(noteId: string): Promise<Decision[]> {
  const res = await fetch(`${API_BASE}/decisions?note_id=${encodeURIComponent(noteId)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch decisions: ${res.statusText}`);
  }
  return res.json();
}

