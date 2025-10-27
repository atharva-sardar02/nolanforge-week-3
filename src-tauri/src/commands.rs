use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportOptions {
    pub input_path: String,
    pub output_path: String,
    pub trim_start: f64,
    pub trim_end: f64,
}

#[tauri::command]
pub async fn export_trimmed_video(options: ExportOptions) -> Result<String, String> {
    // Validate inputs
    if options.trim_start < 0.0 || options.trim_end <= options.trim_start {
        return Err("Invalid trim range".to_string());
    }

    let duration = options.trim_end - options.trim_start;

    // Build FFmpeg command
    // Note: This assumes FFmpeg is installed and available in PATH
    // For production, you might want to bundle FFmpeg with the app
    let output = Command::new("ffmpeg")
        .arg("-ss")
        .arg(options.trim_start.to_string())
        .arg("-i")
        .arg(&options.input_path)
        .arg("-t")
        .arg(duration.to_string())
        .arg("-c")
        .arg("copy") // Use stream copy for fast encoding
        .arg("-y") // Overwrite output file
        .arg(&options.output_path)
        .output();

    match output {
        Ok(result) => {
            if result.status.success() {
                Ok(format!("Video exported successfully to: {}", options.output_path))
            } else {
                let error_msg = String::from_utf8_lossy(&result.stderr);
                Err(format!("FFmpeg error: {}", error_msg))
            }
        }
        Err(e) => Err(format!(
            "Failed to execute FFmpeg. Make sure FFmpeg is installed and in your PATH. Error: {}",
            e
        )),
    }
}

#[tauri::command]
pub fn check_ffmpeg() -> Result<String, String> {
    let output = Command::new("ffmpeg").arg("-version").output();

    match output {
        Ok(result) => {
            if result.status.success() {
                let version = String::from_utf8_lossy(&result.stdout);
                let first_line = version.lines().next().unwrap_or("Unknown version");
                Ok(first_line.to_string())
            } else {
                Err("FFmpeg found but returned an error".to_string())
            }
        }
        Err(_) => Err("FFmpeg not found. Please install FFmpeg and add it to your PATH.".to_string()),
    }
}


