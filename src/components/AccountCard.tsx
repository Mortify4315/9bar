import React from "react";
import { AccountQuotaView, QuotaDetail } from "../types/9router";
import { formatCountdown } from "../utils/formatTime";
import { AlertCircle, RotateCcw } from "lucide-react";

interface AccountCardProps {
  account: AccountQuotaView;
  index?: number;
  onToggle: (id: string, currentActive: boolean) => void;
  onResetCredits: (id: string) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  index,
  onToggle,
  onResetCredits,
}) => {
  const isCodex = account.provider.toLowerCase().includes("codex");
  const isClaude = account.provider.toLowerCase().includes("claude");
  const providerLabel = isCodex ? "CODEX" : isClaude ? "CLAUDE" : account.provider.toUpperCase();
  const planLabel = account.plan ? account.plan.toUpperCase() : "STD";
  const accountIdBadge = index !== undefined ? `#${(index + 1).toString().padStart(2, "0")}` : `#${account.id.slice(0, 3).toUpperCase()}`;

  // Helper for single bento box metrics
  const renderBentoBox = (title: string, quota?: QuotaDetail) => {
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
      {/* Bento Header */}
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
          {/* Reset credits available badge / action */}
          {account.reset_credits_available > 0 && (
            <button
              onClick={() => onResetCredits(account.id)}
              title={`${account.reset_credits_available} Reset Credit Available - Click to Reset`}
              className="text-[9px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1 border border-amber-500/40 cursor-pointer active:scale-95 transition-all"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>{account.reset_credits_available}_CRED</span>
            </button>
          )}

          {/* Active status pill */}
          <span
            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
              account.is_active
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                : "bg-zinc-900 text-zinc-500 border-zinc-800"
            }`}
          >
            {account.is_active ? "LIVE" : "OFF"}
          </span>

          {/* Tactile Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={account.is_active}
              onChange={() => onToggle(account.id, account.is_active)}
              className="sr-only peer"
            />
            <div className="w-6 h-3.5 bg-zinc-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-2.5 peer-checked:after:bg-emerald-400 after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-zinc-500 after:rounded-full after:h-3 after:w-3 after:transition-all border border-zinc-700 peer-checked:border-emerald-500/50 peer-checked:bg-emerald-950"></div>
          </label>
        </div>
      </div>

      {/* Bento Telemetry Split-Box Grid */}
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
          {account.session_quota && renderBentoBox("SESSION QUOTA", account.session_quota)}
          {account.weekly_quota && renderBentoBox("WEEKLY TIER", account.weekly_quota)}

          {/* Fallback for single generic quotas */}
          {!account.session_quota &&
            !account.weekly_quota &&
            Object.entries(account.quotas).map(([k, q]) => (
              <React.Fragment key={k}>
                {renderBentoBox(k.toUpperCase(), q)}
              </React.Fragment>
            ))}
        </div>
      )}
    </div>
  );
};
