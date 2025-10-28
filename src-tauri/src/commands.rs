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

    println!("🔍 Debug: Processing {} main track clips", main_track_clips.len());

    // Sort main track clips by start time
    let mut sorted_main_clips = main_track_clips.clone();
    sorted_main_clips.sort_by(|a, b| a.start_time.partial_cmp(&b.start_time).unwrap());

    // Calculate total duration and create a single video with proper timing
    let total_duration = options.global_trim_end - options.global_trim_start;
    
    // Create a black background video for the full duration
    let background_path = temp_dir.join("background.mp4");
    let output = Command::new("ffmpeg")
        .arg("-f")
        .arg("lavfi")
        .arg("-i")
        .arg("color=black:size=1920x1080:duration=0.1") // Create a short black video
        .arg("-vf")
        .arg(&format!("scale=1920:1080,loop=loop=-1:size=1:start=0"))
        .arg("-t")
        .arg(total_duration.to_string())
        .arg("-c:v")
        .arg("libx264")
        .arg("-y")
        .arg(&background_path)
        .output();

    match output {
        Ok(result) => {
            if !result.status.success() {
                let error_msg = String::from_utf8_lossy(&result.stderr);
                return Err(format!("FFmpeg error creating background: {}", error_msg));
            }
        }
        Err(e) => {
            return Err(format!("Failed to execute FFmpeg for background: {}", e));
        }
    }

    // Process each main track clip and overlay it at the correct time
    let mut filter_inputs = Vec::new();
    let mut filter_complex_parts = Vec::new();
    
    // Add background as input 0
    filter_inputs.push(background_path.to_string_lossy().to_string());
    
    for (i, clip) in sorted_main_clips.iter().enumerate() {
        let duration = clip.trim_end - clip.trim_start;
        if duration <= 0.0 {
            continue;
        }

        let clip_path = temp_dir.join(format!("main_clip_{}.mp4", i));
        
        // Create trimmed clip (video only)
        let output = Command::new("ffmpeg")
            .arg("-ss")
            .arg(clip.trim_start.to_string())
            .arg("-i")
            .arg(&clip.input_path)
            .arg("-t")
            .arg(duration.to_string())
            .arg("-an") // No audio for individual clips
            .arg("-c:v")
            .arg("libx264")
            .arg("-y")
            .arg(&clip_path)
            .output();

        match output {
            Ok(result) => {
                if !result.status.success() {
                    let error_msg = String::from_utf8_lossy(&result.stderr);
                    return Err(format!("FFmpeg error creating main clip {}: {}", i, error_msg));
                }
                filter_inputs.push(clip_path.to_string_lossy().to_string());
                
                // Calculate when this clip should start (relative to global trim start)
                let clip_start_time = clip.start_time - options.global_trim_start;
                let clip_end_time = clip_start_time + duration;
                
                println!("🔍 Debug: Main clip {} starts at {}s, ends at {}s", i, clip_start_time, clip_end_time);
                
                // Create overlay filter for this clip
                let input_idx = i + 1; // Input index (0 is background)
                let filter_part = format!("[{}:v]scale=1920:1080[main{}];[{}][main{}]overlay=0:0:enable='between(t,{},{})'[out{}]", 
                    input_idx, i, 
                    if i == 0 { "0:v" } else { &format!("out{}", i-1) }, i,
                    clip_start_time, clip_end_time, i);
                filter_complex_parts.push(filter_part);
            }
            Err(e) => {
                return Err(format!("Failed to execute FFmpeg for main clip {}: {}", i, e));
            }
        }
    }

    // Build the final filter complex for main video
    let main_filter_complex = filter_complex_parts.join(";");
    let final_output_name = if sorted_main_clips.len() > 1 { 
        format!("out{}", sorted_main_clips.len() - 1) 
    } else { 
        "0:v".to_string() 
    };
    
    println!("🔍 Debug: Main filter complex: {}", main_filter_complex);
    println!("🔍 Debug: Final output name: {}", final_output_name);

    // Create the main video with proper timing
    let mut main_cmd = Command::new("ffmpeg");
    for input in &filter_inputs {
        main_cmd.arg("-i").arg(input);
    }
    main_cmd.arg("-filter_complex").arg(&main_filter_complex);
    main_cmd.arg("-map").arg(&format!("[{}]", final_output_name));
    main_cmd.arg("-c:v").arg("libx264");
    main_cmd.arg("-y").arg(&main_video_path);

    let output = main_cmd.output();
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

    // Extract audio from all main track clips
    let mut audio_clip_paths = Vec::new();
    for (i, clip) in main_track_clips.iter().enumerate() {
        let duration = clip.trim_end - clip.trim_start;
        if duration <= 0.0 {
            continue;
        }

        let audio_clip_path = temp_dir.join(format!("main_audio_{}.mp3", i));
        
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
            .arg(&audio_clip_path)
            .output();

        match output {
            Ok(result) => {
                if !result.status.success() {
                    let error_msg = String::from_utf8_lossy(&result.stderr);
                    return Err(format!("FFmpeg error extracting audio from clip {}: {}", i, error_msg));
                }
                audio_clip_paths.push(audio_clip_path);
            }
            Err(e) => {
                return Err(format!("Failed to execute FFmpeg for audio extraction from clip {}: {}", i, e));
            }
        }
    }

    // Concatenate all audio clips
    if audio_clip_paths.len() > 1 {
        let audio_concat_file = temp_dir.join("audio_concat_list.txt");
        let mut audio_concat_content = String::new();
        for audio_path in &audio_clip_paths {
            audio_concat_content.push_str(&format!("file '{}'\n", audio_path.display()));
        }
        
        fs::write(&audio_concat_file, audio_concat_content)
            .map_err(|e| format!("Failed to write audio concat file: {}", e))?;

        // Concatenate audio clips
        let output = Command::new("ffmpeg")
            .arg("-f")
            .arg("concat")
            .arg("-safe")
            .arg("0")
            .arg("-i")
            .arg(&audio_concat_file)
            .arg("-c:a")
            .arg("mp3")
            .arg("-y")
            .arg(&main_audio_path)
            .output();

        match output {
            Ok(result) => {
                if !result.status.success() {
                    let error_msg = String::from_utf8_lossy(&result.stderr);
                    return Err(format!("FFmpeg error concatenating audio clips: {}", error_msg));
                }
            }
            Err(e) => {
                return Err(format!("Failed to execute FFmpeg for audio concatenation: {}", e));
            }
        }
    } else if audio_clip_paths.len() == 1 {
        // Just copy the single audio clip
        fs::copy(&audio_clip_paths[0], &main_audio_path)
            .map_err(|e| format!("Failed to copy audio clip: {}", e))?;
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
    
    println!("🔍 Debug: Processing {} overlay videos", overlay_videos.len());
    println!("🔍 Debug: {} overlay clips provided", overlay_clips.len());
    
    if overlay_videos.is_empty() {
        // No overlays, just use main video
        filter_complex.push_str("[0:v]scale=1920:1080[video]");
        println!("🔍 Debug: No overlays, using main video only");
    } else {
        // Scale main video
        filter_complex.push_str("[0:v]scale=1920:1080[main];");
        
        // Process each overlay
        for (i, clip) in overlay_clips.iter().enumerate() {
            if i < overlay_videos.len() {
                let input_idx = i + 1; // Overlay inputs start from index 1
                
                // Get overlay properties
                let (x, y) = clip.overlay_position.unwrap_or((0.0, 0.0));
                let (width, height) = clip.overlay_size.unwrap_or((640.0, 360.0));
                let opacity = clip.overlay_opacity.unwrap_or(0.8);
                
                println!("🔍 Debug: Overlay {} - Position: ({}, {}), Size: {}x{}, Opacity: {}", 
                    i, x, y, width, height, opacity);
                
                // Scale overlay
                filter_complex.push_str(&format!("[{}:v]scale={}:{}[overlay{}_scaled];", 
                    input_idx, width as i32, height as i32, i));
                
                // Apply opacity
                filter_complex.push_str(&format!("[overlay{}_scaled]format=yuva420p,colorchannelmixer=aa={}[overlay{}_alpha];", 
                    i, opacity, i));
            }
        }
        
        // Chain overlays together with proper positioning and timing
        let mut current_input = "main".to_string();
        for i in 0..overlay_videos.len() {
            let output_name = if i == overlay_videos.len() - 1 { "video" } else { &format!("overlay{}", i) };
            
            // Get the actual position for this overlay
            let (x, y) = overlay_clips[i].overlay_position.unwrap_or((0.0, 0.0));
            
            // Calculate when this overlay should appear (relative to global trim start)
            let overlay_start_time = overlay_clips[i].start_time - options.global_trim_start;
            let overlay_end_time = overlay_start_time + (overlay_clips[i].trim_end - overlay_clips[i].trim_start);
            
            println!("🔍 Debug: Overlay {} Timeline Info:", i);
            println!("  📍 Position: ({}, {})", x, y);
            println!("  ⏰ Original start_time: {}s", overlay_clips[i].start_time);
            println!("  ⏰ Global trim start: {}s", options.global_trim_start);
            println!("  ⏰ Relative start_time: {}s", overlay_start_time);
            println!("  ⏰ Duration: {}s", overlay_clips[i].trim_end - overlay_clips[i].trim_start);
            println!("  ⏰ End time: {}s", overlay_end_time);
            println!("  🎬 Will appear from {}s to {}s", overlay_start_time, overlay_end_time);
            
            // Use enable parameter to control when overlay appears
            filter_complex.push_str(&format!("[{}][overlay{}_alpha]overlay={}:{}:enable='between(t,{},{})'[{}]", 
                current_input, i, x as i32, y as i32, overlay_start_time, overlay_end_time, output_name));
            
            if i < overlay_videos.len() - 1 {
                filter_complex.push_str(";");
                current_input = format!("overlay{}", i);
            }
        }
    }
    
    println!("🔍 Debug: Filter complex: {}", filter_complex);

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


