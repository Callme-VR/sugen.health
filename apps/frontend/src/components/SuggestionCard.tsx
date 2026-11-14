"use client";

import React, { useState } from "react";
import { VerifiedSuggestion, DecisionCreate } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Check,
  Edit3,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Quote,
  Loader2,
} from "lucide-react";

interface SuggestionCardProps {
  suggestion: VerifiedSuggestion;
  noteId: string;
  onDecision: (decision: DecisionCreate) => Promise<void>;
}

/* ─── Reason formatter ───────────────────────────────────────────────────── */
const formatReason = (r: string): string => {
  switch (r) {
    case "QUOTE_NOT_FOUND":
      return "Exact quote was not found in the clinical note text.";
    case "INVALID_CODE":
      return "ICD-11 code does not exist in the official classification.";
    case "TITLE_MISMATCH":
      return "Clinical title differs from official ICD-11 designation.";
    case "NEGATED":
      return "Condition is negated in note (e.g. denies, absence of, no).";
    case "HYPOTHETICAL":
      return "Condition is tentative, hypothetical, or under differential query.";
    case "FAMILY_HISTORY":
      return "Condition describes a family member's medical history.";
    case "ICD_UNAVAILABLE":
      return "WHO ICD-11 verification service was unreachable (fail-closed).";
    default:
      return r;
  }
};

/* ─── SuggestionCard ─────────────────────────────────────────────────────── */
/* Flat surface card with 1px border — no floating shadow on hover.            */
/* Tokens consumed throughout — no hardcoded hex in template.                  */
export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  noteId,
  onDecision,
}) => {
  const isInitiallyCollapsed = suggestion.status === "rejected";
  const [collapsed, setCollapsed] = useState(isInitiallyCollapsed);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(suggestion.code);
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleApprove = async () => {
    if (suggestion.status === "rejected" && !customReason.trim()) {
      setErrorMsg(
        "A written justification is required to override a rejected code."
      );
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await onDecision({
        note_id: noteId,
        code: suggestion.code,
        action: "approve",
        reason: customReason || undefined,
        reviewer: "Clinician Reviewer",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await onDecision({
        note_id: noteId,
        code: suggestion.code,
        action: "reject",
        reason: customReason || undefined,
        reviewer: "Clinician Reviewer",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedCode.trim()) return;
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await onDecision({
        note_id: noteId,
        code: suggestion.code,
        action: "edit",
        edited_code: editedCode.trim(),
        reason: customReason || "Edited by reviewer",
        reviewer: "Clinician Reviewer",
      });
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article
      className="border border-border rounded-sm bg-card transition-snap hover:border-border/70"
      aria-label={`ICD code ${suggestion.code}: ${suggestion.title}`}
    >
      {/* Card header */}
      <div className="flex items-center justify-between gap-3 p-4">
        {/* Code + title */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono font-bold text-xs bg-muted text-foreground px-2.5 py-1 rounded-sm border border-border shrink-0">
            {suggestion.code}
          </span>
          <h4 className="font-bold text-foreground text-sm truncate">
            {suggestion.title}
          </h4>
        </div>

        {/* Status + collapse toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={suggestion.status} />
          {suggestion.status === "rejected" && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-semibold transition-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Expand card details" : "Collapse card details"}
            >
              {collapsed ? (
                <>Expand <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" /></>
              ) : (
                <>Collapse <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" /></>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Collapsible body */}
      {!collapsed && (
        <div className="border-t border-border p-4 space-y-3.5">
          {/* Evidence quote */}
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <Quote className="w-3 h-3 text-secondary" aria-hidden="true" />
              Cited Text Evidence
            </span>
            <blockquote className="text-xs bg-muted p-3 rounded-sm border-l-2 border-secondary italic text-foreground/90 font-semibold">
              &ldquo;{suggestion.evidence_quote}&rdquo;
            </blockquote>
          </div>

          {/* Verifier warnings */}
          {suggestion.reasons.length > 0 && (
            <div className="p-3 rounded-sm border border-warning/30 bg-warning/5">
              <span className="text-[11px] font-bold text-warning uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                Verifier Warnings
              </span>
              <ul className="list-disc list-inside text-xs text-foreground/80 font-semibold space-y-1">
                {suggestion.reasons.map((r, i) => (
                  <li key={i}>{formatReason(r)}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Validation error */}
          {errorMsg && (
            <div
              role="alert"
              className="flex items-center gap-1.5 text-xs text-destructive font-semibold bg-destructive/5 p-2.5 rounded-sm border border-destructive/30"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Optional form fields */}
          {(suggestion.status === "rejected" || isEditing) && (
            <div className="space-y-2.5">
              {isEditing && (
                <div>
                  <label
                    htmlFor={`edit-code-${suggestion.code}`}
                    className="text-xs font-semibold text-foreground block mb-1"
                  >
                    New ICD-11 Code:
                  </label>
                  <Input
                    id={`edit-code-${suggestion.code}`}
                    type="text"
                    value={editedCode}
                    onChange={(e) => setEditedCode(e.target.value)}
                    className="font-mono text-xs h-8 rounded-sm"
                    placeholder="e.g. BA41"
                  />
                </div>
              )}
              <div>
                <label
                  htmlFor={`reason-${suggestion.code}`}
                  className="text-xs font-semibold text-foreground block mb-1"
                >
                  {suggestion.status === "rejected"
                    ? "Clinical Justification to Override (Required):"
                    : "Reviewer Comment:"}
                </label>
                <Input
                  id={`reason-${suggestion.code}`}
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="text-xs h-8 rounded-sm"
                  placeholder="Enter clinical rationale…"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {isSubmitting && (
              <Loader2
                className="w-3.5 h-3.5 animate-spin text-muted-foreground shrink-0"
                aria-hidden="true"
              />
            )}

            {isEditing ? (
              <>
                <Button
                  size="sm"
                  onClick={handleEditSubmit}
                  disabled={isSubmitting}
                  className="h-7 text-xs font-bold gap-1.5"
                  aria-label="Save edited ICD code"
                >
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  Save Code
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                  className="h-7 text-xs font-semibold"
                  aria-label="Cancel edit"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="h-7 text-xs font-bold gap-1.5"
                  aria-label={`Approve ICD code ${suggestion.code}`}
                >
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  Approve
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  disabled={isSubmitting}
                  className="h-7 text-xs font-semibold gap-1.5"
                  aria-label={`Edit ICD code ${suggestion.code}`}
                >
                  <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="h-7 text-xs font-semibold gap-1.5"
                  aria-label={`Reject ICD code ${suggestion.code}`}
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </article>
  );
};
