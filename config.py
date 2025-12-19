"""
Configuration module for TruthLens
Handles environment variables and settings
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Application configuration"""
    
    # LLM Provider: 'openai', 'grok', or 'perplexity'
    LLM_PROVIDER = os.getenv('LLM_PROVIDER', 'openai')
    
    # API Keys
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    GROK_API_KEY = os.getenv('GROK_API_KEY', '')
    PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY', '')
    
    # Search Provider: 'duckduckgo' or 'serpapi'
    SEARCH_PROVIDER = os.getenv('SEARCH_PROVIDER', 'duckduckgo')
    SERPAPI_KEY = os.getenv('SERPAPI_KEY', '')
    
    # Model settings
    if LLM_PROVIDER == 'openai':
        MAIN_MODEL = 'gpt-4o'
        VERIFIER_MODEL = 'gpt-4o-mini'
    elif LLM_PROVIDER == 'perplexity':
        MAIN_MODEL = 'sonar-pro'  # Previously: llama-3.1-sonar-large-128k-online
        VERIFIER_MODEL = 'sonar'  # Previously: llama-3.1-sonar-small-128k-online
    else:  # grok
        MAIN_MODEL = 'grok-beta'
        VERIFIER_MODEL = 'grok-beta'
    
    # Verification settings
    MAX_SEARCH_RESULTS = 3  # Reduced from 5 for faster response
    CONFIDENCE_THRESHOLD_HIGH = 80
    CONFIDENCE_THRESHOLD_LOW = 50
    
    @classmethod
    def validate(cls):
        """Validate configuration"""
        if cls.LLM_PROVIDER == 'openai' and not cls.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is required when using OpenAI provider")
        if cls.LLM_PROVIDER == 'grok' and not cls.GROK_API_KEY:
            raise ValueError("GROK_API_KEY is required when using Grok provider")
        if cls.LLM_PROVIDER == 'perplexity' and not cls.PERPLEXITY_API_KEY:
            raise ValueError("PERPLEXITY_API_KEY is required when using Perplexity provider")
        return True

# Validate config on import
try:
    Config.validate()
except ValueError as e:
    print(f"⚠️  Configuration warning: {e}")

