# 9Bar Design System Contract & Guidelines: Swiss Bento Matrix ⚡

This document serves as the persistent single source of truth for all UI, UX, styling, and design token decisions in the **9Bar** Swiss Bento Matrix desktop HUD companion.

---

## 🎨 1. Color Tokens & Surface Hierarchy

| Role | Tailwind Class / Hex | Usage |
| :--- | :--- | :--- |
| **HUD Background** | `bg-[#0c0d11]` | Main window substrate |
| **Bento Card Surface** | `bg-[#15171e]` | Account card container |
| **Card Hover** | `hover:border-zinc-600` | Hovered card state |
| **Subtle Divider** | `border-zinc-800` | Bento borders & dividers |
| **Sub-cell Substrate** | `bg-zinc-950` | Telemetry metric boxes |
| **Keycap Brand Accent** | `bg-amber-400 text-zinc-950` | `[9B]` Logo brand badge |
| **Primary Text** | `text-zinc-100` / `text-white` | Account emails, titles |
| **Secondary Text** | `text-zinc-400` | Metric labels, timestamps |
| **Muted Meta** | `text-zinc-500` | IDs, fractions, hotkey keys |

### 🚦 Semantic Quota Thresholds
* **Optimal ($\ge 50\%$)**: `text-emerald-400` / `bg-emerald-400` / `bg-emerald-500/15`
* **Caution ($15\% - 49\%$)**: `text-amber-400` / `bg-amber-400` / `bg-amber-500/15`
* **Critical / Low ($< 15\%$)**: `text-rose-400` / `bg-rose-500` / `bg-rose-500/20`

---

## 🔤 2. Monospaced Tabular Stability

* **Global Font**: Monospace (`font-mono`) with font feature settings `"cv02", "cv03", "cv04", "cv11", "tnum"`.
* **Tabular Numbers**: All percentages (`82%`), fractions (`18/100`), timers (`32m`), and counts (`#03 ACC`) MUST use tabular numeric alignment to eliminate layout shifts during polling updates.

---

## ⌨️ 3. Keyboard Hotkey Navigation

* `[1]` – `[9]`: Toggle active status of corresponding account card index.
* `[R]` / `[r]`: Trigger immediate force-sync and quota refresh.
* `[Esc]`: Minimize / hide HUD window.

---

## 📐 4. Layout Anatomy (Swiss Bento Matrix)

```
┌────────────────────────────────────────────────────────┐
│  [9B] 9BAR // KERNEL   [#03 ACC]         [📌] [🔄] [↗] │  <- Swiss Top Bar (Drag Region)
├────────────────────────────────────────────────────────┤
│  [ ALL PROVIDERS ] [ CODEX ] [ CLAUDE ] ...            │  <- Monospace Tab Strip
│  [ ALL | LIVE | OFF ]               [Default ▼] [PRUNE]│  <- Sub-Filters & Quick Prune
├────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │
│  │ [1] user@domain.com    [ID: #01 • CODEX_PLUS] [ON]│ │  <- Card Header Row
│  │ ┌──────────────────────┬──────────────────────┐  │  │
│  │ │ SESSION QUOTA  18/100│ WEEKLY TIER    42/100│  │  │  <- Dual-Box Telemetry Grid
│  │ │ 82%     [████████░░] │ 58%     [██████░░░░] │  │  │
│  │ │ Reset: 32m           │ Reset: 4d 12h        │  │  │
│  │ └──────────────────────┴──────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────┤
│  HOTKEYS: 1-9 Toggle • R Sync • Esc Close              │  <- Hotkey Legend Strip
├────────────────────────────────────────────────────────┤
│  🟢 127.0.0.1:20128 [ESTABLISHED]       SYNC 16:18:00  │  <- Status Footer
└────────────────────────────────────────────────────────┘
```

---

## 🚫 5. Anti-Slop Guardrails

1. **NO arbitrary layout shifts**: Tabular numerals guarantee 0px shift.
2. **NO low-contrast gray text on dark**: Secondary labels stay above WCAG AA minimums.
3. **NO sluggish animations**: Tactile transitions complete within $120\text{ms} - 150\text{ms}$.
4. **NO missing states**: Provide robust fallback screens for initializing sync, empty filter matches, and offline connection errors with 1-click reconnect.

