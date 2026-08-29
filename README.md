<div align="center">

# ⚡ 9Bar

**Lightweight Desktop Companion & System Tray Telemetry HUD for [9Router](https://github.com/decolua/9router)**

[![Tauri](https://img.shields.io/badge/Tauri-2.0-24C8D8?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Rust](https://img.shields.io/badge/Rust-1.77%2B-orange?style=flat-square&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)](LICENSE)

<p align="center">
  A high-density Swiss Bento Matrix desktop companion for Windows notification areas and macOS menu bars.<br />
  Monitor AI provider quotas, rate-limit countdowns, and active accounts in real time with zero browser tabs.
</p>

</div>

---

## Overview

**9Bar** lives quietly in your system tray, delivering sub-second glanceability and instant control over your AI provider quotas, countdown timers, and active routing accounts.

```
┌────────────────────────────────────────────────────────┐
│  [9B] 9BAR // KERNEL   [#03 ACC]         [📌] [🔄] [↗] │  <- Swiss Top Bar (Drag Region)
├────────────────────────────────────────────────────────┤
│  [ ALL PROVIDERS ] [ CODEX ] [ CLAUDE ] ...            │  <- Monospace Provider Tabs
│  [ ALL | LIVE | OFF ]               [Default ▼] [PRUNE]│  <- Status Filters & Quick Prune
├────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │
│  │ [1] user@domain.com    [ID: #01 • CODEX_PLUS] [ON]│ │  <- Account Header Row
│  │ ┌──────────────────────┬──────────────────────┐  │  │
│  │ │ SESSION QUOTA  18/100│ WEEKLY TIER    42/100│  │  │  <- Dual-Box Telemetry Grid
│  │ │ 82%     [████████░░] │ 58%     [██████░░░░] │  │  │
│  │ │ Reset: 32m           │ Reset: 4d 12h        │  │  │
│  │ └──────────────────────┴──────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────┤
│  HOTKEYS: 1-9 Toggle • R Sync • Esc Close              │  <- Hotkey Legend
├────────────────────────────────────────────────────────┤
│  🟢 127.0.0.1:20128 [ESTABLISHED]       SYNC 16:18:00  │  <- Status Footer
└────────────────────────────────────────────────────────┘
```

> [!NOTE]
> 9Bar communicates with [9Router](https://github.com/decolua/9router) running locally on port `20128`. When 9Router is active, telemetry synchronizes automatically in the background.

---

## Features

- **System Tray Native**: Lightweight background tray companion with instant left-click toggle, context menu controls, and taskbar anchoring.
- **Swiss Bento Telemetry**: Dual split-box account metrics displaying short-term session burst limits alongside long-term weekly/monthly quotas with micro progress tracks.
- **Monospaced Numerical Stability**: Tabular numeral formatting (`tnum`, `cv02`, `cv11`) prevents layout shifts during live polling updates.
- **Threshold Color Coding**:
  - `≥ 50%`: Emerald (`text-emerald-400`) — Healthy quota
  - `15% – 49%`: Amber (`text-amber-400`) — Low quota warning
  - `< 15%`: Rose (`text-rose-400`) — Critical quota exhaustion
- **Keyboard-First Navigation**: Direct hotkeys for instant toggling, force refreshing, and dismissing.
- **Drag-to-Move & Desktop Pinning**:
  - **Drag-to-Move**: Click and drag the header bar anywhere across multiple monitors smoothly without needing to pin first.
  - **Auto-Hide on Blur**: Closes automatically when clicking away to another application (when unpinned).
  - **Pin Mode (`📌`)**: Stays permanently floating on your desktop as an always-on-top HUD.
- **Unified Companion CLI**: Interactive terminal interface (`9bar`) supporting headless background daemonization, CLI quota tables, and Windows startup management.

---

## Keyboard Shortcuts

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| `1` – `9` | **Toggle Account** | Instantly switches the active state of account index `#01` through `#09` |
| `R` / `r` | **Force Refresh** | Triggers immediate telemetry synchronization from 9Router |
| `Esc` | **Close HUD** | Minimizes/hides the floating HUD back to the system tray |

---

## Quick Start

### Prerequisites

- [9Router](https://github.com/decolua/9router) running at `http://127.0.0.1:20128`
- Node.js (v18+)
- Rust toolchain (`cargo` 1.77+)

### Installation

```bash
# Clone repository
git clone https://github.com/Mortify4315/9bar.git
cd 9bar

# Install dependencies
npm install
```

### Running the Desktop HUD

```bash
# Run in development mode (with hot reload)
npm run dev
npm run tauri dev

# Run using the interactive CLI menu
npm start
```

### Building the Standalone Executable

```bash
# Compile optimized production release binary
npm run build:app
```

The compiled standalone executable will be located at:
```
src-tauri/target/release/ninebar.exe
```

> [!TIP]
> You can launch `ninebar.exe` directly or run `launch-9bar.vbs` to start 9Bar silently in the background on system startup.

---

## CLI Modes

9Bar provides a unified command-line tool:

```bash
# Launch interactive terminal control center
node cli.js

# Launch directly into background system tray
node cli.js --tray

# Launch 9Bar Web HUD in browser (fallback mode)
node cli.js --open
```

---

## Windows Auto-Start

To configure 9Bar to automatically start when Windows boots:

```bash
# Enable auto-start in Windows Startup
npm run autostart

# Disable auto-start
npm run autostart:disable
```

---

## Architecture

```
9bar/
├── src/                      # React 19 Frontend (Swiss Bento Matrix)
│   ├── components/           # AccountCard, FilterBar, Header, ProgressBar
│   ├── hooks/useQuotaData.ts # Unified polling & Tauri/Web IPC client
│   └── index.css             # Tailwind CSS v4 & monospace typography tokens
├── src-tauri/                # Tauri 2.0 Rust Backend
│   ├── src/client.rs         # Async HTTP client for 9Router API
│   ├── src/commands.rs       # Tauri IPC commands & window management
│   ├── src/tray.rs           # Native tray creation & smart taskbar positioning
│   └── src/lib.rs            # Application lifecycle & drag-aware focus handler
├── cli.js                    # Unified Node.js CLI launcher
├── launch-9bar.vbs           # Silent background runner for Windows
└── DESIGN.md                 # Design system contract & token specifications
```

---

## Tech Stack

- **Desktop Framework**: [Tauri 2.0](https://tauri.app/)
- **Native Backend**: [Rust](https://www.rust-lang.org/) (`tauri-plugin-positioner`, `tauri-plugin-opener`, `reqwest`, `tokio`)
- **Frontend Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Bundler**: [Vite](https://vitejs.dev/)
