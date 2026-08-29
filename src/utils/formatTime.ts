export function formatCountdown(resetAtStr?: string): string {
  if (!resetAtStr) return "";
  try {
    const target = new Date(resetAtStr).getTime();
    const now = Date.now();
    const diffMs = target - now;

    if (diffMs <= 0) return "ready";

    const diffSec = Math.floor(diffMs / 1000);
    const days = Math.floor(diffSec / 86400);
    const hours = Math.floor((diffSec % 86400) / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);

    if (days > 0) {
      return `in ${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `in ${minutes}m`;
    }
    return `in <1m`;
  } catch {
    return "";
  }
}
