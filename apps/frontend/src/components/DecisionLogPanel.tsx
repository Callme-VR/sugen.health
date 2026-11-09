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
      <Card className="rounded-[16px] border border-dashed border-border/80 bg-card/60">
        <CardContent className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-1.5 font-medium">
          <History className="w-4 h-4 text-muted-foreground/60" />
          <span>No clinician reviewer decisions recorded for this note yet.</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[16px] border border-border/80 bg-card shadow-xs">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-foreground">
            <History className="w-3.5 h-3.5 text-[#0075ff]" /> Append-Only Decision Audit Log
          </span>
          <Badge variant="secondary" className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-muted">
            {decisions.length} recorded
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {decisions.map((dec, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs p-3 rounded-xl bg-muted/60 border border-border/50"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                    dec.action === "approve"
                      ? "bg-[#00b24b]/15 text-[#00b24b] border-[#00b24b]/40 font-bold"
                      : dec.action === "reject"
                      ? "bg-rose-500/15 text-rose-500 border-rose-500/40 font-bold"
                      : "bg-[#0075ff]/15 text-[#0075ff] border-[#0075ff]/40 font-bold"
                  }`}
                >
                  {dec.action}
                </Badge>
                <span className="font-mono font-bold text-foreground shrink-0 text-xs">
                  {dec.code}
                  {dec.edited_code && (
                    <span className="text-[#0075ff] font-semibold ml-1.5 inline-flex items-center gap-0.5">
                      <ArrowRight className="w-3 h-3 inline" /> {dec.edited_code}
                    </span>
                  )}
                </span>
                {dec.reason && (
                  <span className="text-muted-foreground italic truncate max-w-xs font-medium">
                    &ldquo;{dec.reason}&rdquo;
                  </span>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground font-semibold shrink-0 pl-2">
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
