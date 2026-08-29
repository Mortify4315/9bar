import { useState, useMemo } from "react";
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

  const [selectedProvider, setSelectedProvider] = useState<string>("codex");
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
  const handleTurnOffEmpty = async () => {
    for (const acc of accounts) {
      if (acc.is_active) {
        const q = acc.session_quota || acc.weekly_quota;
        const remaining = q?.remaining ?? (q && q.total ? ((q.total - (q.used || 0)) / q.total) * 100 : 100);
        if (remaining <= 5) {
          toggleAccount(acc.id, true);
        }
      }
    }
  };

  return (
    <div className="w-[380px] h-[520px] bg-[#12151d]/95 text-gray-100 border border-gray-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl">
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
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {error && (
          <OfflineBanner
            error={error}
            onRetry={() => fetchQuotas(true)}
            retrying={refreshing}
          />
        )}

        {loading && accounts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-12 text-gray-500 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs">Connecting to 9Router...</span>
          </div>
        ) : filteredAndSortedAccounts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-12 text-gray-500 space-y-2">
            <Layers className="w-8 h-8 opacity-40" />
            <span className="text-xs">No accounts found in this view</span>
          </div>
        ) : (
          filteredAndSortedAccounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onToggle={toggleAccount}
              onResetCredits={resetCredits}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-[#0f1118] border-t border-gray-800 flex items-center justify-between text-[10px] text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${error ? "bg-red-400" : "bg-emerald-400 animate-pulse-subtle"}`} />
          <span className="font-mono">{error ? "Offline" : ":20128 Connected"}</span>
        </div>

        <div>
          {lastUpdated ? (
            <span>
              Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          ) : (
            <span>Auto-refresh (30s)</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
