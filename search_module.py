"""
Search Module
Handles web search for verification
"""
import json
from typing import List, Dict, Any
from config import Config

class SearchModule:
    """Unified interface for web search"""
    
    def __init__(self):
        self.provider = Config.SEARCH_PROVIDER
        
        if self.provider == 'duckduckgo':
            try:
                from duckduckgo_search import DDGS
                self.ddgs = DDGS()
            except ImportError:
                raise ImportError("duckduckgo-search is not installed. Run: pip install duckduckgo-search")
        elif self.provider == 'serpapi':
            if not Config.SERPAPI_KEY:
                raise ValueError("SERPAPI_KEY is required when using SerpAPI")
            import requests
            self.requests = requests
        else:
            raise ValueError(f"Unsupported search provider: {self.provider}")
    
    def search(self, query: str, max_results: int = None) -> List[Dict[str, Any]]:
        """
        Search the web for information
        
        Args:
            query: Search query
            max_results: Maximum number of results to return
            
        Returns:
            List of search results with title, snippet, and URL
        """
        if max_results is None:
            max_results = Config.MAX_SEARCH_RESULTS
        
        try:
            if self.provider == 'duckduckgo':
                return self._search_duckduckgo(query, max_results)
            elif self.provider == 'serpapi':
                return self._search_serpapi(query, max_results)
        except Exception as e:
            print(f"Search error: {str(e)}")
            return []
    
    def _search_duckduckgo(self, query: str, max_results: int) -> List[Dict[str, Any]]:
        """Search using DuckDuckGo"""
        results = []
        
        try:
            # Use text search
            search_results = self.ddgs.text(query, max_results=max_results)
            
            for result in search_results:
                results.append({
                    'title': result.get('title', ''),
                    'snippet': result.get('body', ''),
                    'url': result.get('href', '')
                })
        except Exception as e:
            print(f"DuckDuckGo search error: {str(e)}")
        
        return results
    
    def _search_serpapi(self, query: str, max_results: int) -> List[Dict[str, Any]]:
        """Search using SerpAPI"""
        results = []
        
        try:
            params = {
                'q': query,
                'api_key': Config.SERPAPI_KEY,
                'num': max_results
            }
            
            response = self.requests.get('https://serpapi.com/search', params=params)
            response.raise_for_status()
            data = response.json()
            
            organic_results = data.get('organic_results', [])
            
            for result in organic_results[:max_results]:
                results.append({
                    'title': result.get('title', ''),
                    'snippet': result.get('snippet', ''),
                    'url': result.get('link', '')
                })
        except Exception as e:
            print(f"SerpAPI search error: {str(e)}")
        
        return results
    
    def generate_search_queries(self, question: str, answer: str) -> List[str]:
        """
        Generate search queries based on the question and answer
        
        Args:
            question: Original user question
            answer: Generated answer
            
        Returns:
            List of search queries
        """
        # For hackathon simplicity, create 2-3 focused queries
        queries = []
        
        # Query 1: Original question
        queries.append(question)
        
        # Query 2: Question + year for recency
        queries.append(f"{question} 2024 2025")
        
        # Query 3: Extract key terms (simple approach)
        # In production, we'd use NLP, but for hackathon this works
        key_terms = question.replace('?', '').replace('how to', '').replace('what is', '').replace('best practices', 'guide')
        if len(key_terms) > 10:
            queries.append(key_terms.strip())
        
        return queries[:2]  # Keep it to 2 queries for speed

