pub mod client;
pub mod commands;
pub mod tray;

use commands::*;
use std::fs::OpenOptions;
use std::io::Write;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tauri::WindowEvent;

fn log_msg(msg: &str) {
    if let Ok(mut f) = OpenOptions::new()
        .create(true)
        .append(true)
        .open("c:\\Users\\Levi\\projects\\9bar\\debug.log")
    {
        let _ = writeln!(f, "{}", msg);
    }
}

#[cfg(windows)]
extern "system" {
    fn GetAsyncKeyState(vKey: i32) -> i16;
}

#[cfg(windows)]
fn is_left_mouse_down() -> bool {
    unsafe {
        (GetAsyncKeyState(0x01) as u16 & 0x8000) != 0
    }
}

#[cfg(not(windows))]
fn is_left_mouse_down() -> bool {
    false
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    log_msg("=== 9Bar run() starting ===");
    let is_pinned = Arc::new(AtomicBool::new(false));

    log_msg("Configuring tauri builder...");
    let is_pinned_clone = is_pinned.clone();
    let builder = tauri::Builder::default()
        .manage(AppState {
            is_pinned: is_pinned.clone(),
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_positioner::init())
        .setup(|app| {
            log_msg("INSIDE SETUP HOOK");
            let handle = app.handle().clone();
            if let Err(e) = tray::setup_system_tray(&handle) {
                log_msg(&format!("Error setting up system tray: {:?}", e));
            } else {
                log_msg("System tray setup successfully");
            }
            Ok(())
        })
        .on_window_event(move |window, event| {
            match event {
                WindowEvent::CloseRequested { api, .. } => {
                    api.prevent_close();
                    let _ = window.hide();
                }
                WindowEvent::Focused(false) => {
                    let win = window.clone();
                    let is_pinned_clone = is_pinned_clone.clone();
                    tauri::async_runtime::spawn(async move {
                        // 1. Initial debounce
                        tokio::time::sleep(tokio::time::Duration::from_millis(200)).await;

                        // 2. If user is holding left click (dragging header or interacting), wait until release
                        while is_left_mouse_down() {
                            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
                        }

                        // 3. Grace period after mouse release
                        tokio::time::sleep(tokio::time::Duration::from_millis(150)).await;

                        // 4. If window is still unpinned and not focused, hide
                        if let Ok(focused) = win.is_focused() {
                            if !focused && !is_pinned_clone.load(Ordering::Relaxed) {
                                let _ = win.hide();
                            }
                        }
                    });
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            fetch_quotas,
            toggle_provider_account,
            reset_account_credits,
            open_dashboard_url,
            hide_flyout_window,
            set_pinned_state,
            start_drag,
            move_window_by,
        ]);

    log_msg("Building tauri app...");
    let app = match builder.build(tauri::generate_context!()) {
        Ok(app) => {
            log_msg("Tauri app built successfully");
            app
        }
        Err(e) => {
            log_msg(&format!("ERROR building tauri app: {:?}", e));
            return;
        }
    };

    log_msg("Entering app.run loop...");
    app.run(|_app_handle, event| {
        log_msg(&format!("RunEvent: {:?}", event));
        match event {
            tauri::RunEvent::ExitRequested { api, code, .. } => {
                log_msg(&format!("ExitRequested with code: {:?}", code));
                if code.is_none() {
                    api.prevent_exit();
                }
            }
            tauri::RunEvent::Ready => {
                log_msg("RunEvent::Ready received!");
            }
            _ => {}
        }
    });
    log_msg("app.run exited");
}
