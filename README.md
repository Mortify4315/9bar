# 9Bar ⚡

> **Lightweight Menu Bar & System Tray Companion for [9Router](https://github.com/decolua/9router)**  
> Built with **Tauri 2.0**, **Rust**, **React 19**, and **Tailwind CSS**.

---

## Overview

**9Bar** sits quietly in your Windows Notification Area / System Tray (and macOS Menu Bar), giving you real-time glanceability and instant control over your AI provider quotas, rate-limit countdowns, and active accounts without needing to open a browser tab.

```
┌────────────────────────────────────────────────────────┐
│  ⚡ 9Bar             [3 accounts]        [📌] [🔄] [↗] │
├────────────────────────────────────────────────────────┤
│  [Codex ▼]                 [ All | Active | Off ]      │
│  [⇅ Expiring First ▼]             [⚡ Turn off Empty]  │
├────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │
│  │ ⚡ levy.fitrananda@gmail.com        [PLUS]  [ON] │  │
│  │  • session  21/100  79% in 29m                   │  │
│  │    [████████████████████░░░░░]                   │  │
│  │  • weekly   45/100  55% in 5d 8h 43m             │  │
│  │    [██████████████░░░░░░░░░░░]                   │  │
│  └──────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────┤
│  🟢 :20128 Connected               Updated 15:52:00    │
└────────────────────────────────────────────────────────┘
```

---

## ✨ Features

- **At-a-Glance System Tray**: Dynamic tooltip and color status in the Windows Notification Area / macOS Menu Bar.
- **Dual-Tier Quota Tracking**:
  - **Session Quota**: Short-term burst limit, % remaining, and countdown timer (`in 29m`).
  - **Weekly Quota**: Long-term tier quota and reset timer (`in 5d 8h`).
- **Instant Account Controls**:
  - Direct account toggle switches (`Active / Off`).
  - Provider filter dropdown (`Codex`, `Claude`, `Qoder`, etc.).
  - One-Click Codex Reset Credits trigger (`POST /api/usage/:id/codex-reset-credits`).
  - "Turn off Empty" action (automatically disables exhausted accounts with $\le 5\%$ quota).
  - Sort by **Expiring First**, **% Low → High**, or **Default**.
- **Desktop Pinning & Free Dragging**:
  - **Pin Mode (📌)**: Keeps the widget floating always-on-top on your desktop like a HUD.
  - **Flyout Mode (Unpinned)**: Automatically dismisses when clicking away.
  - **Smooth Native OS Dragging**: Click & drag anywhere on the header to place it wherever you want on your screen.
- **Ultra Lightweight**:
  - Memory: $< 25 \text{ MB}$ RAM.
  - CPU: $0.0\%$ when idle.
  - Binary: $\sim 5-8 \text{ MB}$ standalone portable `.exe`.

---

## 🚀 Quick Start

### Prerequisites
1. Ensure [9Router](https://github.com/decolua/9router) is running at `http://localhost:20128`.
2. Node.js (v18+) and Rust toolchain (`cargo`).

### Run in Development Mode
```powershell
npm run tauri dev
```

### Build Standalone Portable Executable
```powershell
npm run tauri build
```
The compiled executable will be in:
`src-tauri/target/release/9Bar.exe`

---

## 🛠️ Tech Stack
- **Backend**: Rust, Tauri 2.0 (`tauri-plugin-positioner`, `tauri-plugin-opener`, `reqwest`, `tokio`).
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Vite.

---

## License
MIT © [Mortify4315](https://github.com/Mortify4315)
