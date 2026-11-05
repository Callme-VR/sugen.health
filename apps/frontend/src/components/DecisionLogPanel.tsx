import React from "react";
import { Decision } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, ArrowRight } from "lucide-react";

interface DecisionLogPanelProps {
  decisions: Decision[];
}

export const DecisionLogPanel: React.FC<DecisionLogPanelProps> = ({ decisions }) => {
  if (decisions.length === 0) {
    return (
      <Card className="border-dashed border-border/80">
        <CardContent className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-1.5">
          <History className="w-4 h-4 text-muted-foreground/60" />
          <span>No clinician reviewer decisions recorded for this note yet.</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/80 shadow-xs">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" /> Append-Only Decision Audit Log
          </span>
          <Badge variant="secondary" className="text-[11px] font-normal px-2 py-0">
            {decisions.length} actions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {decisions.map((dec, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-muted/40 border border-border/50"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold uppercase px-1.5 py-0 shrink-0 ${dec.action === "approve"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                      : dec.action === "reject"
                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                        : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                    }`}
                >
                  {dec.action}
                </Badge>
                <span className="font-mono font-bold text-foreground shrink-0">
                  {dec.code}
                  {dec.edited_code && (
                    <span className="text-primary font-normal ml-1 inline-flex items-center gap-0.5">
                      <ArrowRight className="w-3 h-3 inline" /> {dec.edited_code}
                    </span>
                  )}
                </span>
                {dec.reason && (
                  <span className="text-muted-foreground italic truncate max-w-xs">
                    &ldquo;{dec.reason}&rdquo;
                  </span>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground shrink-0 pl-2">
                {new Date(dec.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
