use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, WebviewWindow,
};
use tauri_plugin_positioner::{Position, WindowExt};

pub fn show_and_position_window(window: &WebviewWindow) {
    if let Ok(Some(monitor)) = window.current_monitor() {
        let scale = monitor.scale_factor();
        let size = monitor.size();
        let pos = monitor.position();

        let win_w = (380.0 * scale) as i32;
        let win_h = (520.0 * scale) as i32;
        let margin_x = (16.0 * scale) as i32;
        let margin_y = (60.0 * scale) as i32; // position above Windows taskbar

        let target_x = pos.x + size.width as i32 - win_w - margin_x;
        let target_y = pos.y + size.height as i32 - win_h - margin_y;

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

    let _tray = TrayIconBuilder::new()
        .tooltip("9Bar - 9Router Quota Companion")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    show_and_position_window(&window);
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
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    if window.is_visible().unwrap_or(false) {
                        let _ = window.hide();
                    } else {
                        show_and_position_window(&window);
                    }
                }
            }
        })
        .build(app)?;

    Ok(())
}
