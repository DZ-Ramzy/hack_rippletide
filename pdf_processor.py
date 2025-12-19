"""
PDF Processor - Extract text and find answer positions
"""
import fitz  # PyMuPDF
from typing import List, Dict, Optional, Tuple
import re
from llm_interface import LLMInterface
from config import Config


class PDFProcessor:
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.doc = fitz.open(pdf_path)
        self.text_content = self._extract_all_text()
        
    def _extract_all_text(self) -> str:
        """Extract all text from the PDF"""
        text = ""
        for page in self.doc:
            text += page.get_text()
        return text
    
    def get_page_count(self) -> int:
        """Get total number of pages"""
        return len(self.doc)
    
    def extract_text_from_page(self, page_num: int) -> str:
        """Extract text from a specific page"""
        if 0 <= page_num < len(self.doc):
            return self.doc[page_num].get_text()
        return ""
    
    def find_text_positions(self, text_to_find: str) -> List[Dict]:
        """
        Find positions of text in the PDF
        Returns list of dictionaries with page number and bounding boxes
        """
        results = []
        
        # Normalize the search text
        search_text = text_to_find.strip()
        
        for page_num in range(len(self.doc)):
            page = self.doc[page_num]
            
            # Search for the text
            text_instances = page.search_for(search_text)
            
            for inst in text_instances:
                results.append({
                    'page': page_num,
                    'bbox': {
                        'x0': inst.x0,
                        'y0': inst.y0,
                        'x1': inst.x1,
                        'y1': inst.y1
                    }
                })
        
        return results
    
    def find_similar_text(self, text: str, threshold: int = 50) -> List[Dict]:
        """
        Find text that is similar (for when exact match doesn't work)
        Returns best matches with their positions
        """
        results = []
        words = text.split()
        
        # Try to find at least a significant portion of the text
        for page_num in range(len(self.doc)):
            page = self.doc[page_num]
            page_text = page.get_text()
            
            # Check if substantial portion of text is on this page
            word_matches = sum(1 for word in words if word.lower() in page_text.lower())
            match_percentage = (word_matches / len(words)) * 100 if words else 0
            
            if match_percentage >= threshold:
                # Try to find the best matching sentence or phrase
                sentences = page_text.split('.')
                best_match = None
                best_score = 0
                
                for sentence in sentences:
                    score = sum(1 for word in words if word.lower() in sentence.lower())
                    if score > best_score:
                        best_score = score
                        best_match = sentence.strip()
                
                if best_match:
                    # Find position of this match
                    positions = page.search_for(best_match[:50])  # Use first 50 chars
                    if positions:
                        results.append({
                            'page': page_num,
                            'text': best_match,
                            'bbox': {
                                'x0': positions[0].x0,
                                'y0': positions[0].y0,
                                'x1': positions[0].x1,
                                'y1': positions[0].y1
                            },
                            'confidence': match_percentage
                        })
        
        return results
    
    def answer_question(self, question: str) -> Dict:
        """
        Answer a question based on PDF content using LLM
        Returns answer with source positions in PDF
        """
        llm = LLMInterface()
        
        # Create prompt with PDF content
        prompt = f"""Based on the following PDF content, answer this question: {question}

PDF Content:
{self.text_content[:4000]}  # Limit context size

Provide a concise answer based only on the information in the PDF. If the answer is not in the PDF, say so clearly.
Also, quote the exact text from the PDF that supports your answer."""
        
        # Get answer from LLM
        answer = llm.generate_answer(prompt)
        
        # Try to find the source text in the PDF
        positions = []
        
        # Extract quoted text or key phrases from the answer
        quotes = re.findall(r'"([^"]+)"', answer)
        if quotes:
            for quote in quotes:
                found_positions = self.find_text_positions(quote)
                if found_positions:
                    positions.extend(found_positions)
                else:
                    # Try fuzzy matching
                    similar = self.find_similar_text(quote, threshold=60)
                    positions.extend(similar)
        
        # If no quotes found, try to find key phrases from answer
        if not positions:
            # Extract sentences from answer
            answer_sentences = [s.strip() for s in answer.split('.') if len(s.strip()) > 20]
            for sentence in answer_sentences[:3]:  # Check first 3 sentences
                similar = self.find_similar_text(sentence, threshold=70)
                if similar:
                    positions.extend(similar)
                    break
        
        return {
            'question': question,
            'answer': answer,
            'source_positions': positions,
            'total_pages': self.get_page_count()
        }
    
    def close(self):
        """Close the PDF document"""
        if self.doc:
            self.doc.close()
    
    def __del__(self):
        """Cleanup"""
        self.close()
