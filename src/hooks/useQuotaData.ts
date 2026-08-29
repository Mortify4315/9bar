import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AccountQuotaView } from "../types/9router";

export function useQuotaData(refreshIntervalMs = 30000) {
  const [accounts, setAccounts] = useState<AccountQuotaView[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const isFetchingRef = useRef(false);

  const fetchQuotas = useCallback(async (isManual = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (isManual) setRefreshing(true);

    try {
      const data = await invoke<AccountQuotaView[]>("fetch_quotas", {});
      setAccounts(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const msg = typeof err === "string" ? err : (err as Error)?.message || "Failed to connect to 9Router";
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

  const toggleAccount = useCallback(async (id: string, currentActive: boolean) => {
    const newActive = !currentActive;
    // Optimistic UI update
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, is_active: newActive } : acc))
    );

    try {
      await invoke("toggle_provider_account", { id, isActive: newActive });
    } catch (err) {
      console.error("Failed to toggle account:", err);
      // Revert on error
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === id ? { ...acc, is_active: currentActive } : acc))
      );
    }
  }, []);

  const resetCredits = useCallback(async (id: string) => {
    try {
      await invoke("reset_account_credits", { id });
      await fetchQuotas(true);
    } catch (err) {
      console.error("Failed to reset credits:", err);
    }
  }, [fetchQuotas]);

  const openDashboard = useCallback(async () => {
    try {
      await invoke("open_dashboard_url", {});
    } catch (err) {
      console.error("Failed to open dashboard:", err);
    }
  }, []);

  const hideWindow = useCallback(async () => {
    try {
      await invoke("hide_flyout_window", {});
    } catch (err) {
      console.error("Failed to hide window:", err);
    }
  }, []);

  const togglePin = useCallback(async () => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    try {
      await invoke("set_pinned_state", { pinned: newPinned });
    } catch (err) {
      console.error("Failed to set pin state:", err);
    }
  }, [isPinned]);

  // Periodic polling
  useEffect(() => {
    fetchQuotas(false);

    if (refreshIntervalMs > 0) {
      const timer = setInterval(() => {
        fetchQuotas(false);
      }, refreshIntervalMs);
      return () => clearInterval(timer);
    }
  }, [fetchQuotas, refreshIntervalMs]);

  return {
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
  };
}
