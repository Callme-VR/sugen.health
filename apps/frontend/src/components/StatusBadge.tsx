import React from "react";
import clsx from "clsx";
import { SuggestionStatus } from "@/lib/api";

interface StatusBadgeProps {
  status: SuggestionStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    verified: {
      label: "Verified",
      icon: "✓",
      className: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    },
    needs_review: {
      label: "Needs Review",
      icon: "⚠",
      className: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    },
    rejected: {
      label: "Rejected",
      icon: "✕",
      className: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800",
    },
  }[status];

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        config.className
      )}
    >
      <span aria-hidden="true" className="font-bold">
        {config.icon}
      </span>
      <span>{config.label}</span>
    </span>
  );
};

