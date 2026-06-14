#[tauri::command]
pub async fn download_bytes(url: String) -> Result<Vec<u8>, String> {
    let client = reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::limited(10))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let response = client
        .get(&url)
        .header("User-Agent", "Rivulet/0.1")
        .send()
        .await
        .map_err(|e| format!("Failed to download {}: {}", url, e))?;

    if !response.status().is_success() {
        return Err(format!(
            "Download failed with status {}: {}",
            response.status(),
            url
        ));
    }

    response
        .bytes()
        .await
        .map(|b| b.to_vec())
        .map_err(|e| format!("Failed to read response bytes: {}", e))
}

#[derive(Clone, serde::Serialize)]
struct InstallProgress {
    step: String,
    message: String,
}

#[tauri::command]
pub async fn install_plugin_bundle(
    app: tauri::AppHandle,
    manifest_id: String,
    download_url: String,
    entry: String,
) -> Result<(), String> {
    use tauri::Manager;
    use tauri::Emitter;
    use tauri_plugin_shell::ShellExt;
    use std::fs;
    use std::io::Cursor;
    use zip::ZipArchive;

    let _ = app.emit("install-status", InstallProgress {
        step: "downloading".into(),
        message: "Downloading plugin archive...".into(),
    });

    let client = reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::limited(10))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let response = client
        .get(&download_url)
        .header("User-Agent", "Rivulet/0.1")
        .send()
        .await
        .map_err(|e| format!("Network request failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Download failed with status {}", response.status()));
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Failed to read remote payload bytes: {}", e))?;

    let _ = app.emit("install-status", InstallProgress {
        step: "extracting".into(),
        message: "Extracting package contents...".into(),
    });

    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve AppData path: {}", e))?;

    let plugins_dir = app_data_dir.join("plugins").join(&manifest_id);
    if plugins_dir.exists() {
        let _ = fs::remove_dir_all(&plugins_dir);
    }
    fs::create_dir_all(&plugins_dir).map_err(|e| format!("Failed to create plugin dir: {}", e))?;

    let reader = Cursor::new(bytes);
    let mut archive = ZipArchive::new(reader).map_err(|e| format!("Invalid zip format: {}", e))?;


    let root_prefix = if archive.len() > 0 {
        let first_file = archive.by_index(0).map_err(|e| e.to_string())?;
        let name = first_file.name();
        name.split('/').next().unwrap_or("").to_string() + "/"
    } else {
        String::new()
    };

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
        let file_name = file.name().to_string();
        
        let stripped_name = if file_name.starts_with(&root_prefix) {
            &file_name[root_prefix.len()..]
        } else {
            &file_name
        };

        if stripped_name.is_empty() {
            continue;
        }

        let outpath = plugins_dir.join(stripped_name);

        if file.name().ends_with('/') {
            fs::create_dir_all(&outpath).map_err(|e| e.to_string())?;
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    fs::create_dir_all(p).map_err(|e| e.to_string())?;
                }
            }
            let mut outfile = fs::File::create(&outpath).map_err(|e| e.to_string())?;
            std::io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
        }
    }

    let _ = app.emit("install-status", InstallProgress {
        step: "installing".into(),
        message: "Installing plugin dependencies...".into(),
    });

    let entry_path = plugins_dir.join(&entry);
    if entry_path.exists() {
        let output = app.shell().sidecar("deno")
            .map_err(|e| format!("Failed to find deno sidecar: {}", e))?
            .args(["cache", "--node-modules-dir=auto", entry_path.to_str().unwrap()])
            .output()
            .await
            .map_err(|e| format!("Failed to run deno cache: {}", e))?;

        if !output.status.success() {
            return Err(format!("Dependency installation failed: {}", String::from_utf8_lossy(&output.stderr)));
        }
    } else {
        return Err(format!("Entry file {} not found in extracted archive", entry));
    }

    Ok(())
}
