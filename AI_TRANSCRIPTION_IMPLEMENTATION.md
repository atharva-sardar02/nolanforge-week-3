# AI Video Transcription Implementation Guide

## Overview
This guide contains all the code and configuration needed to implement AI video transcription using OpenAI Whisper API in the NolanForge video editor.

## Dependencies to Add

### Backend (Cargo.toml)
Add these dependencies to `src-tauri/Cargo.toml`:
```toml
reqwest = { version = "0.12", features = ["json", "multipart", "stream"] }
tokio = { version = "1", features = ["full"] }
tokio-util = { version = "0.7", features = ["codec"] }
dotenv = "0.15"
```

### Frontend (package.json)
The following dependencies should already be available:
- `@tauri-apps/api` (for invoke)
- `@tauri-apps/plugin-dialog` (for save/open dialogs)

## Environment Configuration

### Create .env file in project root:
```env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=whisper-1
```

### Update .gitignore:
Make sure these lines are in `.gitignore`:
```
.env
.env.local
.env.*.local
```

## Backend Implementation

### 1. Create src-tauri/src/config.rs
```rust
use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub openai_api_key: String,
    pub openai_model: String,
}

impl Config {
    pub fn from_env() -> Result<Self, String> {
        // Load .env file
        dotenv::dotenv().ok();
        
        Ok(Config {
            openai_api_key: env::var("OPENAI_API_KEY")
                .map_err(|_| "OPENAI_API_KEY not found in environment variables. Please add it to your .env file.")?,
            openai_model: env::var("OPENAI_MODEL")
                .unwrap_or_else(|_| "whisper-1".to_string()),
        })
    }
}
```

### 2. Create src-tauri/src/services/mod.rs
```rust
pub mod openai;
```

### 3. Create src-tauri/src/services/openai.rs
```rust
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct TranscriptionResponse {
    pub text: String,
    pub language: Option<String>,
    pub duration: Option<f64>,
    pub words: Option<Vec<Word>>,
    pub segments: Option<Vec<Segment>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Word {
    pub word: String,
    pub start: f64,
    pub end: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Segment {
    pub id: i32,
    pub seek: f64,
    pub start: f64,
    pub end: f64,
    pub text: String,
    pub tokens: Vec<i32>,
    pub temperature: f64,
    pub avg_logprob: f64,
    pub compression_ratio: f64,
    pub no_speech_prob: f64,
}

pub async fn transcribe_audio(
    audio_path: &Path,
    api_key: &str,
    model: &str,
    language: Option<&str>,
) -> Result<TranscriptionResponse, String> {
    use reqwest::Client;
    use tokio::fs::File;
    use tokio_util::codec::{BytesCodec, FramedRead};

    let client = Client::new();
    
    // Read the audio file
    let file = File::open(audio_path)
        .await
        .map_err(|e| format!("Failed to open audio file: {}", e))?;
    
    let stream = FramedRead::new(file, BytesCodec::new());
    let file_body = reqwest::Body::wrap_stream(stream);
    
    // Create multipart form
    let part = reqwest::multipart::Part::stream(file_body)
        .file_name(audio_path.file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("audio.mp3")
            .to_string());
    
    let mut form = reqwest::multipart::Form::new()
        .part("file", part)
        .text("model", model.to_string())
        .text("response_format", "verbose_json".to_string())
        .text("timestamp_granularities", r#"["word", "segment"]"#.to_string());
    
    // Add language if specified
    if let Some(lang) = language {
        form = form.text("language", lang.to_string());
    }
    
    println!("🔍 Debug: Sending transcription request to OpenAI...");
    println!("🔍 Debug: Audio file: {}", audio_path.display());
    println!("🔍 Debug: Model: {}", model);
    
    let response = client
        .post("https://api.openai.com/v1/audio/transcriptions")
        .header("Authorization", format!("Bearer {}", api_key))
        .multipart(form)
        .send()
        .await
        .map_err(|e| format!("API request failed: {}", e))?;
    
    if !response.status().is_success() {
        let status = response.status();
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("OpenAI API error ({}): {}", status, error_text));
    }
    
    let transcription: TranscriptionResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;
    
    println!("🔍 Debug: Transcription completed successfully");
    println!("🔍 Debug: Text length: {} characters", transcription.text.len());
    
    Ok(transcription)
}
```

### 4. Update src-tauri/src/commands.rs
Add these imports at the top:
```rust
use crate::config::Config;
use crate::services::openai::{transcribe_audio, TranscriptionResponse};
```

Add these structs and commands at the end of the file:
```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct TranscriptionOptions {
    pub video_path: String,
    pub language: Option<String>,
    pub output_format: String, // "srt", "vtt", "txt", "json"
}

#[tauri::command]
pub async fn transcribe_video(
    options: TranscriptionOptions,
) -> Result<TranscriptionResponse, String> {
    // Load configuration
    let config = Config::from_env()
        .map_err(|e| format!("Configuration error: {}", e))?;
    
    println!("🔍 Debug: Starting video transcription...");
    println!("🔍 Debug: Video path: {}", options.video_path);
    
    // Create temporary directory for audio extraction
    let temp_dir = std::env::temp_dir().join("nolanforge_transcription");
    fs::create_dir_all(&temp_dir)
        .map_err(|e| format!("Failed to create temp directory: {}", e))?;
    
    // Extract audio from video
    let audio_path = temp_dir.join("audio_for_transcription.mp3");
    
    let output = Command::new("ffmpeg")
        .arg("-i")
        .arg(&options.video_path)
        .arg("-vn") // No video
        .arg("-acodec")
        .arg("mp3")
        .arg("-ar")
        .arg("16000") // 16kHz sample rate (recommended for Whisper)
        .arg("-ac")
        .arg("1") // Mono audio
        .arg("-y")
        .arg(&audio_path)
        .output();
    
    match output {
        Ok(result) => {
            if !result.status.success() {
                let error_msg = String::from_utf8_lossy(&result.stderr);
                return Err(format!("FFmpeg error extracting audio: {}", error_msg));
            }
        }
        Err(e) => {
            return Err(format!("Failed to execute FFmpeg: {}", e));
        }
    }
    
    println!("🔍 Debug: Audio extracted successfully");
    
    // Transcribe audio using OpenAI
    let transcription = transcribe_audio(
        &audio_path,
        &config.openai_api_key,
        &config.openai_model,
        options.language.as_deref(),
    ).await?;
    
    // Clean up temporary files
    let _ = fs::remove_dir_all(&temp_dir);
    
    println!("🔍 Debug: Transcription completed successfully");
    Ok(transcription)
}

#[tauri::command]
pub async fn export_transcript(
    transcript: TranscriptionResponse,
    output_path: String,
    format: String,
) -> Result<String, String> {
    println!("🔍 Debug: Exporting transcript to {}", output_path);
    println!("🔍 Debug: Format: {}", format);
    
    let content = match format.as_str() {
        "srt" => generate_srt(&transcript),
        "vtt" => generate_vtt(&transcript),
        "txt" => transcript.text.clone(),
        "json" => serde_json::to_string_pretty(&transcript)
            .map_err(|e| format!("Failed to serialize transcript: {}", e))?,
        _ => return Err(format!("Unsupported format: {}", format)),
    };
    
    fs::write(&output_path, content)
        .map_err(|e| format!("Failed to write transcript file: {}", e))?;
    
    println!("🔍 Debug: Transcript exported successfully");
    Ok(format!("Transcript exported to {}", output_path))
}

fn generate_srt(transcript: &TranscriptionResponse) -> String {
    let mut srt_content = String::new();
    
    if let Some(segments) = &transcript.segments {
        for (index, segment) in segments.iter().enumerate() {
            srt_content.push_str(&format!("{}\n", index + 1));
            srt_content.push_str(&format!("{} --> {}\n", 
                format_time_srt(segment.start), 
                format_time_srt(segment.end)
            ));
            srt_content.push_str(&format!("{}\n\n", segment.text.trim()));
        }
    } else {
        // Fallback to full text if no segments
        srt_content.push_str("1\n");
        srt_content.push_str("00:00:00,000 --> 00:00:10,000\n");
        srt_content.push_str(&format!("{}\n", transcript.text));
    }
    
    srt_content
}

fn generate_vtt(transcript: &TranscriptionResponse) -> String {
    let mut vtt_content = String::from("WEBVTT\n\n");
    
    if let Some(segments) = &transcript.segments {
        for segment in segments {
            vtt_content.push_str(&format!("{} --> {}\n", 
                format_time_vtt(segment.start), 
                format_time_vtt(segment.end)
            ));
            vtt_content.push_str(&format!("{}\n\n", segment.text.trim()));
        }
    } else {
        // Fallback to full text if no segments
        vtt_content.push_str("00:00:00.000 --> 00:00:10.000\n");
        vtt_content.push_str(&format!("{}\n", transcript.text));
    }
    
    vtt_content
}

fn format_time_srt(seconds: f64) -> String {
    let hours = (seconds / 3600.0) as u32;
    let minutes = ((seconds % 3600.0) / 60.0) as u32;
    let secs = (seconds % 60.0) as u32;
    let millis = ((seconds % 1.0) * 1000.0) as u32;
    
    format!("{:02}:{:02}:{:02},{:03}", hours, minutes, secs, millis)
}

fn format_time_vtt(seconds: f64) -> String {
    let hours = (seconds / 3600.0) as u32;
    let minutes = ((seconds % 3600.0) / 60.0) as u32;
    let secs = (seconds % 60.0) as u32;
    let millis = ((seconds % 1.0) * 1000.0) as u32;
    
    format!("{:02}:{:02}:{:02}.{:03}", hours, minutes, secs, millis)
}
```

### 5. Update src-tauri/src/lib.rs
Add the new modules and commands:
```rust
mod commands;
mod config;
mod services;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::export_trimmed_video,
            commands::export_multi_clip_video,
            commands::export_multi_track_video,
            commands::check_ffmpeg,
            commands::save_recording_to_file,
            commands::transcribe_video,
            commands::export_transcript
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## Frontend Implementation

### 1. Create src/types/transcription.ts
```typescript
export interface TranscriptionResponse {
  text: string;
  language?: string;
  duration?: number;
  words?: Word[];
  segments?: Segment[];
}

export interface Word {
  word: string;
  start: number;
  end: number;
}

export interface Segment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

export interface TranscriptionOptions {
  video_path: string;
  language?: string;
  output_format: 'srt' | 'vtt' | 'txt' | 'json';
}

export interface TranscriptionState {
  isProcessing: boolean;
  progress: number;
  transcript: TranscriptionResponse | null;
  error: string | null;
}
```

### 2. Create src/hooks/useTranscription.ts
```typescript
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import { TranscriptionResponse, TranscriptionOptions, TranscriptionState } from '../types/transcription';

export const useTranscription = () => {
  const [state, setState] = useState<TranscriptionState>({
    isProcessing: false,
    progress: 0,
    transcript: null,
    error: null,
  });

  const transcribeVideo = async (videoPath?: string) => {
    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null, progress: 0 }));

      // If no video path provided, open file dialog
      let selectedPath = videoPath;
      if (!selectedPath) {
        const selected = await open({
          multiple: false,
          filters: [
            {
              name: 'Video Files',
              extensions: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'm4v'],
            },
          ],
        });

        if (!selected) {
          setState(prev => ({ ...prev, isProcessing: false }));
          return;
        }

        selectedPath = selected as string;
      }

      console.log('🎬 Starting transcription for:', selectedPath);

      // Update progress
      setState(prev => ({ ...prev, progress: 25 }));

      const options: TranscriptionOptions = {
        video_path: selectedPath,
        language: 'en', // Default to English, can be made configurable
        output_format: 'json',
      };

      // Update progress
      setState(prev => ({ ...prev, progress: 50 }));

      // Call Tauri command
      const transcript = await invoke<TranscriptionResponse>('transcribe_video', { options });

      console.log('✅ Transcription completed:', transcript);

      setState(prev => ({
        ...prev,
        isProcessing: false,
        progress: 100,
        transcript,
        error: null,
      }));

      return transcript;
    } catch (error) {
      console.error('❌ Transcription failed:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error as string,
      }));
      throw error;
    }
  };

  const exportTranscript = async (format: 'srt' | 'vtt' | 'txt' | 'json') => {
    if (!state.transcript) {
      throw new Error('No transcript available to export');
    }

    try {
      // Open save dialog
      const selected = await save({
        defaultPath: `transcript.${format}`,
        filters: [
          {
            name: `${format.toUpperCase()} Files`,
            extensions: [format],
          },
        ],
      });

      if (!selected) {
        return;
      }

      const outputPath = selected as string;

      console.log(`📤 Exporting transcript as ${format} to:`, outputPath);

      await invoke('export_transcript', {
        transcript: state.transcript,
        outputPath,
        format,
      });

      console.log('✅ Transcript exported successfully');
    } catch (error) {
      console.error('❌ Export failed:', error);
      throw error;
    }
  };

  const clearTranscript = () => {
    setState({
      isProcessing: false,
      progress: 0,
      transcript: null,
      error: null,
    });
  };

  return {
    ...state,
    transcribeVideo,
    exportTranscript,
    clearTranscript,
  };
};
```

### 3. Create src/components/TranscriptionPanel.tsx
```typescript
import React, { useState } from 'react';
import { useTranscription } from '../hooks/useTranscription';

interface TranscriptionPanelProps {
  onClose?: () => void;
  initialVideoPath?: string;
}

export const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({ onClose, initialVideoPath }) => {
  const {
    isProcessing,
    progress,
    transcript,
    error,
    transcribeVideo,
    exportTranscript,
    clearTranscript,
  } = useTranscription();

  const [selectedFormat, setSelectedFormat] = useState<'srt' | 'vtt' | 'txt' | 'json'>('srt');

  const handleTranscribe = async () => {
    try {
      await transcribeVideo(initialVideoPath);
    } catch (error) {
      console.error('Transcription failed:', error);
    }
  };

  const handleExport = async () => {
    try {
      await exportTranscript(selectedFormat);
      alert(`Transcript exported as ${selectedFormat.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error}`);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">🎬 AI Video Transcription</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          )}
        </div>

        {/* Transcription Controls */}
        <div className="mb-6">
          <div className="flex gap-4 items-center">
            <button
              onClick={handleTranscribe}
              disabled={isProcessing}
              className={`px-6 py-3 rounded-lg font-semibold ${
                isProcessing
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isProcessing ? '🔄 Processing...' : '🎤 Start Transcription'}
            </button>

            {transcript && (
              <button
                onClick={clearTranscript}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                🗑️ Clear
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">Progress: {progress}%</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="space-y-4">
            {/* Transcript Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">📊 Transcript Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Language:</span> {transcript.language || 'Auto-detected'}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {transcript.duration ? formatTime(transcript.duration) : 'Unknown'}
                </div>
                <div>
                  <span className="font-medium">Segments:</span> {transcript.segments?.length || 0}
                </div>
                <div>
                  <span className="font-medium">Characters:</span> {transcript.text.length}
                </div>
              </div>
            </div>

            {/* Export Controls */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">📤 Export Transcript</h3>
              <div className="flex gap-4 items-center">
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="srt">SRT (SubRip)</option>
                  <option value="vtt">VTT (WebVTT)</option>
                  <option value="txt">TXT (Plain Text)</option>
                  <option value="json">JSON (Raw Data)</option>
                </select>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  💾 Export
                </button>
              </div>
            </div>

            {/* Transcript Text */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">📝 Full Transcript</h3>
              <div className="max-h-96 overflow-y-auto">
                <p className="text-gray-700 whitespace-pre-wrap">{transcript.text}</p>
              </div>
            </div>

            {/* Segments with Timestamps */}
            {transcript.segments && transcript.segments.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">⏰ Timestamped Segments</h3>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {transcript.segments.map((segment, index) => (
                    <div key={segment.id} className="border-l-4 border-blue-500 pl-3 py-2">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-gray-600">
                          Segment {index + 1}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(segment.start)} → {formatTime(segment.end)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{segment.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!transcript && !isProcessing && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">ℹ️ Instructions</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              {initialVideoPath ? (
                <>
                  <li>• Video file is pre-selected for transcription</li>
                  <li>• Click "Start Transcription" to begin AI processing</li>
                </>
              ) : (
                <>
                  <li>• Click "Start Transcription" to select a video file</li>
                </>
              )}
              <li>• The AI will extract audio and transcribe it using OpenAI Whisper</li>
              <li>• Transcription may take a few minutes depending on video length</li>
              <li>• Export in SRT, VTT, TXT, or JSON format</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
```

## Integration Points

### 1. Add to Editor (src/routes/Editor.tsx)
Add import:
```typescript
import { TranscriptionPanel } from '../components/TranscriptionPanel'
```

Add state:
```typescript
const [showTranscriptionPanel, setShowTranscriptionPanel] = useState(false)
```

Add button after Export button:
```typescript
{/* Transcription Button */}
<button
  onClick={() => setShowTranscriptionPanel(true)}
  className="px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-glow hover:scale-105"
>
  🎤 Transcribe
</button>
```

Add panel at the end:
```typescript
{/* Transcription Panel */}
{showTranscriptionPanel && (
  <TranscriptionPanel onClose={() => setShowTranscriptionPanel(false)} />
)}
```

### 2. Add to Media Library (src/components/MediaLibrary.tsx)
Add import:
```typescript
import { TranscriptionPanel } from './TranscriptionPanel'
```

Add state:
```typescript
const [showTranscriptionPanel, setShowTranscriptionPanel] = useState(false)
const [selectedFileForTranscription, setSelectedFileForTranscription] = useState<any>(null)
```

Add handler:
```typescript
const handleTranscribe = (file: any) => {
  setSelectedFileForTranscription(file)
  setShowTranscriptionPanel(true)
}
```

Update MediaListItem props:
```typescript
onTranscribe={handleTranscribe}
```

Add panel at the end:
```typescript
{/* Transcription Panel */}
{showTranscriptionPanel && selectedFileForTranscription && (
  <TranscriptionPanel 
    onClose={() => {
      setShowTranscriptionPanel(false)
      setSelectedFileForTranscription(null)
    }}
    initialVideoPath={selectedFileForTranscription.originalPath}
  />
)}
```

### 3. Update MediaListItem (src/components/MediaListItem.tsx)
Add prop:
```typescript
onTranscribe?: (file: MediaFile) => void
```

Add handler:
```typescript
const handleTranscribe = (e: React.MouseEvent) => {
  e.stopPropagation()
  onTranscribe?.(file)
}
```

Add button in action buttons (only for video files):
```typescript
{file.type === 'video' && (
  <button
    onClick={handleTranscribe}
    className="p-3 text-gray-400 hover:text-purple-400 hover:bg-purple-500/20 rounded-xl transition-all duration-200 hover:scale-110 group/btn"
    title="Transcribe with AI"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  </button>
)}
```

Add transcription button in expanded actions sections as well.

## Testing Instructions

1. **Setup**: Add your OpenAI API key to `.env` file
2. **Import**: Add a video file to the media library
3. **Transcribe**: Click the purple microphone button on any video
4. **Export**: Choose format and save the transcript
5. **Verify**: Check that the exported file contains proper timestamps

## Troubleshooting

- **API Key Error**: Make sure `.env` file exists with `OPENAI_API_KEY=sk-...`
- **FFmpeg Error**: Ensure FFmpeg is installed and accessible
- **Network Error**: Check internet connection and API key validity
- **File Dialog Error**: Make sure Tauri dialog plugin is properly configured

## Features Implemented

- ✅ AI-powered video transcription using OpenAI Whisper
- ✅ Multiple export formats (SRT, VTT, TXT, JSON)
- ✅ Progress tracking and error handling
- ✅ Integration with media library and editor
- ✅ Pre-selected video files from media library
- ✅ Timestamped segments with precise timing
- ✅ Professional UI with proper styling
- ✅ Clean file management and temporary file cleanup
