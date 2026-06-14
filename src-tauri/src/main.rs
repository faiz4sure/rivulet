#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod net;

fn main() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_js::init())
        .invoke_handler(tauri::generate_handler![
            net::download::download_bytes,
            net::download::install_plugin_bundle
        ]);

    net::register(builder)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
