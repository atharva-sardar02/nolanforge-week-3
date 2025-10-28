use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub openai_api_key: String,
    pub openai_model: String,
}

impl Config {
    pub fn from_env() -> Result<Self, String> {
        // Load .env file for development
        dotenv::dotenv().ok();
        
        // Try to get API key from stored file first (production)
        let api_key = match Self::get_stored_api_key() {
            Ok(key) => key,
            Err(_) => {
                // Fall back to environment variable (development)
                env::var("OPENAI_API_KEY")
                    .map_err(|_| "OPENAI_API_KEY not found. Please set it in Settings or add it to your .env file.")?
            }
        };
        
        Ok(Config {
            openai_api_key: api_key,
            openai_model: env::var("OPENAI_MODEL")
                .unwrap_or_else(|_| "whisper-1".to_string()),
        })
    }
    
    fn get_stored_api_key() -> Result<String, String> {
        use std::fs;
        
        let app_data_dir = dirs::data_dir()
            .ok_or("Failed to get app data directory")?
            .join("NolanForge");
        
        let api_key_file = app_data_dir.join("openai_api_key.txt");
        
        if !api_key_file.exists() {
            return Err("No stored API key found".to_string());
        }
        
        let api_key = fs::read_to_string(&api_key_file)
            .map_err(|e| format!("Failed to read API key file: {}", e))?;
        
        Ok(api_key.trim().to_string())
    }
}
