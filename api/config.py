import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Environment settings
    environment: str = "development"
    debug: bool = True
    log_level: str = "debug"
    
    # API settings - AWS compatible
    api_host: str = "0.0.0.0"  # Changed: AWS containers need 0.0.0.0
    api_port: int = int(os.getenv("PORT", 8000))  # Changed: AWS sets PORT env var
    
    # CORS settings - will add AWS URLs later
    cors_origins: str = "http://localhost:3000,http://localhost:3001,http://localhost:3002"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert comma-separated string to list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Create global settings instance
settings = Settings()