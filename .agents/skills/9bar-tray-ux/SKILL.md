---
name: 9bar-tray-ux
description: >-
  Specialized UX and UI design rules for 9Bar (Tauri v2 + React 19 + Tailwind CSS 4). Use this skill when modifying, adding, or refining 9Bar components, system tray popups, quota gauges, account cards, filters, and desktop HUD behaviors.
---

# 9Bar System Tray & Menu Bar UX Skill

Specialized interface guidelines tailored for 9Bar's compact, high-density desktop companion HUD.

---

## 🖥️ 1. Viewport & Spatial Constraints

* **Fixed Width**: Standardized between `380px` – `420px` to feel native to Windows Notification Area and macOS Menu Bar.
* **Vertical Discipline**: Max height ~ `520px` with custom subtle scrollbar (`scrollbar-none` or thin 4px track).
* **Glanceability Target**: User must identify depleted quotas and active providers in < 1 second.
* **Top Bar Ergonomics**:
  - Always keep Title (`⚡ 9Bar`), Account Count Badge (`[3 accounts]`), Pin Toggle (`📌`), Refresh (`🔄`), and External Link (`↗`) pinned to header.
  - Header must support native Tauri drag region: `data-tauri-drag-region`.

---

## ⚡ 2. Quota & Account Card Anatomy

Each provider account card must adhere to the high-density layout:

1. **Header Row**:
   - Provider Icon / Indicator (`Codex`, `Claude`, etc.)
   - Account Email / Name (truncated with ellipsis if > 24 chars)
   - Tier Badge (`[PLUS]`, `[TEAM]`, `[FREE]`)
   - Instant Toggle Switch (`[ON / OFF]`)
2. **Dual-Tier Quota Gauges**:
   - **Session Quota**: Short-term burst gauge (fraction + remaining % + countdown).
   - **Weekly / Monthly Quota**: Long-term tier gauge.
3. **Threshold Color Coding**:
   - `> 50%`: `bg-emerald-500` / `text-emerald-400`
   - `15% - 50%`: `bg-amber-500` / `text-amber-400`
   - `< 15%`: `bg-rose-500` / `text-rose-400`
4. **Number Stability**:
   - All countdowns (`in 29m`, `in 5d 8h`) and quotas (`21/100`) MUST use `tabular-nums font-mono` to avoid layout jitter when live polling updates.

---

## 🔄 3. Polling & Connection States

* **Footer Status Bar**:
  - Connected: `🟢 :20128 Connected` with last sync timestamp (`Updated HH:mm:ss`).
  - Connecting/Syncing: `🟡 Connecting to 9Router...`
  - Disconnected/Error: `🔴 9Router Offline` + `[Reconnect]` action button.
* **Optimistic Controls**:
  - When toggling an account Active/Off, immediately reflect UI state with opacity transition, then sync with API in background.

---

## 🚀 4. Interaction & Motion Rules

* Hover states on cards: `hover:border-zinc-700/80 hover:bg-zinc-900/90 transition-colors duration-150`.
* Action buttons (e.g. "Turn off Empty"): subtle tactile press `active:scale-[0.97]`.
* Tooltips: Instant native-feel tooltip on hover for countdown exact dates.
