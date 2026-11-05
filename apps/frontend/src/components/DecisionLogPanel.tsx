import React from "react";
import { Decision } from "@/lib/api";

interface DecisionLogPanelProps {
  decisions: Decision[];
}

export const DecisionLogPanel: React.FC<DecisionLogPanelProps> = ({ decisions }) => {
  if (decisions.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 text-center text-xs text-zinc-500">
        No reviewer decisions recorded for this note yet.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
        Append-Only Decision Audit Log ({decisions.length})
      </h3>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {decisions.map((dec, i) => (
          <div
            key={i}
            className="flex items-center justify-between text-xs p-2.5 rounded bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800"
          >
            <div className="flex items-center gap-2">
              <span
                className={`font-semibold uppercase text-[10px] px-1.5 py-0.5 rounded ${dec.action === "approve"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : dec.action === "reject"
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                  }`}
              >
                {dec.action}
              </span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {dec.code}
                {dec.edited_code && (
                  <span className="text-blue-600 font-normal ml-1">
                    &rarr; {dec.edited_code}
                  </span>
                )}
              </span>
              {dec.reason && (
                <span className="text-zinc-500 italic max-w-xs truncate">
                  &ldquo;{dec.reason}&rdquo;
                </span>
              )}
            </div>
            <div className="text-[11px] text-zinc-400">
              {new Date(dec.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
