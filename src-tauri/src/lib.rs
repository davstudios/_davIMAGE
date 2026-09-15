mod image_tools;

use image_tools::{cancel_processing, inspect_metadata, process_images, scan_images, thumbnail_image};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            scan_images,
            inspect_metadata,
            process_images,
            cancel_processing,
            thumbnail_image
        ])
        .run(tauri::generate_context!())
        .expect("error while running _davIMAGE");
}
