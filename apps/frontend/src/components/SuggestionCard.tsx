"use client";

import React, { useState } from "react";
import { VerifiedSuggestion, DecisionCreate } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

interface SuggestionCardProps {
  suggestion: VerifiedSuggestion;
  noteId: string;
  onDecision: (decision: DecisionCreate) => Promise<void>;
}

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

  const formatReason = (r: string) => {
    switch (r) {
      case "QUOTE_NOT_FOUND":
        return "Exact quote was not found in the note text.";
      case "INVALID_CODE":
        return "ICD-11 code does not exist in the classification table.";
      case "TITLE_MISMATCH":
        return "Clinical title differs from official ICD-11 designation.";
      case "NEGATED":
        return "Condition appears negated in the note (e.g. denies, no).";
      case "HYPOTHETICAL":
        return "Condition is tentative, hypothetical, or under differential query.";
      case "FAMILY_HISTORY":
        return "Condition describes a family member's medical history.";
      case "ICD_UNAVAILABLE":
        return "ICD-11 verification service was unreachable.";
      default:
        return r;
    }
  };

  const handleApprove = async () => {
    if (suggestion.status === "rejected" && !customReason.trim()) {
      setErrorMsg("A written reason is required to approve a verifier-rejected code.");
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
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-base bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-900 dark:text-zinc-100">
            {suggestion.code}
          </span>
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
            {suggestion.title}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={suggestion.status} />
          {suggestion.status === "rejected" && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 ml-1 underline cursor-pointer"
              aria-label="Toggle card details"
            >
              {collapsed ? "Expand" : "Collapse"}
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="mt-4 space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
              Evidence Quote
            </span>
            <blockquote className="text-xs bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded border-l-2 border-zinc-300 dark:border-zinc-700 italic text-zinc-700 dark:text-zinc-300">
              &ldquo;{suggestion.evidence_quote}&rdquo;
            </blockquote>
          </div>

          {suggestion.reasons.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                Verifier Notes
              </span>
              <ul className="list-disc list-inside text-xs text-amber-700 dark:text-amber-400 space-y-0.5">
                {suggestion.reasons.map((r, i) => (
                  <li key={i}>{formatReason(r)}</li>
                ))}
              </ul>
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-950/40 p-2 rounded">
              {errorMsg}
            </p>
          )}

          {/* Form for reason if approving rejected card or editing */}
          {(suggestion.status === "rejected" || isEditing) && (
            <div className="space-y-2 pt-1">
              {isEditing && (
                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                    New ICD-11 Code:
                  </label>
                  <input
                    type="text"
                    value={editedCode}
                    onChange={(e) => setEditedCode(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    placeholder="e.g. BA41"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  {suggestion.status === "rejected"
                    ? "Justification to Override Rejection (Required):"
                    : "Reviewer Comment:"}
                </label>
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  placeholder="Enter reason..."
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleEditSubmit}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer disabled:opacity-50"
                >
                  Save Code
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Edit Code
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
