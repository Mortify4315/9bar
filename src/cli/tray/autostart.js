import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_NAME = "9bar";

export function getStartupPath() {
  const appData = process.env.APPDATA || "";
  return path.join(appData, "Microsoft", "Windows", "Start Menu", "Programs", "Startup", `${APP_NAME}.vbs`);
}

export function enableAutoStart() {
  const startupPath = getStartupPath();
  const vbsPath = path.resolve(__dirname, "..", "..", "..", "launch-9bar.vbs");
  const vbsContent = `Set WshShell = CreateObject("WScript.Shell")\nWshShell.Run """${vbsPath}""", 0, False\n`;
  try {
    fs.writeFileSync(startupPath, vbsContent, "utf8");
    return true;
  } catch {
    return false;
  }
}

export function disableAutoStart() {
  const startupPath = getStartupPath();
  try {
    if (fs.existsSync(startupPath)) {
      fs.unlinkSync(startupPath);
    }
    return true;
  } catch {
    return false;
  }
}

export function isAutoStartEnabled() {
  const startupPath = getStartupPath();
  return fs.existsSync(startupPath);
}
