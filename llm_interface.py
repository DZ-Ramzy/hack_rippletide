"""
LLM Interface Module
Abstracts OpenAI and Grok API calls
"""
import json
from typing import Optional, Dict, Any
from openai import OpenAI
from config import Config

class LLMInterface:
    """Unified interface for LLM providers"""
    
    def __init__(self):
        self.provider = Config.LLM_PROVIDER
        
        if self.provider == 'openai':
            self.client = OpenAI(api_key=Config.OPENAI_API_KEY)
            self.base_url = None
        elif self.provider == 'grok':
            self.client = OpenAI(
                api_key=Config.GROK_API_KEY,
                base_url="https://api.x.ai/v1"
            )
        elif self.provider == 'perplexity':
            self.client = OpenAI(
                api_key=Config.PERPLEXITY_API_KEY,
                base_url="https://api.perplexity.ai"
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")
    
    def generate_answer(self, question: str, system_prompt: Optional[str] = None) -> str:
        """
        Generate an answer to a user question
        
        Args:
            question: User's question
            system_prompt: Optional system prompt override
            
        Returns:
            Generated answer as string
        """
        if system_prompt is None:
            system_prompt = self._get_default_answer_prompt()
        
        try:
            response = self.client.chat.completions.create(
                model=Config.MAIN_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            raise Exception(f"Error generating answer: {str(e)}")
    
    def verify_claims(self, answer: str, search_results: list, question: str) -> Dict[str, Any]:
        """
        Verify claims in an answer against search results
        
        Args:
            answer: The generated answer to verify
            search_results: List of search results
            question: Original question for context
            
        Returns:
            Verification result as structured JSON
        """
        system_prompt = self._get_verifier_prompt()
        
        # Format search results for the verifier
        formatted_sources = self._format_sources(search_results)
        
        user_prompt = f"""
Original Question: {question}

Answer to Verify:
{answer}

Available Sources:
{formatted_sources}

Analyze the answer and return your verification results as valid JSON.
"""
        
        try:
            # Perplexity doesn't support response_format parameter
            if self.provider == 'perplexity':
                response = self.client.chat.completions.create(
                    model=Config.VERIFIER_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.2,
                    max_tokens=2000
                )
            else:
                response = self.client.chat.completions.create(
                    model=Config.VERIFIER_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.2,
                    max_tokens=2000,
                    response_format={"type": "json_object"}
                )
            
            result_text = response.choices[0].message.content.strip()
            return json.loads(result_text)
        except json.JSONDecodeError as e:
            # Fallback if JSON parsing fails
            return self._create_fallback_verification(answer)
        except Exception as e:
            raise Exception(f"Error verifying claims: {str(e)}")
    
    def _get_default_answer_prompt(self) -> str:
        """Get the default system prompt for answer generation"""
        return """You are a knowledgeable AI assistant focused on accuracy and transparency.

Your guidelines:
- Provide clear, concise, and accurate answers
- State assumptions or uncertainties explicitly
- Avoid speculation when information may be outdated
- Use structured responses when appropriate
- Cite time-sensitive information with approximate dates when relevant
- If you're unsure, say so clearly

Remember: Your answer will be fact-checked. Prioritize accuracy over completeness."""
    
    def _get_verifier_prompt(self) -> str:
        """Get the system prompt for the verifier"""
        return """You are a strict fact-checking AI. Your job is to verify claims against provided sources.

CRITICAL RULES:
- You must NOT generate new information
- You ONLY assess whether claims are supported by the given sources
- Never hallucinate or assume sources exist
- When evidence is weak or missing, mark as "uncertain" or "unsupported"

For each factual claim in the answer, determine:
1. Is it directly supported by sources? → "verified"
2. Is it partially supported or unclear? → "uncertain"
3. Does it contradict sources? → "contradicted"
4. Is information potentially outdated (before 2024)? → "outdated"
5. No source addresses this claim? → "unsupported"

You MUST respond with valid JSON in this exact format:
{
  "overall_confidence": 0-100,
  "claims": [
    {
      "text": "specific claim from the answer",
      "status": "verified|uncertain|outdated|unsupported|contradicted",
      "reason": "brief explanation",
      "sources": ["source title or URL if applicable"]
    }
  ]
}

Status definitions:
- verified: Strong evidence from sources
- uncertain: Weak or ambiguous evidence
- outdated: Information from before 2024 or explicitly marked as old
- unsupported: No source addresses this claim
- contradicted: Sources disagree with the claim

Calculate overall_confidence as:
- Start at 100
- Subtract 5 for each "uncertain" claim
- Subtract 15 for each "outdated" claim
- Subtract 20 for each "unsupported" claim
- Subtract 30 for each "contradicted" claim
- Minimum score is 0"""
    
    def _format_sources(self, search_results: list) -> str:
        """Format search results for the verifier prompt"""
        if not search_results:
            return "No sources available."
        
        formatted = []
        for i, result in enumerate(search_results[:Config.MAX_SEARCH_RESULTS], 1):
            title = result.get('title', 'Unknown')
            snippet = result.get('snippet', result.get('body', 'No content'))
            url = result.get('url', result.get('link', 'No URL'))
            
            formatted.append(f"[Source {i}]\nTitle: {title}\nURL: {url}\nContent: {snippet}\n")
        
        return "\n".join(formatted)
    
    def _create_fallback_verification(self, answer: str) -> Dict[str, Any]:
        """Create a fallback verification result when parsing fails"""
        return {
            "overall_confidence": 50,
            "claims": [
                {
                    "text": answer[:200] + "..." if len(answer) > 200 else answer,
                    "status": "uncertain",
                    "reason": "Verification system encountered an error",
                    "sources": []
                }
            ]
        }

