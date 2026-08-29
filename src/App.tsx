import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuotaData } from "./hooks/useQuotaData";
import { Header } from "./components/Header";
import { FilterBar } from "./components/FilterBar";
import { AccountCard } from "./components/AccountCard";
import { OfflineBanner } from "./components/OfflineBanner";
import { FilterMode, SortMode, AccountQuotaView } from "./types/9router";
import { Loader2, Layers } from "lucide-react";

export function App() {
  const {
    accounts,
    loading,
    refreshing,
    error,
    lastUpdated,
    isPinned,
    togglePin,
    fetchQuotas,
    toggleAccount,
    resetCredits,
    openDashboard,
    hideWindow,
  } = useQuotaData(30000);

  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [sort, setSort] = useState<SortMode>("default");

  // Extract distinct providers list
  const availableProviders = useMemo(() => {
    const set = new Set<string>();
    for (const a of accounts) {
      if (a.provider) set.add(a.provider);
    }
    return Array.from(set);
  }, [accounts]);

  // Filtering and sorting logic
  const filteredAndSortedAccounts = useMemo(() => {
    let result = [...accounts];

    // Filter by provider
    if (selectedProvider !== "all") {
      result = result.filter(
        (a) => a.provider.toLowerCase() === selectedProvider.toLowerCase()
      );
    }

    // Filter by active status
    if (filter === "active") {
      result = result.filter((a) => a.is_active);
    } else if (filter === "inactive") {
      result = result.filter((a) => !a.is_active);
    }

    // Helper to get remaining %
    const getRemaining = (a: AccountQuotaView) => {
      const q = a.session_quota || a.weekly_quota;
      if (!q) return 100;
      if (q.remaining !== undefined) return q.remaining;
      const total = q.total || 100;
      const used = q.used || 0;
      return total > 0 ? ((total - used) / total) * 100 : 0;
    };

    // Helper for resetAt timestamp
    const getResetTime = (a: AccountQuotaView) => {
      const q = a.session_quota || a.weekly_quota;
      return q?.resetAt ? new Date(q.resetAt).getTime() : Infinity;
    };

    // Sort
    if (sort === "remaining-asc") {
      result.sort((a, b) => getRemaining(a) - getRemaining(b));
    } else if (sort === "remaining-desc") {
      result.sort((a, b) => getRemaining(b) - getRemaining(a));
    } else if (sort === "expiring-first") {
      result.sort((a, b) => getResetTime(a) - getResetTime(b));
    }

    return result;
  }, [accounts, selectedProvider, filter, sort]);

  // Turn off empty accounts (remaining <= 5%)
  const handleTurnOffEmpty = useCallback(async () => {
    for (const acc of accounts) {
      if (acc.is_active) {
        const q = acc.session_quota || acc.weekly_quota;
        const remaining = q?.remaining ?? (q && q.total ? ((q.total - (q.used || 0)) / q.total) * 100 : 100);
        if (remaining <= 5) {
          toggleAccount(acc.id, true);
        }
      }
    }
  }, [accounts, toggleAccount]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or select
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Hotkey 'R' or 'r': Refresh quotas
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        fetchQuotas(true);
        return;
      }

      // Hotkey 'Escape': Hide / minimize HUD
      if (e.key === "Escape") {
        e.preventDefault();
        hideWindow();
        return;
      }

      // Number keys 1-9: Toggle account by index
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= 9) {
        const targetAcc = filteredAndSortedAccounts[num - 1];
        if (targetAcc) {
          e.preventDefault();
          toggleAccount(targetAcc.id, targetAcc.is_active);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredAndSortedAccounts, fetchQuotas, hideWindow, toggleAccount]);

  return (
    <div className="w-full h-full bg-[#0c0d11] text-zinc-100 border border-zinc-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col font-mono select-none">
      {/* Header with Draggable Region & Pin Toggle */}
      <Header
        accountCount={filteredAndSortedAccounts.length}
        refreshing={refreshing}
        isPinned={isPinned}
        onTogglePin={togglePin}
        onRefresh={() => fetchQuotas(true)}
        onOpenDashboard={openDashboard}
        onClose={hideWindow}
      />

      {/* Filter and Sort Controls */}
      <FilterBar
        providers={availableProviders}
        selectedProvider={selectedProvider}
        onProviderChange={setSelectedProvider}
        filter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
        onTurnOffEmpty={handleTurnOffEmpty}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {error && (
          <OfflineBanner
            error={error}
            onRetry={() => fetchQuotas(true)}
            retrying={refreshing}
          />
        )}

        {loading && accounts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-12 text-zinc-500 space-y-2 font-mono">
            <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
            <span className="text-[11px]">[INITIALIZING KERNEL SYNC...]</span>
          </div>
        ) : filteredAndSortedAccounts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-12 text-zinc-500 space-y-2 font-mono">
            <Layers className="w-6 h-6 opacity-30" />
            <span className="text-[11px]">[NO ACCOUNTS MATCH CRITERIA]</span>
          </div>
        ) : (
          filteredAndSortedAccounts.map((account, idx) => (
            <AccountCard
              key={account.id}
              account={account}
              index={idx}
              onToggle={toggleAccount}
              onResetCredits={resetCredits}
            />
          ))
        )}

        {/* Hotkeys helper footer badge */}
        {filteredAndSortedAccounts.length > 0 && (
          <div className="p-1.5 bg-zinc-950/60 border border-dashed border-zinc-800 rounded text-[9px] text-zinc-500 flex items-center justify-between">
            <span>HOTKEYS:</span>
            <span className="text-zinc-400">
              <kbd className="px-1 bg-zinc-800 text-zinc-300 rounded">1-9</kbd> Toggle • <kbd className="px-1 bg-zinc-800 text-zinc-300 rounded">R</kbd> Sync • <kbd className="px-1 bg-zinc-800 text-zinc-300 rounded">Esc</kbd> Close
            </span>
          </div>
        )}
      </div>

      {/* Status Footer */}
      <div className="px-3 py-2 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              error ? "bg-rose-500" : "bg-emerald-400 animate-pulse-subtle shadow-[0_0_6px_#34d399]"
            }`}
          />
          <span className="font-mono">
            {error ? "[RPC_OFFLINE]" : "127.0.0.1:20128 [ESTABLISHED]"}
          </span>
        </div>

        <div className="text-[9px] text-zinc-500">
          {lastUpdated ? (
            <span>
              SYNC {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          ) : (
            <span>POLL: 30s</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
