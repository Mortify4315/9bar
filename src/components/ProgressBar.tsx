import React from "react";
import { QuotaDetail } from "../types/9router";
import { formatCountdown } from "../utils/formatTime";

interface ProgressBarProps {
  label: "session" | "weekly" | string;
  quota?: QuotaDetail;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  quota,
}) => {
  if (!quota) return null;

  const used = quota.used ?? 0;
  const total = quota.total ?? 100;
  const remaining = quota.remaining ?? (total > 0 ? Math.max(0, Math.round(((total - used) / total) * 100)) : 100);
  const countdown = formatCountdown(quota.resetAt);

  // Dynamic semantic color threshold
  let textColor = "text-emerald-400";
  let barColor = "bg-emerald-400";
  let dotColor = "bg-emerald-400";

  if (remaining < 15) {
    textColor = "text-rose-400";
    barColor = "bg-rose-500";
    dotColor = "bg-rose-500";
  } else if (remaining < 50) {
    textColor = "text-amber-400";
    barColor = "bg-amber-400";
    dotColor = "bg-amber-400";
  }

  return (
    <div className="space-y-1 font-mono text-[10px]">
      <div className="flex items-center justify-between">
        <span className="text-zinc-400 flex items-center gap-1 uppercase tracking-wider font-semibold text-[9px]">
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
          {label}
        </span>
        <span className="tabular-nums">
          <span className="text-zinc-500">{used}/{total}</span>
          <span className={`font-bold ml-1 ${textColor}`}>{remaining}%</span>
          {countdown && (
            <span className="text-zinc-400 ml-1">
              • {countdown}
            </span>
          )}
        </span>
      </div>

      <div className="w-full bg-zinc-950 h-1.5 rounded-xs overflow-hidden border border-zinc-800/90">
        <div
          className={`h-full rounded-xs transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.min(100, Math.max(0, remaining))}%` }}
        />
      </div>
    </div>
  );
};
