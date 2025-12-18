#!/usr/bin/env python3
"""
Quick configuration checker for TruthLens
Run this to verify your API keys and configuration
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_config():
    print("\n" + "="*50)
    print("TruthLens Configuration Check")
    print("="*50 + "\n")
    
    # Check LLM Provider
    llm_provider = os.getenv('LLM_PROVIDER', 'openai')
    print(f"[OK] LLM Provider: {llm_provider}")
    
    # Check API Keys
    if llm_provider == 'perplexity':
        api_key = os.getenv('PERPLEXITY_API_KEY', '')
        if api_key:
            print(f"[OK] Perplexity API Key: {api_key[:10]}...{api_key[-4:]} (configured)")
        else:
            print("[ERROR] Perplexity API Key: NOT FOUND")
            print("   -> Add PERPLEXITY_API_KEY to your .env file")
            return False
            
    elif llm_provider == 'openai':
        api_key = os.getenv('OPENAI_API_KEY', '')
        if api_key:
            print(f"[OK] OpenAI API Key: {api_key[:10]}...{api_key[-4:]} (configured)")
        else:
            print("[ERROR] OpenAI API Key: NOT FOUND")
            print("   -> Add OPENAI_API_KEY to your .env file")
            return False
            
    elif llm_provider == 'grok':
        api_key = os.getenv('GROK_API_KEY', '')
        if api_key:
            print(f"[OK] Grok API Key: {api_key[:10]}...{api_key[-4:]} (configured)")
        else:
            print("[ERROR] Grok API Key: NOT FOUND")
            print("   -> Add GROK_API_KEY to your .env file")
            return False
    
    # Check Search Provider
    search_provider = os.getenv('SEARCH_PROVIDER', 'duckduckgo')
    print(f"[OK] Search Provider: {search_provider}")
    
    if search_provider == 'serpapi':
        serpapi_key = os.getenv('SERPAPI_KEY', '')
        if serpapi_key:
            print(f"[OK] SerpAPI Key: {serpapi_key[:10]}...{serpapi_key[-4:]} (configured)")
        else:
            print("[WARN] SerpAPI Key: NOT FOUND (using duckduckgo instead)")
    
    print("\n" + "="*50)
    print("Configuration looks good!")
    print("="*50 + "\n")
    
    # Test API connection
    print("Testing API connection...")
    try:
        if llm_provider == 'perplexity':
            from openai import OpenAI
            client = OpenAI(
                api_key=api_key,
                base_url="https://api.perplexity.ai"
            )
            response = client.chat.completions.create(
                model="sonar",
                messages=[{"role": "user", "content": "Hi"}],
                max_tokens=10
            )
            print("[SUCCESS] Perplexity API connection successful!")
            
        elif llm_provider == 'openai':
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": "Hi"}],
                max_tokens=10
            )
            print("[SUCCESS] OpenAI API connection successful!")
            
        print("\nEverything is working! You can start using TruthLens.\n")
        return True
        
    except Exception as e:
        print(f"\n[ERROR] API connection failed: {str(e)}\n")
        print("Possible issues:")
        print("  - API key is invalid")
        print("  - No credits/quota remaining")
        print("  - Network connection problem")
        return False

if __name__ == '__main__':
    try:
        success = check_config()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n[ERROR] {str(e)}\n")
        exit(1)

