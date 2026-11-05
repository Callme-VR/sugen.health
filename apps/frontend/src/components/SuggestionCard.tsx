"use client";

import React, { useState } from "react";
import { VerifiedSuggestion, DecisionCreate } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, Edit3, X, ChevronDown, ChevronUp, AlertCircle, Quote } from "lucide-react";

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
    <Card className="border border-border/70 shadow-sm transition-all duration-200 hover:shadow-md">
      <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between space-y-0 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-mono font-bold text-xs bg-muted text-foreground px-2.5 py-1 rounded-md border border-border/80 shrink-0">
            {suggestion.code}
          </span>
          <h4 className="font-semibold text-foreground text-sm truncate">
            {suggestion.title}
          </h4>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={suggestion.status} />
          {suggestion.status === "rejected" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Toggle card details"
            >
              {collapsed ? (
                <span className="flex items-center gap-1">
                  Expand <ChevronDown className="w-3.5 h-3.5" />
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  Collapse <ChevronUp className="w-3.5 h-3.5" />
                </span>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="p-4 pt-1 space-y-3.5 border-t border-border/40">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1.5">
              <Quote className="w-3 h-3" /> Cited Evidence Quote
            </span>
            <blockquote className="text-xs bg-muted/60 p-3 rounded-lg border-l-2 border-primary/60 italic text-foreground/90">
              &ldquo;{suggestion.evidence_quote}&rdquo;
            </blockquote>
          </div>

          {suggestion.reasons.length > 0 && (
            <div className="bg-amber-500/10 dark:bg-amber-500/15 p-3 rounded-lg border border-amber-500/20">
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                <AlertCircle className="w-3 h-3" /> Verifier Warnings
              </span>
              <ul className="list-disc list-inside text-xs text-amber-800 dark:text-amber-300 space-y-1">
                {suggestion.reasons.map((r, i) => (
                  <li key={i}>{formatReason(r)}</li>
                ))}
              </ul>
            </div>
          )}

          {errorMsg && (
            <div className="text-xs text-destructive font-medium bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form for reason if approving rejected card or editing */}
          {(suggestion.status === "rejected" || isEditing) && (
            <div className="space-y-2.5 pt-1">
              {isEditing && (
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    New ICD-11 Code:
                  </label>
                  <Input
                    type="text"
                    value={editedCode}
                    onChange={(e) => setEditedCode(e.target.value)}
                    className="font-mono text-xs h-8"
                    placeholder="e.g. BA41"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  {suggestion.status === "rejected"
                    ? "Clinical Justification to Override Rejection (Required):"
                    : "Reviewer Note / Comment:"}
                </label>
                <Input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="text-xs h-8"
                  placeholder="Enter reason..."
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1.5">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  onClick={handleEditSubmit}
                  disabled={isSubmitting}
                  className="h-8 text-xs font-semibold gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Save Code
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                  className="h-8 text-xs"
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
                  className="h-8 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Check className="w-3.5 h-3.5" /> Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  disabled={isSubmitting}
                  className="h-8 text-xs font-medium gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="h-8 text-xs font-medium gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                >
                  <X className="w-3.5 h-3.5" /> Reject
                </Button>
              </>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
