import React from "react";
import { SuggestionStatus } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: SuggestionStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    verified: {
      label: "Verified",
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#00b24b]" />,
      className: "bg-[#00b24b]/10 text-[#00b24b] border-[#00b24b]/30 font-semibold dark:bg-[#00b24b]/15 dark:text-[#00e660] dark:border-[#00b24b]/40",
    },
    needs_review: {
      label: "Needs Review",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
      className: "bg-amber-500/10 text-amber-600 border-amber-500/30 font-semibold dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/40",
    },
    rejected: {
      label: "Rejected",
      icon: <XCircle className="w-3.5 h-3.5 text-rose-500" />,
      className: "bg-rose-500/10 text-rose-600 border-rose-500/30 font-semibold dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/40",
    },
  }[status];

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full transition-all duration-200 ${config.className}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  );
};
