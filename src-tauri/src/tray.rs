use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, WebviewWindow,
};
use tauri_plugin_positioner::{Position, WindowExt};

pub fn show_and_position_window(window: &WebviewWindow, tray_rect: Option<tauri::Rect>) {
    if let Ok(Some(monitor)) = window.current_monitor() {
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
    let _ = window.set_focus();
}

pub fn setup_system_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
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

    let tray = TrayIconBuilder::with_id("main-tray")
        .tooltip("9Bar - 9Router Quota Companion")
        .icon(icon)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    show_and_position_window(&window, None);
                }
            }
            "dashboard" => {
                use tauri_plugin_opener::OpenerExt;
                let _ = app.opener().open_url("http://localhost:20128/dashboard/quota", None::<&str>);
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            tauri_plugin_positioner::on_tray_event(tray.app_handle(), &event);
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                rect,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    if window.is_visible().unwrap_or(false) {
                        let _ = window.hide();
                    } else {
                        show_and_position_window(&window, Some(rect));
                    }
                }
            }
        })
        .build(app)?;

    app.manage(tray);

    Ok(())
}
