const fs = require("fs");
const path = require("path");

const APP_NAME = "9bar";
const exePath = path.resolve(__dirname, "..", "src-tauri", "target", "release", "ninebar.exe");

function getStartupPath() {
  const appData = process.env.APPDATA || "";
  return path.join(appData, "Microsoft", "Windows", "Start Menu", "Programs", "Startup", `${APP_NAME}.vbs`);
}

function enableAutoStart() {
  const startupPath = getStartupPath();
  const vbsContent = `Set WshShell = CreateObject("WScript.Shell")\nWshShell.Run """${exePath}""", 1, False\n`;
  fs.writeFileSync(startupPath, vbsContent, "utf8");
  console.log(`✅ Auto-start enabled: ${startupPath}`);
}

function disableAutoStart() {
  const startupPath = getStartupPath();
  if (fs.existsSync(startupPath)) {
    fs.unlinkSync(startupPath);
    console.log(`🗑️ Auto-start disabled: removed ${startupPath}`);
  } else {
    console.log("ℹ️ Auto-start was not enabled.");
  }
}

function isAutoStartEnabled() {
  const startupPath = getStartupPath();
  const exists = fs.existsSync(startupPath);
  console.log(`Auto-start status: ${exists ? "ENABLED" : "DISABLED"}`);
  return exists;
}

const action = process.argv[2] || "status";
if (action === "enable") enableAutoStart();
else if (action === "disable") disableAutoStart();
else isAutoStartEnabled();
