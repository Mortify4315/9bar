import readline from "readline";

export const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  white: "\x1b[37m",
  magenta: "\x1b[35m",
  reverse: "\x1b[7m",
  emerald: "\x1b[38;2;16;185;129m",
  amber: "\x1b[38;2;245;158;11m",
  rose: "\x1b[38;2;244;63;94m",
  bgEmerald: "\x1b[48;2;16;185;129m\x1b[30m",
  bgDark: "\x1b[48;2;24;24;27m"
};

let rawPrimed = false;
function primeRawOnce() {
  if (rawPrimed || !process.stdin.isTTY) return;
  try {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.setEncoding("utf8");
    process.stdin.resume();
    rawPrimed = true;
  } catch {}
}

export async function selectMenu(title, items, defaultIndex = 0, subtitle = "") {
  return new Promise((resolve) => {
    let selectedIndex = defaultIndex;
    let isActive = true;

    primeRawOnce();
    if (!process.stdin.isTTY) { resolve(-1); return; }

    const renderMenu = () => {
      if (!isActive) return;
      process.stdout.write("\x1b[2J\x1b[H");
      const width = Math.min(process.stdout.columns || 48, 52);
      console.log(`\n${COLORS.emerald}${"━".repeat(width)}${COLORS.reset}`);
      console.log(`  ${COLORS.bright}${COLORS.emerald}${title}${COLORS.reset}`);
      if (subtitle) console.log(`  ${COLORS.dim}${subtitle}${COLORS.reset}`);
      console.log(`${COLORS.emerald}${"━".repeat(width)}${COLORS.reset}`);
      console.log();

      items.forEach((item, index) => {
        const isSelected = index === selectedIndex;
        const pointer = isSelected ? "▶" : " ";
        if (isSelected) {
          console.log(` ${COLORS.emerald}${COLORS.bright}${pointer} ${item.label}${COLORS.reset}`);
        } else {
          console.log(`   ${item.label}`);
        }
      });
      console.log(`\n${COLORS.dim}  [↑/↓] Navigate  •  [Enter] Select  •  [Ctrl+C] Exit${COLORS.reset}\n`);
    };

    const cleanup = () => {
      if (!isActive) return;
      isActive = false;
      process.stdin.removeListener("keypress", onKeypress);
    };

    const move = (delta) => {
      selectedIndex = (selectedIndex + delta + items.length) % items.length;
      renderMenu();
    };

    const onKeypress = (_str, key) => {
      if (!isActive || !key) return;
      if (key.name === "up") return move(-1);
      if (key.name === "down") return move(1);
      if (key.name === "return") { cleanup(); resolve(selectedIndex); return; }
      if (key.name === "escape") { cleanup(); resolve(-1); return; }
      if (key.ctrl && key.name === "c") { cleanup(); process.exit(0); }
    };

    process.stdin.on("keypress", onKeypress);
    renderMenu();
  });
}
