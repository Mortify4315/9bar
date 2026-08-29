# 9Router Quota Bar ⚡ (Desktop Tray Companion)

An ultra-lightweight, cross-platform system tray / menu bar companion application for [9Router](https://github.com/decolua/9router), built with **Tauri 2.0**, **Rust**, **React**, and **Tailwind CSS**.

---

## Features

- **At-a-Glance System Tray**: Sits in your Windows Notification Area (system tray) or macOS Menu Bar.
- **Dynamic Live Flyout**: Left-click the tray icon to open a sleek, dark-mode flyout with glassmorphism matching the 9Router UI.
- **Dual Quota Meters**:
  - **Session Quota**: Real-time used vs total, % remaining, and countdown timer (e.g. `21/100 (79% in 29m)`).
  - **Weekly Quota**: Long-term tier quota and reset timer (e.g. `45/100 (55% in 5d 8h)`).
- **Direct Multi-Account Controls**:
  - Provider selector dropdown (`Codex`, `Qoder`, `OpenCode-Go`, or `All Providers`).
  - Instant Account Toggle Switches (`Active / Off`).
  - One-Click Codex Reset Credits trigger.
  - "Turn Off Empty" quick action (automatically disables accounts with $\le 5\%$ quota).
  - Filter by Active/Inactive and Sort by Expiring First or Remaining %.
- **Native OS Integration**:
  - Auto-hides when clicking outside (window blur).
  - Deep-link (`↗`) to open `http://localhost:20128/dashboard/quota` in your default browser.
  - Native right-click context menu in the tray.
- **Ultra Low Footprint**:
  - $< 25 \text{ MB}$ RAM consumption.
  - Zero background CPU usage.

---

## Quick Start & Running

### 1. Development Mode (Live Reload)
Make sure 9Router is running at `http://localhost:20128`, then run:
```bash
npm run tauri dev
```

### 2. Build Standalone Portable Executable
```bash
npm run tauri build
```
The compiled binary will be located in:
`src-tauri/target/release/9router-tray.exe`

---

## Tech Stack
- **Backend**: Rust, Tauri 2.0, `tauri-plugin-positioner`, `tauri-plugin-opener`, `reqwest`, `tokio`.
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Vite.
