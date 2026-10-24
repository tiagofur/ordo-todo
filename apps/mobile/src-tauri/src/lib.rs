use log::info;

#[cfg(target_os = "android")]
fn init_platform_log() {
    android_logger::init_once(
        android_logger::Config::default()
            .with_max_level(log::LevelFilter::Info)
            .with_tag("OrdoMobile"),
    );
}

#[cfg(not(target_os = "android"))]
fn init_platform_log() {}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    init_platform_log();
    info!("run(): empezando");
    println!("run(): empezando (stdout)");

    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|_app| {
            info!("setup(): app configurada, creando webview");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
