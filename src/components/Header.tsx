import React from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { RefreshCw, ExternalLink, X, Pin, PinOff, GripHorizontal } from "lucide-react";

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
    // Only trigger drag on left click and ignore buttons/inputs
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
      className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-800/80 bg-[#12151d] cursor-grab active:cursor-grabbing select-none"
    >
      <div className="flex items-center gap-2 pointer-events-none">
        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xs font-black shadow-sm tracking-tight">
          9B
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-white tracking-wide">9Bar</span>
          <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-500/25 font-mono font-medium">
            {accountCount} {accountCount === 1 ? "account" : "accounts"}
          </span>
        </div>
      </div>

      {/* Drag Grip Indicator in Middle */}
      <div className="text-gray-600 hover:text-gray-400 transition-colors pointer-events-none">
        <GripHorizontal className="w-4 h-4" />
      </div>

      <div className="flex items-center gap-1 cursor-default">
        {/* Pin toggle button */}
        <button
          onClick={onTogglePin}
          title={isPinned ? "Unpin (auto-hide on click outside)" : "Pin (keep open on desktop)"}
          className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center transition-all cursor-pointer border ${
            isPinned
              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm"
              : "bg-gray-800/80 border-gray-700/50 text-gray-400 hover:text-white"
          }`}
        >
          {isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
        </button>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          title="Refresh quotas"
          className="w-6.5 h-6.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-gray-700/50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-400" : ""}`} />
        </button>

        {/* Open Web Dashboard */}
        <button
          onClick={onOpenDashboard}
          title="Open 9Router Web Dashboard"
          className="w-6.5 h-6.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-gray-700/50"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        {/* Minimize / Close to tray */}
        <button
          onClick={onClose}
          title="Minimize to Tray"
          className="w-6.5 h-6.5 rounded-lg bg-gray-800/80 hover:bg-red-500/20 text-gray-400 hover:text-red-300 flex items-center justify-center transition-all cursor-pointer border border-gray-700/50"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
