import React from "react";
import { SortMode, FilterMode } from "../types/9router";
import { ArrowUpDown, PowerOff } from "lucide-react";

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
    <div className="flex flex-col gap-1.5 px-3 py-2 bg-[#10131a] border-b border-gray-800/80 text-[11px]">
      {/* Top Row: Provider Selector & Status Tabs */}
      <div className="flex items-center justify-between gap-2">
        {/* Provider Dropdown */}
        <select
          value={selectedProvider}
          onChange={(e) => onProviderChange(e.target.value)}
          className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-md px-2 py-0.5 text-[11px] font-medium text-emerald-400 focus:outline-none focus:border-emerald-500 cursor-pointer max-w-[130px] truncate"
        >
          <option value="all">All Providers</option>
          {providers.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>

        {/* Filter Tabs */}
        <div className="flex items-center gap-0.5 bg-gray-900/90 p-0.5 rounded-lg border border-gray-800">
          <button
            onClick={() => onFilterChange("all")}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              filter === "all" ? "bg-gray-700 text-white font-medium shadow-sm" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange("active")}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              filter === "active" ? "bg-gray-700 text-white font-medium shadow-sm" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => onFilterChange("inactive")}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              filter === "inactive" ? "bg-gray-700 text-white font-medium shadow-sm" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Off
          </button>
        </div>
      </div>

      {/* Bottom Row: Sort Selector & Turn Off Empty Action */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-800/40">
        <div className="flex items-center gap-1.5 text-gray-400">
          <ArrowUpDown className="w-3 h-3 text-gray-500" />
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortMode)}
            className="bg-gray-900 border border-gray-800 rounded-md px-1.5 py-0.5 text-[10px] text-gray-300 focus:outline-none focus:border-gray-600 cursor-pointer"
          >
            <option value="default">Default Order</option>
            <option value="expiring-first">Expiring First</option>
            <option value="remaining-asc">% Low → High</option>
            <option value="remaining-desc">% High → Low</option>
          </select>
        </div>

        {onTurnOffEmpty && (
          <button
            onClick={onTurnOffEmpty}
            title="Turn off exhausted accounts (remaining ≤ 5%)"
            className="px-2 py-0.5 rounded bg-gray-900 hover:bg-red-500/20 text-gray-400 hover:text-red-300 flex items-center gap-1 border border-gray-800 cursor-pointer transition-colors text-[10px]"
          >
            <PowerOff className="w-2.5 h-2.5 text-red-400" />
            <span>Turn off Empty</span>
          </button>
        )}
      </div>
    </div>
  );
};
