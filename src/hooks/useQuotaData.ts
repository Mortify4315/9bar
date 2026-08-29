import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AccountQuotaView } from "../types/9router";

async function fetchFromRouter(): Promise<AccountQuotaView[]> {
  const base = "http://127.0.0.1:20128";
  const res = await fetch(`${base}/api/providers/client?pageSize=100`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const json = await res.json();
  const connections = json.connections || [];

  const results: AccountQuotaView[] = await Promise.all(
    connections.map(async (conn: any) => {
      try {
        const usageRes = await fetch(`${base}/api/usage/${conn.id}`);
        if (!usageRes.ok) throw new Error(`Usage HTTP ${usageRes.status}`);
        const usage = await usageRes.json();
        const quotasMap = usage.quotas || {};
        return {
          id: conn.id,
          provider: conn.provider,
          name: conn.name || "Unnamed",
          email: conn.email || conn.name || "Unnamed",
          is_active: conn.isActive ?? false,
          test_status: conn.testStatus || "unknown",
          plan: usage.plan,
          limit_reached: usage.limitReached ?? false,
          reset_credits_available: usage.resetCredits?.availableCount ?? 0,
          session_quota: quotasMap.session,
          weekly_quota: quotasMap.weekly,
          quotas: quotasMap,
          error: undefined,
        };
      } catch (err: any) {
        return {
          id: conn.id,
          provider: conn.provider,
          name: conn.name || "Unnamed",
          email: conn.email || conn.name || "Unnamed",
          is_active: conn.isActive ?? false,
          test_status: conn.testStatus || "unknown",
          plan: undefined,
          limit_reached: false,
          reset_credits_available: 0,
          session_quota: undefined,
          weekly_quota: undefined,
          quotas: {},
          error: err?.message || "Failed to fetch usage",
        };
      }
    })
  );
  return results;
}

export function useQuotaData(refreshIntervalMs = 30000) {
  const [accounts, setAccounts] = useState<AccountQuotaView[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const isFetchingRef = useRef(false);

  const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

  const fetchQuotas = useCallback(async (isManual = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (isManual) setRefreshing(true);

    try {
      if (isTauri) {
        const data = await invoke<AccountQuotaView[]>("fetch_quotas", {});
        setAccounts(data);
      } else {
        const data = await fetchFromRouter();
        setAccounts(data);
      }
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
  }, [isTauri]);

  const openDashboard = useCallback(async () => {
    try {
      if (isTauri) {
        await invoke("open_dashboard_url", {});
      } else {
        window.open("http://localhost:20128/dashboard/quota", "_blank");
      }
    } catch (err) {
      console.error("Failed to open dashboard:", err);
    }
  }, [isTauri]);

  const hideWindow = useCallback(async () => {
    try {
      if (isTauri) {
        await invoke("hide_flyout_window", {});
      } else {
        window.close();
      }
    } catch (err) {
      console.error("Failed to hide window:", err);
    }
  }, [isTauri]);

  const togglePin = useCallback(async () => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    try {
      if (isTauri) {
        await invoke("set_pinned_state", { pinned: newPinned });
      }
    } catch (err) {
      console.error("Failed to set pin state:", err);
    }
  }, [isPinned, isTauri]);

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
    openDashboard,
    hideWindow,
  };
}
