pub mod client;
pub mod commands;
pub mod tray;

use commands::*;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tauri::WindowEvent;

#[cfg(windows)]
#[repr(C)]
#[derive(Default)]
struct POINT {
    x: i32,
    y: i32,
}

#[cfg(windows)]
extern "system" {
    fn GetAsyncKeyState(vKey: i32) -> i16;
    fn GetCursorPos(lpPoint: *mut POINT) -> i32;
}

#[cfg(windows)]
fn is_cursor_inside_window(win: &tauri::Window) -> bool {
    unsafe {
        let mut pt = POINT::default();
        if GetCursorPos(&mut pt) != 0 {
            if let (Ok(pos), Ok(size)) = (win.outer_position(), win.outer_size()) {
                let x = pt.x;
                let y = pt.y;
                return x >= pos.x && x <= pos.x + size.width as i32 && y >= pos.y && y <= pos.y + size.height as i32;
            }
        }
    }
    false
}

#[cfg(not(windows))]
fn is_cursor_inside_window(_win: &tauri::Window) -> bool {
    false
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
    let is_pinned = Arc::new(AtomicBool::new(false));
    let last_shown_ms = Arc::new(std::sync::atomic::AtomicU64::new(0));
    let is_quitting = Arc::new(AtomicBool::new(false));

    let is_pinned_clone = is_pinned.clone();
    let last_shown_clone1 = last_shown_ms.clone();
    let last_shown_clone2 = last_shown_ms.clone();
    let is_quitting_tray = is_quitting.clone();
    let is_quitting_run = is_quitting.clone();

    let builder = tauri::Builder::default()
        .manage(AppState {
            is_pinned: is_pinned.clone(),
            last_shown_ms: last_shown_ms.clone(),
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_positioner::init())
        .setup(move |app| {
            let handle = app.handle().clone();
            tray::setup_system_tray(&handle, last_shown_clone1, is_quitting_tray)?;
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
                    let last_shown_clone = last_shown_clone2.clone();
                    tauri::async_runtime::spawn(async move {
                        // 1. Initial grace period
                        tokio::time::sleep(tokio::time::Duration::from_millis(300)).await;

                        let now = tray::current_time_ms();
                        let last_shown = last_shown_clone.load(Ordering::Relaxed);
                        // If window was just opened, ignore immediate blur from tray dismiss
                        if now.saturating_sub(last_shown) < 800 {
                            return;
                        }

                        // 2. If user is holding left click (dragging header or interacting), wait until release
                        while is_left_mouse_down() {
                            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
                        }

                        // 3. Grace period after mouse release
                        tokio::time::sleep(tokio::time::Duration::from_millis(150)).await;

                        // 4. If mouse is hovering over the window, don't hide
                        if is_cursor_inside_window(&win) {
                            return;
                        }

                        // 5. If window is still unpinned and not focused, hide
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
            open_dashboard_url,
            hide_flyout_window,
            set_pinned_state,
            start_drag,
            move_window_by,
        ]);

    let app = match builder.build(tauri::generate_context!()) {
        Ok(app) => app,
        Err(e) => {
            eprintln!("Error building 9Bar application: {:?}", e);
            return;
        }
    };

    app.run(move |_app_handle, event| {
        if let tauri::RunEvent::ExitRequested { api, .. } = event {
            if !is_quitting_run.load(Ordering::Relaxed) {
                api.prevent_exit();
            }
        }
    });
}
