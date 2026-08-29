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
    <div className="p-4 flex flex-col items-center justify-center text-center space-y-3 bg-[#17141d]/80 border-b border-amber-500/20">
      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
        <AlertTriangle className="w-4 h-4" />
      </div>
      <div>
        <h4 className="text-xs font-semibold text-amber-300">Cannot Connect to 9Router</h4>
        <p className="text-[11px] text-gray-400 mt-1 max-w-[280px]">
          {error || "Make sure 9Router is running at http://localhost:20128"}
        </p>
      </div>

      <button
        onClick={onRetry}
        disabled={retrying}
        className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
      >
        <RefreshCw className={`w-3 h-3 ${retrying ? "animate-spin" : ""}`} />
        Retry Connection
      </button>
    </div>
  );
};
