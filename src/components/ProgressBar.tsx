import React from "react";
import { QuotaDetail } from "../types/9router";
import { formatCountdown } from "../utils/formatTime";

interface ProgressBarProps {
  label: "session" | "weekly" | string;
  quota?: QuotaDetail;
  colorType?: "emerald" | "amber" | "blue" | "purple";
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  quota,
  colorType = label === "weekly" ? "amber" : "emerald",
}) => {
  if (!quota) return null;

  const used = quota.used ?? 0;
  const total = quota.total ?? 100;
  const remaining = quota.remaining ?? (total > 0 ? Math.max(0, Math.round(((total - used) / total) * 100)) : 100);
  const countdown = formatCountdown(quota.resetAt);

  const isAmber = colorType === "amber";
  const dotColor = isAmber ? "bg-amber-400" : "bg-emerald-400";
  const textColor = isAmber ? "text-amber-400" : "text-emerald-400";
  const barGradient = isAmber
    ? "bg-gradient-to-r from-amber-500 to-yellow-400"
    : "bg-gradient-to-r from-emerald-500 to-teal-400";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-gray-400 flex items-center gap-1.5 font-medium">
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
          {label}
        </span>
        <span className="font-mono text-gray-300">
          <span className="text-gray-400">{used}/{total}</span>
          <span className={`font-semibold ml-1.5 ${textColor}`}>{remaining}%</span>
          {countdown && (
            <span className="text-gray-500 text-[10px] ml-1">
              {countdown}
            </span>
          )}
        </span>
      </div>

      <div className="w-full bg-gray-800/90 h-1.5 rounded-full overflow-hidden border border-gray-700/30">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barGradient}`}
          style={{ width: `${Math.min(100, Math.max(0, remaining))}%` }}
        />
      </div>
    </div>
  );
};
