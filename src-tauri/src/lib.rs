pub mod client;
pub mod commands;
pub mod tray;

use commands::*;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tauri::{Manager, WindowEvent};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let is_pinned = Arc::new(AtomicBool::new(false));

    tauri::Builder::default()
        .manage(AppState {
            is_pinned: is_pinned.clone(),
        })
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )
        .setup(|app| {
            let handle = app.handle();
            tray::setup_system_tray(&handle)?;
            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::Focused(false) = event {
                let win = window.clone();
                tauri::async_runtime::spawn(async move {
                    // 200ms debounce allows Windows OS drag gestures to start without false-positive blur hiding
                    tokio::time::sleep(Duration::from_millis(200)).await;
                    if let Ok(focused) = win.is_focused() {
                        if !focused {
                            let state = win.state::<AppState>();
                            if !state.is_pinned.load(Ordering::Relaxed) {
                                let _ = win.hide();
                            }
                        }
                    }
                });
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running 9Router Quota Bar application");
}
