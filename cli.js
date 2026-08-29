#!/usr/bin/env node

import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
import { spawn, exec } from "child_process";
import fs from "fs";
import http from "http";

import { selectMenu, COLORS } from "./src/cli/utils/input.js";
import { initWinTray } from "./src/cli/tray/trayWin.js";
import { enableAutoStart, disableAutoStart, isAutoStartEnabled } from "./src/cli/tray/autostart.js";
import { startStaticServer } from "./src/cli/server.js";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkg = require("./package.json");

const UI_PORT = 20129;
const ROUTER_PORT = 20128;
const args = process.argv.slice(2);

let trayMode = false;
let openMode = false;
let appMode = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--tray" || args[i] === "-t") {
    trayMode = true;
  } else if (args[i] === "--open" || args[i] === "-o") {
    openMode = true;
  } else if (args[i] === "--app" || args[i] === "-a") {
    appMode = true;
  } else if (args[i] === "--help" || args[i] === "-h") {
    console.log(`
9Bar - Lightweight System Tray Companion for 9Router

Usage:
  9bar [options]

Options:
  -t, --tray        Run in native system tray mode (background companion)
  -a, --app         Launch 9Bar floating desktop widget
  -o, --open        Open 9Bar Web HUD in browser (fallback)
  -h, --help        Show help
  -v, --version     Show version
`);
    process.exit(0);
  } else if (args[i] === "--version" || args[i] === "-v") {
    console.log(pkg.version);
    process.exit(0);
  }
}

function getExePath() {
  const releasePath = path.resolve(__dirname, "src-tauri", "target", "release", "ninebar.exe");
  if (fs.existsSync(releasePath)) return releasePath;
  const debugPath = path.resolve(__dirname, "src-tauri", "target", "debug", "ninebar.exe");
  if (fs.existsSync(debugPath)) return debugPath;
  return null;
}

function launchNativeApp() {
  const exe = getExePath();
  if (exe && fs.existsSync(exe)) {
    const child = spawn(exe, [], {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    child.unref();
    return true;
  }
  return false;
}

function openBrowser(url) {
  const cmd = process.platform === "win32" ? `start "" "${url}"` : `open "${url}"`;
  exec(cmd);
}

function fetchQuotas() {
  return new Promise((resolve) => {
    http.get(`http://127.0.0.1:${ROUTER_PORT}/api/providers/client?pageSize=100`, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json.connections || []);
        } catch {
          resolve([]);
        }
      });
    }).on("error", () => resolve([]));
  });
}

async function runTrayMode() {
  const launched = launchNativeApp();
  if (launched) {
    console.log(`\n${COLORS.emerald}🔔 9Bar native companion running in system tray.${COLORS.reset}`);
    console.log(`${COLORS.dim}💡 Left-click the 9Bar tray icon anytime to open the floating HUD!${COLORS.reset}\n`);
  } else {
    console.log(`\n${COLORS.yellow}⚠️ Native binary not found. Please run 'npm run build:app' first.${COLORS.reset}\n`);
  }
}

async function runOpenMode() {
  await startStaticServer(UI_PORT);
  openBrowser(`http://localhost:${UI_PORT}`);
  console.log(`\n🚀 9Bar Web HUD running at http://localhost:${UI_PORT}`);
}

async function main() {
  if (trayMode || appMode) {
    await runTrayMode();
    return;
  }

  if (openMode) {
    await runOpenMode();
    return;
  }

  while (true) {
    const autostart = isAutoStartEnabled();
    const menuItems = [
      { label: "⚡ Launch 9Bar Floating HUD (Native Desktop Widget)" },
      { label: "🔔 Run in Background (System Tray Companion)" },
      { label: "📊 View Quota Status (Terminal Table)" },
      { label: autostart ? "✓ Auto-start Enabled (Click to Disable)" : "🔁 Enable Auto-start on System Boot" },
      { label: "🌐 Open Web HUD in Browser (Fallback Mode)" },
      { label: "🚪 Exit" }
    ];

    const selected = await selectMenu(
      "9BAR // KERNEL - SYSTEM TRAY COMPANION",
      menuItems,
      0,
      "⚡ 9Router Quota Telemetry HUD"
    );

    if (selected === 0 || selected === 1) {
      const launched = launchNativeApp();
      if (launched) {
        console.log(`\n${COLORS.emerald}✔ 9Bar is active in your system tray!${COLORS.reset}`);
        console.log(`${COLORS.dim}💡 Left-click the 9Bar icon in the taskbar notification area to toggle the floating widget.${COLORS.reset}\n`);
      } else {
        console.log(`\n${COLORS.yellow}⚠️ 9Bar executable not found. Running build:app...${COLORS.reset}\n`);
      }
      await new Promise((r) => setTimeout(r, 2000));
      if (selected === 1) process.exit(0);
    } else if (selected === 2) {
      console.log(`\n${COLORS.emerald}Fetching 9Router telemetry...${COLORS.reset}\n`);
      const accounts = await fetchQuotas();
      if (accounts.length === 0) {
        console.log(`  ${COLORS.yellow}⚠ No active 9Router connections found at port ${ROUTER_PORT}.${COLORS.reset}\n`);
      } else {
        console.log("  ID  | PROVIDER  | ACCOUNT NAME          | STATUS");
        console.log("  ----+-----------+-----------------------+---------");
        accounts.forEach((acc, i) => {
          const num = String(i + 1).padStart(2, "0");
          const prov = acc.provider.toUpperCase().padEnd(9, " ");
          const name = (acc.name || acc.email || "Unnamed").padEnd(21, " ").slice(0, 21);
          const status = acc.isActive ? "\x1b[32mACTIVE\x1b[0m" : "\x1b[31mOFF\x1b[0m";
          console.log(`  #${num} | ${prov} | ${name} | ${status}`);
        });
        console.log();
      }
      console.log(`${COLORS.dim}Press Enter to return to menu...${COLORS.reset}`);
      await new Promise((r) => process.stdin.once("data", r));
    } else if (selected === 3) {
      if (autostart) {
        disableAutoStart();
        console.log(`\n${COLORS.amber}🗑️ Auto-start disabled.${COLORS.reset}\n`);
      } else {
        enableAutoStart();
        console.log(`\n${COLORS.emerald}✅ Auto-start enabled with 9Bar native desktop companion.${COLORS.reset}\n`);
      }
      await new Promise((r) => setTimeout(r, 1200));
    } else if (selected === 4) {
      await startStaticServer(UI_PORT);
      openBrowser(`http://localhost:${UI_PORT}`);
      console.log(`\n${COLORS.emerald}✔ Opened 9Bar Web HUD in browser at http://localhost:${UI_PORT}${COLORS.reset}\n`);
      await new Promise((r) => setTimeout(r, 1500));
    } else {
      console.log("\n👋 Exiting 9Bar.\n");
      process.exit(0);
    }
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
