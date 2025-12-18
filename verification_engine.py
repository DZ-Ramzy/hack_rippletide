"""
Verification Engine
Coordinates the verification process
"""
from typing import Dict, Any, List
from llm_interface import LLMInterface
from search_module import SearchModule

class VerificationEngine:
    """Main verification engine that coordinates search and verification"""
    
    def __init__(self):
        self.llm = LLMInterface()
        self.search = SearchModule()
    
    def generate_and_verify(self, question: str) -> Dict[str, Any]:
        """
        Complete pipeline: generate answer and verify it
        
        Args:
            question: User's question
            
        Returns:
            Dictionary containing answer, verification results, and sources
        """
        # Step 1: Generate answer
        answer = self.llm.generate_answer(question)
        
        # Step 2: Search for sources
        search_queries = self.search.generate_search_queries(question, answer)
        all_sources = []
        
        for query in search_queries:
            results = self.search.search(query)
            all_sources.extend(results)
        
        # Deduplicate sources by URL
        unique_sources = self._deduplicate_sources(all_sources)
        
        # Step 3: Verify claims
        verification = self.llm.verify_claims(answer, unique_sources, question)
        
        # Step 4: Compile results
        return {
            'question': question,
            'answer': answer,
            'verification': verification,
            'sources': unique_sources,
            'search_queries': search_queries
        }
    
    def verify_existing_answer(self, question: str, answer: str) -> Dict[str, Any]:
        """
        Verify an existing answer (useful for regeneration)
        
        Args:
            question: Original question
            answer: Existing answer to verify
            
        Returns:
            Dictionary containing verification results and sources
        """
        # Search for sources
        search_queries = self.search.generate_search_queries(question, answer)
        all_sources = []
        
        for query in search_queries:
            results = self.search.search(query)
            all_sources.extend(results)
        
        # Deduplicate sources
        unique_sources = self._deduplicate_sources(all_sources)
        
        # Verify claims
        verification = self.llm.verify_claims(answer, unique_sources, question)
        
        return {
            'question': question,
            'answer': answer,
            'verification': verification,
            'sources': unique_sources,
            'search_queries': search_queries
        }
    
    def _deduplicate_sources(self, sources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate sources based on URL"""
        seen_urls = set()
        unique = []
        
        for source in sources:
            url = source.get('url', '')
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique.append(source)
        
        return unique
    
    def calculate_hallucination_risk(self, verification: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate hallucination risk metrics
        
        Args:
            verification: Verification results from LLM
            
        Returns:
            Dictionary with risk level, color, and message
        """
        confidence = verification.get('overall_confidence', 50)
        claims = verification.get('claims', [])
        
        # Count claim types
        status_counts = {
            'verified': 0,
            'uncertain': 0,
            'outdated': 0,
            'unsupported': 0,
            'contradicted': 0
        }
        
        for claim in claims:
            status = claim.get('status', 'uncertain')
            if status in status_counts:
                status_counts[status] += 1
        
        # Determine risk level
        if confidence >= 80:
            risk_level = 'low'
            risk_color = 'green'
            risk_emoji = '✅'
            risk_message = 'High confidence - Claims are well-supported'
        elif confidence >= 50:
            risk_level = 'medium'
            risk_color = 'yellow'
            risk_emoji = '⚠️'
            risk_message = 'Medium confidence - Some claims need verification'
        else:
            risk_level = 'high'
            risk_color = 'red'
            risk_emoji = '❌'
            risk_message = 'Low confidence - Multiple unsupported claims'
        
        return {
            'confidence': confidence,
            'risk_level': risk_level,
            'risk_color': risk_color,
            'risk_emoji': risk_emoji,
            'risk_message': risk_message,
            'status_counts': status_counts,
            'total_claims': len(claims)
        }

