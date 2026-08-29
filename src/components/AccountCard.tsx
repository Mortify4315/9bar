import React from "react";
import { AccountQuotaView, QuotaDetail } from "../types/9router";
import { formatCountdown } from "../utils/formatTime";
import { AlertCircle } from "lucide-react";

interface AccountCardProps {
  account: AccountQuotaView;
  index?: number;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  index,
}) => {
  const isCodex = account.provider.toLowerCase().includes("codex");
  const isClaude = account.provider.toLowerCase().includes("claude");
  const providerLabel = isCodex ? "CODEX" : isClaude ? "CLAUDE" : account.provider.toUpperCase();
  const planLabel = account.plan ? account.plan.toUpperCase() : "STD";
  const accountIdBadge = index !== undefined ? `#${(index + 1).toString().padStart(2, "0")}` : `#${account.id.slice(0, 3).toUpperCase()}`;

  // Helper for single quota metric box
  const renderQuotaBox = (title: string, quota?: QuotaDetail) => {
    if (!quota) return null;
    const used = quota.used ?? 0;
    const total = quota.total ?? 100;
    const remaining = quota.remaining ?? (total > 0 ? Math.max(0, Math.round(((total - used) / total) * 100)) : 100);
    const countdown = formatCountdown(quota.resetAt);

    let textColor = "text-emerald-400";
    let barColor = "bg-emerald-400";
    if (remaining < 15) {
      textColor = "text-rose-400";
      barColor = "bg-rose-500";
    } else if (remaining < 50) {
      textColor = "text-amber-400";
      barColor = "bg-amber-400";
    }

    return (
      <div className="bg-zinc-950 p-2 rounded border border-zinc-800/90 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
            <span>{title}</span>
            <span className="text-zinc-500 font-normal">{used}/{total}</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-xs font-bold tabular-nums ${textColor}`}>{remaining}%</span>
          </div>
        </div>

        <div className="mt-1.5 space-y-1">
          <div className="w-full bg-zinc-900 h-1 rounded-xs overflow-hidden border border-zinc-800">
            <div
              className={`h-full rounded-xs transition-all duration-300 ${barColor}`}
              style={{ width: `${Math.min(100, Math.max(0, remaining))}%` }}
            />
          </div>
          <div className="text-[9px] text-zinc-500 tabular-nums truncate">
            {countdown ? `Reset: ${countdown}` : "Continuous"}
          </div>
        </div>
      </div>
    );
  };

  const hasDualQuotas = Boolean(account.session_quota && account.weekly_quota);

  return (
    <div
      className={`p-2.5 rounded-lg border transition-all duration-150 font-mono select-none ${
        account.is_active
          ? "bg-[#15171e] border-zinc-800 hover:border-zinc-600 shadow-sm"
          : "bg-[#101217]/60 border-zinc-900 opacity-50 hover:opacity-80"
      }`}
    >
      {/* Account Header */}
      <div className="flex items-start justify-between pb-2 border-b border-zinc-800/80 gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {index !== undefined && (
              <span className="text-[9px] px-1 py-0.2 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded font-bold">
                [{index + 1}]
              </span>
            )}
            <span
              title={account.email || account.name}
              className="text-[11px] font-bold text-zinc-200 truncate block"
            >
              {account.email || account.name}
            </span>
          </div>
          <div className="text-[9px] text-zinc-500 mt-0.5 tracking-tight truncate">
            [ID: {accountIdBadge} • {providerLabel}_{planLabel}]
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
          {/* Active status pill */}
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border tracking-wider ${
              account.is_active
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-xs"
                : "bg-zinc-900 text-zinc-500 border-zinc-800"
            }`}
          >
            {account.is_active ? "LIVE" : "OFF"}
          </span>
        </div>
      </div>

      {/* Quota Telemetry Split-Box Grid */}
      {account.error ? (
        <div className="flex items-center gap-1.5 text-rose-400 text-[10px] py-2 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">[ERR: {account.error}]</span>
        </div>
      ) : (
        <div
          className={`grid ${
            hasDualQuotas ? "grid-cols-2" : "grid-cols-1"
          } gap-2 pt-2 text-[10px]`}
        >
          {account.session_quota && renderQuotaBox("SESSION QUOTA", account.session_quota)}
          {account.weekly_quota && renderQuotaBox("WEEKLY TIER", account.weekly_quota)}

          {/* Fallback for single generic quotas */}
          {!account.session_quota &&
            !account.weekly_quota &&
            Object.entries(account.quotas).map(([k, q]) => (
              <React.Fragment key={k}>
                {renderQuotaBox(k.toUpperCase(), q)}
              </React.Fragment>
            ))}
        </div>
      )}
    </div>
  );
};
