use crate::client::{AccountQuotaView, RouterClient};
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::Arc;
use tauri::{AppHandle, Manager, State};

pub struct AppState {
    pub is_pinned: Arc<AtomicBool>,
    pub last_shown_ms: Arc<AtomicU64>,
}

#[tauri::command]
pub async fn fetch_quotas(base_url: Option<String>) -> Result<Vec<AccountQuotaView>, String> {
    let client = RouterClient::new(base_url);
    client.fetch_all_quotas().await
}

#[tauri::command]
pub async fn toggle_provider_account(
    id: String,
    is_active: bool,
    base_url: Option<String>,
) -> Result<(), String> {
    let client = RouterClient::new(base_url);
    client.toggle_provider(&id, is_active).await
}

#[tauri::command]
pub async fn reset_account_credits(
    id: String,
    base_url: Option<String>,
) -> Result<(), String> {
    let client = RouterClient::new(base_url);
    client.reset_codex_credits(&id).await
}

#[tauri::command]
pub async fn open_dashboard_url(app: AppHandle, url: Option<String>) -> Result<(), String> {
    let target = url.unwrap_or_else(|| "http://localhost:20128/dashboard/quota".to_string());
    use tauri_plugin_opener::OpenerExt;
    app.opener()
        .open_url(&target, None::<&str>)
        .map_err(|e| format!("Failed to open browser: {}", e))
}

#[tauri::command]
pub fn hide_flyout_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn set_pinned_state(app: AppHandle, pinned: bool, state: State<AppState>) -> Result<(), String> {
    state.is_pinned.store(pinned, Ordering::Relaxed);
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.set_always_on_top(pinned);
    }
    Ok(())
}

#[tauri::command]
pub fn start_drag(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.start_dragging();
    }
    Ok(())
}

#[tauri::command]
pub fn move_window_by(app: AppHandle, dx: i32, dy: i32) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        if let Ok(pos) = window.outer_position() {
            let _ = window.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                x: pos.x + dx,
                y: pos.y + dy,
            }));
        }
    }
    Ok(())
}
