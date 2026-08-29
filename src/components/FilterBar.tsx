import React from "react";
import { SortMode, FilterMode } from "../types/9router";
import { ArrowUpDown, ZapOff } from "lucide-react";

interface FilterBarProps {
  providers: string[];
  selectedProvider: string;
  onProviderChange: (p: string) => void;
  filter: FilterMode;
  onFilterChange: (f: FilterMode) => void;
  sort: SortMode;
  onSortChange: (s: SortMode) => void;
  onTurnOffEmpty?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  providers,
  selectedProvider,
  onProviderChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
  onTurnOffEmpty,
}) => {
  return (
    <div className="flex flex-col border-b border-zinc-800 bg-[#0f1116] text-[11px] font-mono select-none">
      {/* Top Provider Matrix Tabs */}
      <div className="flex items-stretch border-b border-zinc-800/80 bg-zinc-950 overflow-x-auto">
        <button
          onClick={() => onProviderChange("all")}
          className={`px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase border-r border-zinc-800 transition-colors shrink-0 cursor-pointer ${
            selectedProvider === "all"
              ? "bg-zinc-800 text-white shadow-inner"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
          }`}
        >
          ALL PROVIDERS
        </button>

        {providers.map((p) => {
          const isSelected = selectedProvider.toLowerCase() === p.toLowerCase();
          return (
            <button
              key={p}
              onClick={() => onProviderChange(p)}
              className={`px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase border-r border-zinc-800 transition-colors shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-zinc-800 text-amber-300 shadow-inner"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* Sub Controls: Status Tabs & Sort */}
      <div className="flex items-center justify-between px-3 py-1.5 gap-2 bg-[#0f1116]">
        {/* Status Mode Segmented Pill */}
        <div className="flex items-center bg-zinc-950 p-0.5 rounded border border-zinc-800">
          <button
            onClick={() => onFilterChange("all")}
            className={`px-2 py-0.5 rounded-xs text-[10px] font-bold transition-all cursor-pointer ${
              filter === "all"
                ? "bg-zinc-800 text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => onFilterChange("active")}
            className={`px-2 py-0.5 rounded-xs text-[10px] font-bold transition-all cursor-pointer ${
              filter === "active"
                ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-xs"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            LIVE
          </button>
          <button
            onClick={() => onFilterChange("inactive")}
            className={`px-2 py-0.5 rounded-xs text-[10px] font-bold transition-all cursor-pointer ${
              filter === "inactive"
                ? "bg-zinc-800 text-zinc-300 shadow-xs"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            OFF
          </button>
        </div>

        {/* Sort and Quick Prune Action */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 text-[10px] text-zinc-400">
            <ArrowUpDown className="w-2.5 h-2.5 text-zinc-500" />
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value as SortMode)}
              className="bg-transparent text-[10px] text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="default" className="bg-zinc-900 text-zinc-200">Default</option>
              <option value="expiring-first" className="bg-zinc-900 text-zinc-200">Expiring</option>
              <option value="remaining-asc" className="bg-zinc-900 text-zinc-200">% Low→High</option>
              <option value="remaining-desc" className="bg-zinc-900 text-zinc-200">% High→Low</option>
            </select>
          </div>

          {onTurnOffEmpty && (
            <button
              onClick={onTurnOffEmpty}
              title="Prune depleted accounts (remaining ≤ 5%)"
              className="px-1.5 py-0.5 rounded bg-zinc-950 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 hover:border-rose-800/60 border border-zinc-800 flex items-center gap-1 cursor-pointer transition-colors text-[10px] active:scale-95"
            >
              <ZapOff className="w-2.5 h-2.5 text-rose-400" />
              <span>PRUNE</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
