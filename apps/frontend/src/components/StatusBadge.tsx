import React from "react";
import { SuggestionStatus } from "@/lib/api";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: SuggestionStatus;
}

/* ─── StatusBadge ────────────────────────────────────────────────────────── */
/* Semantic status indicator consuming CSS tokens — no hardcoded hex.          */
/* Rounded pill is appropriate here (quantitative status chip).                */
const statusConfig: Record<
  SuggestionStatus,
  { label: string; colorClass: string; Icon: React.ElementType }
> = {
  verified: {
    label: "Verified",
    Icon: CheckCircle2,
    colorClass:
      "bg-success/10 text-success border border-success/30",
  },
  needs_review: {
    label: "Needs Review",
    Icon: AlertTriangle,
    colorClass:
      "bg-warning/10 text-warning border border-warning/30",
  },
  rejected: {
    label: "Rejected",
    Icon: XCircle,
    colorClass:
      "bg-destructive/10 text-destructive border border-destructive/30",
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { label, Icon, colorClass } = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-snap ${colorClass}`}
      aria-label={`Status: ${label}`}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {label}
    </span>
  );
};
