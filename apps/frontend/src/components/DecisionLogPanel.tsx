import React from "react";
import { Decision } from "@/lib/api";
import { History, ArrowRight } from "lucide-react";

interface DecisionLogPanelProps {
  decisions: Decision[];
}

/* ─── DecisionLogPanel ───────────────────────────────────────────────────── */
/* Append-only audit log of clinician decisions for a note.                    */
/* Uses structural 1px borders and tonal surfaces — no hardcoded hex.          */
export const DecisionLogPanel: React.FC<DecisionLogPanelProps> = ({
  decisions,
}) => {
  if (decisions.length === 0) {
    return (
      <section
        aria-label="Decision audit log — empty"
        className="border border-dashed border-border rounded-sm bg-card"
      >
        <div className="p-6 text-center flex flex-col items-center justify-center gap-1.5">
          <History
            className="w-4 h-4 text-muted-foreground/60"
            aria-hidden="true"
          />
          <p className="text-xs text-muted-foreground font-semibold">
            No clinician decisions recorded for this note yet.
          </p>
        </div>
      </section>
    );
  }

  /* Action → token class mapping */
  const actionStyle: Record<
    Decision["action"],
    { label: string; className: string }
  > = {
    approve: {
      label: "Approved",
      className:
        "bg-success/10 text-success border border-success/30",
    },
    reject: {
      label: "Rejected",
      className:
        "bg-destructive/10 text-destructive border border-destructive/30",
    },
    edit: {
      label: "Edited",
      className:
        "bg-secondary/10 text-secondary border border-secondary/30",
    },
  };

  return (
    <section
      aria-label={`Decision audit log — ${decisions.length} recorded`}
      className="border border-border rounded-sm bg-card shadow-xs"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <History
            className="w-3.5 h-3.5 text-secondary"
            aria-hidden="true"
          />
          Append-Only Decision Audit Log
        </h3>
        <span className="text-[11px] font-bold text-muted-foreground tabular-nums">
          {decisions.length} recorded
        </span>
      </div>

      {/* Decision rows */}
      <div
        className="divide-hairline max-h-60 overflow-y-auto"
        role="log"
        aria-live="polite"
        aria-label="Decision history"
      >
        {decisions.map((dec, i) => {
          const style = actionStyle[dec.action];
          return (
            <div
              key={i}
              className="flex items-center justify-between gap-3 px-4 py-3 text-xs"
            >
              {/* Left: action badge + code + reason */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${style.className}`}
                >
                  {style.label}
                </span>

                <span className="font-mono font-bold text-foreground shrink-0">
                  {dec.code}
                  {dec.edited_code && (
                    <span className="text-secondary font-semibold ml-1.5 inline-flex items-center gap-0.5">
                      <ArrowRight
                        className="w-3 h-3 inline"
                        aria-hidden="true"
                      />
                      {dec.edited_code}
                    </span>
                  )}
                </span>

                {dec.reason && (
                  <span className="text-muted-foreground italic truncate font-semibold">
                    &ldquo;{dec.reason}&rdquo;
                  </span>
                )}
              </div>

              {/* Right: timestamp */}
              <time
                className="text-[11px] text-muted-foreground font-semibold shrink-0 pl-2 tabular-nums"
                dateTime={dec.timestamp}
              >
                {new Date(dec.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </time>
            </div>
          );
        })}
      </div>
    </section>
  );
};
