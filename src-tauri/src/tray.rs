use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, WebviewWindow,
};
use tauri_plugin_positioner::{Position, WindowExt};

pub fn current_time_ms() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

pub fn show_and_position_window(
    window: &WebviewWindow,
    tray_rect: Option<tauri::Rect>,
    last_shown_ms: &Arc<AtomicU64>,
) {
    last_shown_ms.store(current_time_ms(), Ordering::Relaxed);

    let monitor = window
        .current_monitor()
        .ok()
        .flatten()
        .or_else(|| window.primary_monitor().ok().flatten());

    if let Some(monitor) = monitor {
        let scale = monitor.scale_factor();
        let mon_size = monitor.size();
        let mon_pos = monitor.position();

        let win_w = (390.0 * scale) as i32;
        let win_h = (540.0 * scale) as i32;
        let pad_x = (16.0 * scale) as i32;
        let pad_y = (12.0 * scale) as i32;

        let (target_x, target_y) = if let Some(rect) = tray_rect {
            let tray_pos = match rect.position {
                tauri::Position::Physical(p) => p,
                tauri::Position::Logical(l) => l.to_physical(scale),
            };
            let tray_size = match rect.size {
                tauri::Size::Physical(s) => s,
                tauri::Size::Logical(l) => l.to_physical(scale),
            };

            // If tray is in the bottom half of the monitor (standard Windows taskbar), place above tray
            let y = if tray_pos.y > mon_pos.y + (mon_size.height as i32 / 2) {
                tray_pos.y - win_h - pad_y
            } else {
                tray_pos.y + tray_size.height as i32 + pad_y
            };

            // Center horizontally over tray icon, clamped inside monitor boundaries
            let center_x = tray_pos.x + (tray_size.width as i32 / 2) - (win_w / 2);
            let min_x = mon_pos.x + pad_x;
            let max_x = mon_pos.x + mon_size.width as i32 - win_w - pad_x;
            let x = center_x.clamp(min_x, max_x);

            let min_y = mon_pos.y + pad_y;
            let max_y = mon_pos.y + mon_size.height as i32 - win_h - pad_y;
            let y = y.clamp(min_y, max_y);

            (x, y)
        } else {
            // Default fallback: bottom right corner above taskbar
            let x = mon_pos.x + mon_size.width as i32 - win_w - pad_x;
            let y = mon_pos.y + mon_size.height as i32 - win_h - (60.0 * scale) as i32;
            (x, y)
        };

        let _ = window.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
            x: target_x,
            y: target_y,
        }));
    } else {
        let _ = window.as_ref().window().move_window(Position::BottomRight);
    }
    let _ = window.show();
    let _ = window.unminimize();
    let _ = window.set_focus();
}

pub fn setup_system_tray(
    app: &AppHandle,
    last_shown_ms: Arc<AtomicU64>,
    is_quitting: Arc<std::sync::atomic::AtomicBool>,
) -> Result<(), Box<dyn std::error::Error>> {
    let show_item = MenuItemBuilder::with_id("show", "Show 9Bar").build(app)?;
    let dashboard_item = MenuItemBuilder::with_id("dashboard", "Open 9Router Dashboard").build(app)?;
    let quit_item = MenuItemBuilder::with_id("quit", "Quit 9Bar").build(app)?;

    let menu = MenuBuilder::new(app)
        .items(&[&show_item, &dashboard_item, &quit_item])
        .build()?;

    let icon = match app.default_window_icon() {
        Some(icon) => icon.clone(),
        None => tauri::include_image!("icons/32x32.png"),
    };

    let last_shown_clone = last_shown_ms.clone();
    let tray = TrayIconBuilder::with_id("main-tray")
        .tooltip("9Bar - 9Router Quota Companion")
        .icon(icon)
        .icon_as_template(false)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event({
            let last_shown_ms = last_shown_ms.clone();
            let is_quitting = is_quitting.clone();
            move |app, event| match event.id().as_ref() {
                "show" => {
                    if let Some(window) = app.get_webview_window("main") {
                        show_and_position_window(&window, None, &last_shown_ms);
                    }
                }
                "dashboard" => {
                    use tauri_plugin_opener::OpenerExt;
                    let _ = app.opener().open_url("http://127.0.0.1:20128/dashboard/quota", None::<&str>);
                }
                "quit" => {
                    is_quitting.store(true, Ordering::Relaxed);
                    app.exit(0);
                }
                _ => {}
            }
        })
        .on_tray_icon_event({
            let last_shown_ms = last_shown_clone;
            move |tray, event| {
                tauri_plugin_positioner::on_tray_event(tray.app_handle(), &event);
                match event {
                    TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        rect,
                        ..
                    }
                    | TrayIconEvent::DoubleClick {
                        button: MouseButton::Left,
                        rect,
                        ..
                    } => {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                show_and_position_window(&window, Some(rect), &last_shown_ms);
                            }
                        }
                    }
                    _ => {}
                }
            }
        })
        .build(app)?;

    app.manage(tray);

    Ok(())
}
