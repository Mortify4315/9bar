import React from "react";
import { AccountQuotaView } from "../types/9router";
import { ProgressBar } from "./ProgressBar";
import { AlertCircle, RotateCcw } from "lucide-react";

interface AccountCardProps {
  account: AccountQuotaView;
  onToggle: (id: string, currentActive: boolean) => void;
  onResetCredits: (id: string) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onToggle,
  onResetCredits,
}) => {
  const isCodex = account.provider.toLowerCase().includes("codex");
  const isQoder = account.provider.toLowerCase().includes("qoder");
  const isClaude = account.provider.toLowerCase().includes("claude");

  // Icon badge styling based on provider
  let badgeBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  if (isQoder) badgeBg = "bg-blue-500/10 text-blue-400 border-blue-500/30";
  if (isClaude) badgeBg = "bg-purple-500/10 text-purple-400 border-purple-500/30";

  return (
    <div
      className={`rounded-xl border p-3 transition-all duration-200 ${
        account.is_active
          ? "bg-[#181c26] border-gray-700/80 shadow-md hover:border-gray-600"
          : "bg-[#14171f]/60 border-gray-800/60 opacity-60 hover:opacity-85"
      }`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 overflow-hidden mr-2">
          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center text-[10px] font-bold shrink-0 ${badgeBg}`}
          >
            {isCodex ? "⚡" : isClaude ? "✦" : "⌥"}
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-gray-200 truncate">
              {account.email || account.name}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {account.plan && (
            <span className="text-[10px] font-medium bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700/50 uppercase tracking-wider">
              {account.plan}
            </span>
          )}

          {/* Reset credits button if available */}
          {account.reset_credits_available > 0 && (
            <button
              onClick={() => onResetCredits(account.id)}
              title={`${account.reset_credits_available} Reset Credit Available - Click to Reset`}
              className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1 border border-amber-500/40 cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              {account.reset_credits_available}
            </button>
          )}

          {/* Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={account.is_active}
              onChange={() => onToggle(account.id, account.is_active)}
              className="sr-only peer"
            />
            <div className="w-7 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>

      {/* Quotas */}
      {account.error ? (
        <div className="flex items-center gap-1.5 text-red-400 text-[11px] py-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{account.error}</span>
        </div>
      ) : (
        <div className="space-y-2 pt-0.5">
          {account.session_quota && (
            <ProgressBar label="session" quota={account.session_quota} colorType="emerald" />
          )}
          {account.weekly_quota && (
            <ProgressBar label="weekly" quota={account.weekly_quota} colorType="amber" />
          )}

          {/* Fallback for other quotas */}
          {!account.session_quota &&
            !account.weekly_quota &&
            Object.entries(account.quotas).map(([k, q]) => (
              <ProgressBar key={k} label={k} quota={q} colorType="emerald" />
            ))}
        </div>
      )}
    </div>
  );
};
