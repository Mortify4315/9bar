import React from "react";
import { SortMode, FilterMode } from "../types/9router";
import { ArrowUpDown } from "lucide-react";

interface FilterBarProps {
  providers: string[];
  selectedProvider: string;
  onProviderChange: (p: string) => void;
  filter: FilterMode;
  onFilterChange: (f: FilterMode) => void;
  sort: SortMode;
  onSortChange: (s: SortMode) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  providers,
  selectedProvider,
  onProviderChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
}) => {
  return (
    <div className="flex flex-col border-b border-zinc-800 bg-[#0f1116] text-[11px] font-mono select-none">
      {/* Top Provider Tabs */}
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

        {/* Sort Controls */}
        <div
          title="Change account sort order"
          className={`relative flex items-center gap-1.5 px-2 py-0.5 rounded border transition-all text-[10px] cursor-pointer active:scale-[0.97] select-none ${
            sort !== "default"
              ? "bg-amber-950/40 border-amber-500/50 text-amber-300 shadow-xs"
              : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
          }`}
        >
          <ArrowUpDown className={`w-2.5 h-2.5 shrink-0 ${sort !== "default" ? "text-amber-400" : "text-zinc-500"}`} />
          <span className="font-bold tracking-tight pointer-events-none">
            {sort === "default"
              ? "DEFAULT"
              : sort === "expiring-first"
              ? "EXPIRING"
              : sort === "remaining-asc"
              ? "% LOW→HIGH"
              : "% HIGH→LOW"}
          </span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortMode)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          >
            <option value="default" className="bg-zinc-900 text-zinc-200">Default (Original)</option>
            <option value="expiring-first" className="bg-zinc-900 text-zinc-200">Expiring Soonest</option>
            <option value="remaining-asc" className="bg-zinc-900 text-zinc-200">% Lowest Quota First</option>
            <option value="remaining-desc" className="bg-zinc-900 text-zinc-200">% Highest Quota First</option>
          </select>
        </div>
      </div>
    </div>
  );
};
