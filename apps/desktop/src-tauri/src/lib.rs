use serde::{Deserialize, Serialize};
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{Emitter, Manager};

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemInfo {
    pub platform: String,
    pub arch: String,
    pub version: String,
}

#[tauri::command]
fn get_system_info() -> SystemInfo {
    SystemInfo {
        platform: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    }
}

#[tauri::command]
fn toggle_mini_timer(app: tauri::AppHandle) -> Result<bool, String> {
    if let Some(window) = app.get_webview_window("timer") {
        let is_visible = window.is_visible().map_err(|e| e.to_string())?;
        if is_visible {
            window.hide().map_err(|e| e.to_string())?;
            Ok(false)
        } else {
            window.show().map_err(|e| e.to_string())?;
            window.set_focus().map_err(|e| e.to_string())?;
            Ok(true)
        }
    } else {
        Err("Mini timer window not found".to_string())
    }
}

#[tauri::command]
fn set_timer_window_visible(app: tauri::AppHandle, visible: bool) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("timer") {
        if visible {
            window.show().map_err(|e| e.to_string())?;
            window.set_focus().map_err(|e| e.to_string())?;
        } else {
            window.hide().map_err(|e| e.to_string())?;
        }
        Ok(())
    } else {
        Err("Mini timer window not found".to_string())
    }
}

#[tauri::command]
fn update_tray_title(app: tauri::AppHandle, title: String) -> Result<(), String> {
    if let Some(tray) = app.tray_by_id("main-tray") {
        tray.set_title(Some(title)).map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Main tray not found".to_string())
    }
}

#[tauri::command]
fn set_badge_count(_app: tauri::AppHandle, _count: Option<i64>) -> Result<(), String> {
    // Platform-agnostic stub for dock badge count
    Ok(())
}

#[tauri::command]
fn focus_main_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.show().map_err(|e| e.to_string())?;
        let _ = window.unminimize();
        window.set_focus().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Main window not found".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--autostart"]),
        ))
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            // Build system tray menu
            let show_i = MenuItem::with_id(app, "show", "Show Ordo-Todo", true, None::<&str>)?;
            let quick_add_i = MenuItem::with_id(app, "quick_add", "Quick Add Task...", true, Some("CmdOrCtrl+Shift+N"))?;
            let sep1 = PredefinedMenuItem::separator(app)?;
            let pomodoro_start_i = MenuItem::with_id(app, "pomodoro_start", "Start 25m Pomodoro", true, None::<&str>)?;
            let pomodoro_toggle_i = MenuItem::with_id(app, "pomodoro_toggle", "Pause / Resume Timer", true, None::<&str>)?;
            let timer_i = MenuItem::with_id(app, "timer", "Toggle Mini Timer", true, Some("CmdOrCtrl+Shift+T"))?;
            let sep2 = PredefinedMenuItem::separator(app)?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit Ordo-Todo", true, Some("CmdOrCtrl+Q"))?;

            let menu = Menu::with_items(
                app,
                &[
                    &show_i,
                    &quick_add_i,
                    &sep1,
                    &pomodoro_start_i,
                    &pomodoro_toggle_i,
                    &timer_i,
                    &sep2,
                    &quit_i,
                ],
            )?;

            // Setup tray icon
            let _tray = TrayIconBuilder::with_id("main-tray")
                .menu(&menu)
                .title("Ordo")
                .tooltip("Ordo-Todo")
                .show_menu_on_left_click(false)
                .icon(app.default_window_icon().unwrap().clone())
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.unminimize();
                            let _ = window.set_focus();
                        }
                    }
                    "quick_add" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.unminimize();
                            let _ = window.set_focus();
                            let _ = window.emit("quick-add-task", ());
                        }
                    }
                    "pomodoro_start" => {
                        let _ = app.emit("tray-pomodoro-start", ());
                    }
                    "pomodoro_toggle" => {
                        let _ = app.emit("tray-pomodoro-toggle", ());
                    }
                    "timer" => {
                        let _ = toggle_mini_timer(app.clone());
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.unminimize();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            toggle_mini_timer,
            set_timer_window_visible,
            update_tray_title,
            set_badge_count,
            focus_main_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
