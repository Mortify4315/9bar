#!/usr/bin/env node

import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
import { spawn, exec } from "child_process";
import fs from "fs";
import http from "http";

import { selectMenu, COLORS } from "./src/cli/utils/input.js";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkg = require("./package.json");

const UI_PORT = 20129;
const ROUTER_PORT = 20128;
const args = process.argv.slice(2);

let trayMode = false;
let statusMode = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--tray" || args[i] === "-t") {
    trayMode = true;
  } else if (args[i] === "--status" || args[i] === "-s") {
    statusMode = true;
  } else if (args[i] === "--help" || args[i] === "-h") {
    console.log(`
9Bar - Lightweight System Tray Companion for 9Router

Usage:
  9bar [options]

Options:
  -s, --status      View 9Router quota status table
  -t, --tray        Run 9Bar in background (system tray)
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
    if (process.platform === "win32") {
      const vbsPath = path.resolve(__dirname, "launch-9bar.vbs");
      if (fs.existsSync(vbsPath)) {
        const child = spawn("wscript.exe", [vbsPath], {
          detached: true,
          stdio: "ignore",
        });
        child.unref();
        return true;
      }
      const child = spawn("cmd.exe", ["/c", "start", "", exe], {
        detached: true,
        stdio: "ignore",
      });
      child.unref();
      return true;
    } else {
      const child = spawn(exe, [], {
        detached: true,
        stdio: "ignore",
      });
      child.unref();
      return true;
    }
  }
  return false;
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

async function displayQuotaTable() {
  console.log(`\n${COLORS.emerald}Fetching 9Router telemetry (127.0.0.1:${ROUTER_PORT})...${COLORS.reset}\n`);
  const accounts = await fetchQuotas();
  if (accounts.length === 0) {
    console.log(`  ${COLORS.yellow}⚠ No active 9Router connections found at port ${ROUTER_PORT}.${COLORS.reset}\n`);
  } else {
    console.log("  ID  | PROVIDER  | ACCOUNT NAME          | STATUS");
    console.log("  ----+-----------+-----------------------+---------");
    accounts.forEach((acc, i) => {
      const num = String(i + 1).padStart(2, "0");
      const prov = (acc.provider || "UNKNOWN").toUpperCase().padEnd(9, " ").slice(0, 9);
      const name = (acc.name || acc.email || "Unnamed").padEnd(21, " ").slice(0, 21);
      const status = acc.isActive ? "\x1b[32mACTIVE\x1b[0m" : "\x1b[31mOFF\x1b[0m";
      console.log(`  #${num} | ${prov} | ${name} | ${status}`);
    });
    console.log();
  }
}

async function runTrayMode() {
  const launched = launchNativeApp();
  if (launched) {
    console.log(`\n${COLORS.emerald}✔ 9Bar is running in the background (system tray).${COLORS.reset}`);
    console.log(`${COLORS.dim}💡 Left-click the 9Bar icon in the taskbar to toggle the HUD.${COLORS.reset}\n`);
  } else {
    console.log(`\n${COLORS.yellow}⚠️ Native binary not found. Please run 'npm run build:app' first.${COLORS.reset}\n`);
  }
}

async function main() {
  if (trayMode) {
    await runTrayMode();
    process.exit(0);
  }

  if (statusMode) {
    await displayQuotaTable();
    process.exit(0);
  }

  while (true) {
    const menuItems = [
      { label: "📊 View Quota Status" },
      { label: "🔔 Run in Background" },
      { label: "🚪 Exit" }
    ];

    const selected = await selectMenu(
      "9BAR // KERNEL",
      menuItems,
      0,
      "⚡ 9Router Companion"
    );

    if (selected === 0) {
      await displayQuotaTable();
      console.log(`${COLORS.dim}Press Enter to return to menu...${COLORS.reset}`);
      await new Promise((r) => process.stdin.once("data", r));
    } else if (selected === 1) {
      await runTrayMode();
      await new Promise((r) => setTimeout(r, 1200));
      process.exit(0);
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
