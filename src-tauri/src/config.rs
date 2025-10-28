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
