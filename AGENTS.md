# AGENTS.md — 9Bar Agent Operational Guide

This document contains operational instructions, architecture boundaries, IPC contracts, and design guardrails for AI coding agents (Antigravity, Claude Code, Cursor, Windsurf, Roo Code, Copilot Workspace) working on the **9Bar** repository.

---

## ⚡ 1. Repository Overview & Stack

- **Purpose**: Lightweight Desktop Companion & System Tray Telemetry HUD for [9Router](https://github.com/decolua/9router).
- **Core Stack**:
  - **Desktop Framework**: Tauri v2.0 (Rust)
  - **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React
  - **Bundler**: Vite 6+
  - **Companion CLI**: Node.js ES Modules (`cli.js`)
  - **Design Standard**: Telemetry HUD & System Tray Design Guidelines (defined in [`DESIGN.md`](./DESIGN.md) and [`.agents/skills/9bar-tray-ux/SKILL.md`](./.agents/skills/9bar-tray-ux/SKILL.md))

---

## 🌐 2. Network & Port Mapping

| Service | Port | Protocol | Purpose |
| :--- | :--- | :--- | :--- |
| **9Router API** | `20128` | HTTP | Local upstream router (`/api/providers/client`, `/api/usage/:id`) |
| **9Bar Web HUD** | `20129` | HTTP | Browser fallback server launched via `node cli.js --open` |
| **Vite Dev Server**| `1420` | HTTP | Frontend dev server during `npm run dev` / `npm run tauri dev` |

---

## 🛠️ 3. Execution Commands & Scripts

Always prefer non-blocking / one-shot commands for validation.

| Command | Action | Agent Safety / Behavior |
| :--- | :--- | :--- |
| `npm run build` | `tsc && vite build` | **Safe (One-shot)**: Validates TypeScript types and bundle compilation |
| `npm run dev` | `vite` | **Long-running**: Starts Vite dev server on port 1420 |
| `npm run tauri dev` | `tauri dev` | **Long-running**: Spawns Rust backend + Vite dev server |
| `npm run build:app` | `tauri build` | **One-shot**: Compiles release executable (`src-tauri/target/release/ninebar.exe`) |
| `npm start` | `node cli.js` | **Interactive**: Terminal companion menu |
| `npm run tray` | `node cli.js --tray` | **One-shot**: Launches native `ninebar.exe` silently to system tray |
| `npm run autostart` | `node scripts/autostart.js enable` | **One-shot**: Adds `launch-9bar.vbs` to Windows Startup |
| `npm run autostart:disable` | `node scripts/autostart.js disable` | **One-shot**: Removes 9Bar from Windows Startup |

---

## 🔌 4. Architecture & IPC Contract

```
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│   src/App.tsx, src/components/*, src/hooks/useQuotaData │
└───────────────────────┬────────────────────────────────┘
                        │
       ┌────────────────┴────────────────┐
       ▼ (Tauri Runtime)                 ▼ (Web Fallback)
┌───────────────────────────┐     ┌──────────────────────┐
│ Tauri IPC (commands.rs)   │     │ Direct HTTP Fetch    │
│ - fetch_quotas            │     │ http://127.0.0.1:    │
│ - set_pinned_state        │     │ 20128/api/...        │
│ - hide_flyout_window      │     └──────────────────────┘
│ - open_dashboard_url      │
└─────────────┬─────────────┘
              ▼
┌───────────────────────────┐
│ 9Router Backend (:20128)  │
└───────────────────────────┘
```

### Tauri IPC Commands (`src-tauri/src/commands.rs`):
- `fetch_quotas()`: Calls 9Router client API and merges usage quotas. Returns `Vec<AccountQuotaView>`.
- `set_pinned_state(pinned: bool)`: Updates window always-on-top state.
- `hide_flyout_window()`: Hides main window to tray.
- `open_dashboard_url()`: Opens `http://localhost:20128/dashboard/quota` via OS default browser.

> [!IMPORTANT]
> When editing `src/hooks/useQuotaData.ts`, **always maintain parity** between Tauri IPC invocations and browser `fetch` fallbacks.

---

## 🎨 5. Design System & Anti-Slop Guardrails

When modifying UI components in `src/components/`, strictly follow [`DESIGN.md`](./DESIGN.md):

1. **Monospaced Number Stability**:
   - All numbers, timers (`32m`, `5d 12h`), percentages (`82%`), and fractions (`18/100`) MUST use `font-mono tabular-nums` to prevent jitter during live polling updates.
2. **Threshold Colors**:
   - `≥ 50%`: Emerald (`text-emerald-400`, `bg-emerald-400`)
   - `15% – 49%`: Amber (`text-amber-400`, `bg-amber-400`)
   - `< 15%`: Rose (`text-rose-400`, `bg-rose-500`)
3. **Fixed Window Dimensions**:
   - HUD width: `390px`
   - HUD height: `540px`
   - Header must include `data-tauri-drag-region` for native multi-monitor window dragging.
4. **Tactile Micro-interactions**:
   - All interactive buttons must have `active:scale-[0.95]` or `active:scale-[0.97]` and transition durations $\le 150\text{ms}$.

---

## 🧪 6. Verification Checklist for Agents

Before completing any task:
1. Run `npm run build` to ensure zero TypeScript compiler errors or broken imports.
2. If modifying Rust backend files (`src-tauri/src/*`), run `cargo check --manifest-path src-tauri/Cargo.toml`.
3. Verify that offline fallback states and loading spinners render without breaking the 390x540 container layout.
