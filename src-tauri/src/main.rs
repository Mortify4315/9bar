// Prevents console window on Windows in all modes
#![windows_subsystem = "windows"]

use std::fs::OpenOptions;
use std::io::Write;

fn main() {
  std::panic::set_hook(Box::new(|info| {
    if let Ok(mut f) = OpenOptions::new()
      .create(true)
      .append(true)
      .open("c:\\Users\\Levi\\projects\\9bar\\debug.log")
    {
      let _ = writeln!(f, "PANIC CAUGHT: {:?}", info);
    }
  }));
  app_lib::run();
}
