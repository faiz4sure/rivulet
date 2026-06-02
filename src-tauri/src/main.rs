#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod net;

fn main() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_js::init());

    net::register(builder)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
