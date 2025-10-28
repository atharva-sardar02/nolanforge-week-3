use serde::{Deserialize, Serialize};
use std::process::Command;
use std::fs;
use std::fs::File;
use std::io::Write;

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportOptions {
    pub input_path: String,
    pub output_path: String,
    pub trim_start: f64,
    pub trim_end: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClipData {
    pub input_path: String,
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

#[tauri::command]
pub async fn export_multi_clip_video(clips: Vec<ClipData>, output_path: String) -> Result<String, String> {
    // Validate inputs
    if clips.is_empty() {
        return Err("No clips provided".to_string());
    }

    // Create a temporary directory for intermediate files
    let temp_dir = std::env::temp_dir().join("nolanforge_export");
    fs::create_dir_all(&temp_dir).map_err(|e| format!("Failed to create temp directory: {}", e))?;

    // Step 1: Trim each clip individually
    let mut trimmed_clips = Vec::new();
    for (i, clip) in clips.iter().enumerate() {
        let duration = clip.trim_end - clip.trim_start;
        if duration <= 0.0 {
            return Err(format!("Invalid trim range for clip {}", i));
        }

        let temp_output = temp_dir.join(format!("clip_{}.mp4", i));
        
        // Trim the clip
        let output = Command::new("ffmpeg")
            .arg("-ss")
            .arg(clip.trim_start.to_string())
            .arg("-i")
            .arg(&clip.input_path)
            .arg("-t")
            .arg(duration.to_string())
            .arg("-c")
            .arg("copy")
            .arg("-y")
            .arg(&temp_output)
            .output();

        match output {
            Ok(result) => {
                if !result.status.success() {
                    let error_msg = String::from_utf8_lossy(&result.stderr);
                    return Err(format!("FFmpeg error trimming clip {}: {}", i, error_msg));
                }
            }
            Err(e) => {
                return Err(format!("Failed to execute FFmpeg for clip {}: {}", i, e));
            }
        }

        trimmed_clips.push(temp_output);
    }

    // Step 2: Create concat file list
    let concat_file = temp_dir.join("concat_list.txt");
    let mut concat_content = String::new();
    for clip_path in &trimmed_clips {
        concat_content.push_str(&format!("file '{}'\n", clip_path.display()));
    }
    
    fs::write(&concat_file, concat_content)
        .map_err(|e| format!("Failed to write concat file: {}", e))?;

    // Step 3: Concatenate all clips
    let output = Command::new("ffmpeg")
        .arg("-f")
        .arg("concat")
        .arg("-safe")
        .arg("0")
        .arg("-i")
        .arg(&concat_file)
        .arg("-c")
        .arg("copy")
        .arg("-y")
        .arg(&output_path)
        .output();

    // Clean up temp files
    let cleanup_result = fs::remove_dir_all(&temp_dir);
    if let Err(e) = cleanup_result {
        eprintln!("Warning: Failed to clean up temp directory: {}", e);
    }

    match output {
        Ok(result) => {
            if result.status.success() {
                Ok(format!("Multi-clip video exported successfully to: {}", output_path))
            } else {
                let error_msg = String::from_utf8_lossy(&result.stderr);
                Err(format!("FFmpeg concatenation error: {}", error_msg))
            }
        }
        Err(e) => Err(format!(
            "Failed to execute FFmpeg concatenation. Error: {}",
            e
        )),
    }
}

#[tauri::command]
pub async fn save_recording_to_file(
    file_path: String,
    data: Vec<u8>,
) -> Result<String, String> {
    match File::create(&file_path) {
        Ok(mut file) => {
            match file.write_all(&data) {
                Ok(_) => Ok(format!("Recording saved successfully to: {}", file_path)),
                Err(e) => Err(format!("Failed to write file: {}", e))
            }
        }
        Err(e) => Err(format!("Failed to create file: {}", e))
    }
}


