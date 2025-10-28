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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MultiTrackClip {
    pub input_path: String,
    pub track_id: i32,
    pub start_time: f64,
    pub duration: f64,
    pub trim_start: f64,
    pub trim_end: f64,
    pub overlay_position: Option<(f64, f64)>,
    pub overlay_size: Option<(f64, f64)>,
    pub overlay_opacity: Option<f64>,
    pub overlay_blend_mode: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MultiTrackExportOptions {
    pub clips: Vec<MultiTrackClip>,
    pub output_path: String,
    pub global_trim_start: f64,
    pub global_trim_end: f64,
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
pub async fn export_multi_track_video(options: MultiTrackExportOptions) -> Result<String, String> {
    // Validate inputs
    if options.clips.is_empty() {
        return Err("No clips provided".to_string());
    }

    if options.global_trim_start < 0.0 || options.global_trim_end <= options.global_trim_start {
        return Err("Invalid global trim range".to_string());
    }

    // Create a temporary directory for intermediate files
    let temp_dir = std::env::temp_dir().join("nolanforge_multitrack_export");
    fs::create_dir_all(&temp_dir).map_err(|e| format!("Failed to create temp directory: {}", e))?;

    // Separate main track clips (track 0) from overlay clips (track 1+)
    let main_track_clips: Vec<_> = options.clips.iter().filter(|clip| clip.track_id == 0).collect();
    let overlay_clips: Vec<_> = options.clips.iter().filter(|clip| clip.track_id > 0).collect();

    if main_track_clips.is_empty() {
        return Err("No main track clips found (track 0)".to_string());
    }

    // Step 1: Create the main video track with audio
    let main_video_path = temp_dir.join("main_video.mp4");
    let main_audio_path = temp_dir.join("main_audio.mp3");

    // Extract audio from main track clips
    for clip in &main_track_clips {
        let duration = clip.trim_end - clip.trim_start;
        if duration <= 0.0 {
            continue;
        }

        // Extract audio from this clip
        let output = Command::new("ffmpeg")
            .arg("-ss")
            .arg(clip.trim_start.to_string())
            .arg("-i")
            .arg(&clip.input_path)
            .arg("-t")
            .arg(duration.to_string())
            .arg("-vn") // No video
            .arg("-acodec")
            .arg("mp3")
            .arg("-y")
            .arg(&main_audio_path)
            .output();

        match output {
            Ok(result) => {
                if !result.status.success() {
                    let error_msg = String::from_utf8_lossy(&result.stderr);
                    return Err(format!("FFmpeg error extracting audio: {}", error_msg));
                }
            }
            Err(e) => {
                return Err(format!("Failed to execute FFmpeg for audio extraction: {}", e));
            }
        }
        break; // Only use the first main track clip for audio
    }

    // Create main video track (video only, no audio)
    for clip in &main_track_clips {
        let duration = clip.trim_end - clip.trim_start;
        if duration <= 0.0 {
            continue;
        }

        let output = Command::new("ffmpeg")
            .arg("-ss")
            .arg(clip.trim_start.to_string())
            .arg("-i")
            .arg(&clip.input_path)
            .arg("-t")
            .arg(duration.to_string())
            .arg("-an") // No audio
            .arg("-c:v")
            .arg("libx264")
            .arg("-y")
            .arg(&main_video_path)
            .output();

        match output {
            Ok(result) => {
                if !result.status.success() {
                    let error_msg = String::from_utf8_lossy(&result.stderr);
                    return Err(format!("FFmpeg error creating main video: {}", error_msg));
                }
            }
            Err(e) => {
                return Err(format!("Failed to execute FFmpeg for main video: {}", e));
            }
        }
        break; // Only use the first main track clip for video
    }

    // Step 2: Create overlay videos if any
    let mut overlay_videos = Vec::new();
    for (i, clip) in overlay_clips.iter().enumerate() {
        let duration = clip.trim_end - clip.trim_start;
        if duration <= 0.0 {
            continue;
        }

        let overlay_path = temp_dir.join(format!("overlay_{}.mp4", i));
        
        let output = Command::new("ffmpeg")
            .arg("-ss")
            .arg(clip.trim_start.to_string())
            .arg("-i")
            .arg(&clip.input_path)
            .arg("-t")
            .arg(duration.to_string())
            .arg("-an") // No audio
            .arg("-c:v")
            .arg("libx264")
            .arg("-y")
            .arg(&overlay_path)
            .output();

        match output {
            Ok(result) => {
                if !result.status.success() {
                    let error_msg = String::from_utf8_lossy(&result.stderr);
                    return Err(format!("FFmpeg error creating overlay video {}: {}", i, error_msg));
                }
                overlay_videos.push(overlay_path);
            }
            Err(e) => {
                return Err(format!("Failed to execute FFmpeg for overlay video {}: {}", i, e));
            }
        }
    }

    // Step 3: Compose final video with overlays and audio
    let mut ffmpeg_args = Vec::new();
    
    // Add main video input
    ffmpeg_args.extend(["-i".to_string(), main_video_path.to_string_lossy().to_string()]);
    
    // Add overlay video inputs
    for overlay_path in &overlay_videos {
        ffmpeg_args.extend(["-i".to_string(), overlay_path.to_string_lossy().to_string()]);
    }
    
    // Add audio input
    ffmpeg_args.extend(["-i".to_string(), main_audio_path.to_string_lossy().to_string()]);

    // Build filter complex for video composition
    let mut filter_complex = String::new();
    
    if overlay_videos.is_empty() {
        // No overlays, just use main video
        filter_complex.push_str("[0:v]scale=1920:1080[video]");
    } else {
        // Scale main video
        filter_complex.push_str("[0:v]scale=1920:1080[main];");
        
        // Process each overlay
        for (i, clip) in overlay_clips.iter().enumerate() {
            if i < overlay_videos.len() {
                let input_idx = i + 1; // Overlay inputs start from index 1
                
                // Get overlay properties
                let (_x, _y) = clip.overlay_position.unwrap_or((0.0, 0.0));
                let (width, height) = clip.overlay_size.unwrap_or((640.0, 360.0));
                let opacity = clip.overlay_opacity.unwrap_or(0.8);
                
                // Scale overlay
                filter_complex.push_str(&format!("[{}:v]scale={}:{}[overlay{}_scaled];", 
                    input_idx, width as i32, height as i32, i));
                
                // Apply opacity
                filter_complex.push_str(&format!("[overlay{}_scaled]format=yuva420p,colorchannelmixer=aa={}[overlay{}_alpha];", 
                    i, opacity, i));
            }
        }
        
        // Chain overlays together
        let mut current_input = "main".to_string();
        for i in 0..overlay_videos.len() {
            let output_name = if i == overlay_videos.len() - 1 { "video" } else { &format!("overlay{}", i) };
            filter_complex.push_str(&format!("[{}][overlay{}_alpha]overlay={}:{}[{}]", 
                current_input, i, 
                overlay_clips[i].overlay_position.unwrap_or((0.0, 0.0)).0 as i32,
                overlay_clips[i].overlay_position.unwrap_or((0.0, 0.0)).1 as i32,
                output_name));
            
            if i < overlay_videos.len() - 1 {
                filter_complex.push_str(";");
                current_input = format!("overlay{}", i);
            }
        }
    }

    // Build final FFmpeg command
    let mut cmd = Command::new("ffmpeg");
    cmd.args(&ffmpeg_args);
    cmd.arg("-filter_complex").arg(&filter_complex);
    cmd.arg("-map").arg("[video]");
    
    // Map audio directly from the audio input (last input)
    let audio_input_idx = overlay_videos.len() + 1; // Audio is the last input
    cmd.arg("-map").arg(&format!("{}:a", audio_input_idx));
    
    cmd.arg("-c:v").arg("libx264");
    cmd.arg("-c:a").arg("aac");
    cmd.arg("-preset").arg("fast");
    cmd.arg("-y");
    cmd.arg(&options.output_path);

    let output = cmd.output();

    // Clean up temp files
    let cleanup_result = fs::remove_dir_all(&temp_dir);
    if let Err(e) = cleanup_result {
        eprintln!("Warning: Failed to clean up temp directory: {}", e);
    }

    match output {
        Ok(result) => {
            if result.status.success() {
                Ok(format!("Multi-track video exported successfully to: {}", options.output_path))
            } else {
                let error_msg = String::from_utf8_lossy(&result.stderr);
                Err(format!("FFmpeg composition error: {}", error_msg))
            }
        }
        Err(e) => Err(format!(
            "Failed to execute FFmpeg composition. Error: {}",
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


