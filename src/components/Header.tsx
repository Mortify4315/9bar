import React from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { RefreshCw, ExternalLink, X, Pin, PinOff } from "lucide-react";

interface HeaderProps {
  accountCount: number;
  refreshing: boolean;
  isPinned: boolean;
  onTogglePin: () => void;
  onRefresh: () => void;
  onOpenDashboard: () => void;
  onClose: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  accountCount,
  refreshing,
  isPinned,
  onTogglePin,
  onRefresh,
  onOpenDashboard,
  onClose,
}) => {
  const handleMouseDown = async (e: React.MouseEvent) => {
    // Only trigger drag on left click and ignore interactive controls
    if (
      e.button === 0 &&
      !(e.target as HTMLElement).closest("button") &&
      !(e.target as HTMLElement).closest("input") &&
      !(e.target as HTMLElement).closest("select")
    ) {
      e.preventDefault();
      try {
        await getCurrentWindow().startDragging();
      } catch (err) {
        console.error("Failed to start dragging:", err);
      }
    }
  };

  return (
    <div
      data-tauri-drag-region
      onMouseDown={handleMouseDown}
      className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800 bg-[#12141a] cursor-grab active:cursor-grabbing select-none font-mono"
    >
      <div className="flex items-center gap-2 pointer-events-none">
        <div className="px-1.5 py-0.5 bg-amber-400 text-zinc-950 font-black text-xs rounded-xs shadow-sm">
          9B
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-white tracking-widest uppercase">9BAR // KERNEL</span>
          <span className="text-[9px] bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800 font-bold tabular-nums">
            #{accountCount.toString().padStart(2, "0")} ACC
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 cursor-default">
        {/* Pin toggle button */}
        <button
          onClick={onTogglePin}
          title={isPinned ? "Unpin (auto-hide on blur)" : "Pin (keep open on desktop)"}
          className={`px-1.5 py-1 rounded text-[10px] flex items-center gap-1 transition-all cursor-pointer border active:scale-95 ${
            isPinned
              ? "bg-amber-400/20 border-amber-500/50 text-amber-300 shadow-sm"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
          }`}
        >
          {isPinned ? <Pin className="w-3 h-3 text-amber-400" /> : <PinOff className="w-3 h-3" />}
        </button>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          title="Refresh quotas (Hotkeys: R)"
          className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-zinc-800 hover:border-zinc-700 active:scale-95"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
        </button>

        {/* Open Web Dashboard */}
        <button
          onClick={onOpenDashboard}
          title="Open 9Router Web Dashboard"
          className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-zinc-800 hover:border-zinc-700 active:scale-95"
        >
          <ExternalLink className="w-3 h-3" />
        </button>

        {/* Minimize / Close to tray */}
        <button
          onClick={onClose}
          title="Minimize to Tray (Esc)"
          className="p-1 rounded bg-zinc-900 hover:bg-rose-950/60 hover:border-rose-800/80 text-zinc-400 hover:text-rose-300 flex items-center justify-center transition-all cursor-pointer border border-zinc-800 active:scale-95"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
