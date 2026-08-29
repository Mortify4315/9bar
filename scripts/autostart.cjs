const fs = require("fs");
const path = require("path");

const APP_NAME = "9bar";
const exePath = path.resolve(__dirname, "..", "src-tauri", "target", "release", "ninebar.exe");

function getStartupPath() {
  const appData = process.env.APPDATA;
  if (!appData) throw new Error("APPDATA is not set; Windows autostart is unavailable.");
  return path.join(appData, "Microsoft", "Windows", "Start Menu", "Programs", "Startup", `${APP_NAME}.vbs`);
}

function enableAutoStart() {
  if (!fs.existsSync(exePath)) {
    throw new Error("ninebar.exe not found. Run 'npm run build:app' first.");
  }
  const startupPath = getStartupPath();
  const vbsContent = `Set WshShell = CreateObject("WScript.Shell")\nWshShell.Run """${exePath}""", 1, False\n`;
  fs.writeFileSync(startupPath, vbsContent, "utf8");
  console.log(`Auto-start enabled: ${startupPath}`);
}

function disableAutoStart() {
  const startupPath = getStartupPath();
  if (fs.existsSync(startupPath)) {
    fs.unlinkSync(startupPath);
    console.log(`Auto-start disabled: removed ${startupPath}`);
  } else {
    console.log("Auto-start was not enabled.");
  }
}

function isAutoStartEnabled() {
  const startupPath = getStartupPath();
  const exists = fs.existsSync(startupPath);
  console.log(`Auto-start status: ${exists ? "ENABLED" : "DISABLED"}`);
  return exists;
}

try {
  const action = process.argv[2] || "status";
  if (action === "enable") enableAutoStart();
  else if (action === "disable") disableAutoStart();
  else isAutoStartEnabled();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
