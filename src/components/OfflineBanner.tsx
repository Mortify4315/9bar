import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface OfflineBannerProps {
  error: string;
  onRetry: () => void;
  retrying: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  error,
  onRetry,
  retrying,
}) => {
  return (
    <div className="p-3.5 flex flex-col items-center justify-center text-center space-y-2.5 bg-rose-950/20 border border-rose-500/30 rounded-lg font-mono">
      <div className="flex items-center gap-2 text-rose-400">
        <AlertTriangle className="w-4 h-4" />
        <h4 className="text-xs font-bold uppercase tracking-wider">[CONNECTION_OFFLINE]</h4>
      </div>
      
      <p className="text-[10px] text-zinc-400 max-w-[280px] break-words">
        {error || "Target 127.0.0.1:20128 unreachable."}
      </p>

      <button
        onClick={onRetry}
        disabled={retrying}
        className="px-3 py-1 bg-zinc-900 hover:bg-rose-900/40 text-rose-300 border border-rose-500/40 rounded text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
      >
        <RefreshCw className={`w-3 h-3 ${retrying ? "animate-spin text-rose-400" : ""}`} />
        <span>RECONNECT (R)</span>
      </button>
    </div>
  );
};
