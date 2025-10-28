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
