"""
TruthLens - FastAPI Backend
RESTful API for AI Hallucination Detection
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from verification_engine import VerificationEngine
from config import Config
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="TruthLens API",
    description="AI Hallucination Detection API",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Vite/Next.js dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global verification engine instance
engine: Optional[VerificationEngine] = None


# Request/Response Models
class VerifyRequest(BaseModel):
    question: str


class VerifyExistingRequest(BaseModel):
    question: str
    answer: str


class VerificationResponse(BaseModel):
    question: str
    answer: str
    verification: Dict[str, Any]
    sources: List[Dict[str, Any]]
    search_queries: List[str]
    risk_data: Dict[str, Any]


class HealthResponse(BaseModel):
    status: str
    config: Dict[str, str]


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None


# Startup/Shutdown Events
@app.on_event("startup")
async def startup_event():
    """Initialize the verification engine on startup"""
    global engine
    try:
        logger.info("Initializing TruthLens Verification Engine...")
        engine = VerificationEngine()
        logger.info("✅ Verification Engine initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize Verification Engine: {str(e)}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down TruthLens API...")


# API Endpoints
@app.get("/", tags=["Health"])
async def root():
    """Root endpoint"""
    return {
        "name": "TruthLens API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint with configuration info"""
    return {
        "status": "healthy" if engine else "not_initialized",
        "config": {
            "llm_provider": Config.LLM_PROVIDER,
            "main_model": Config.MAIN_MODEL,
            "verifier_model": Config.VERIFIER_MODEL,
            "search_provider": Config.SEARCH_PROVIDER
        }
    }


@app.post("/api/verify", response_model=VerificationResponse, tags=["Verification"])
async def verify_question(request: VerifyRequest):
    """
    Generate an answer and verify it against web sources
    
    - **question**: The user's question to answer and verify
    """
    if not engine:
        raise HTTPException(
            status_code=503,
            detail="Verification engine not initialized"
        )
    
    try:
        logger.info(f"Processing question: {request.question}")
        
        # Generate and verify answer
        results = engine.generate_and_verify(request.question)
        
        # Calculate risk data
        risk_data = engine.calculate_hallucination_risk(results['verification'])
        
        return {
            "question": results['question'],
            "answer": results['answer'],
            "verification": results['verification'],
            "sources": results['sources'],
            "search_queries": results.get('search_queries', []),
            "risk_data": risk_data
        }
        
    except Exception as e:
        logger.error(f"Error during verification: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Verification failed: {str(e)}"
        )


@app.post("/api/verify-existing", response_model=VerificationResponse, tags=["Verification"])
async def verify_existing_answer(request: VerifyExistingRequest):
    """
    Verify an existing answer against web sources
    
    - **question**: The original question
    - **answer**: The answer to verify
    """
    if not engine:
        raise HTTPException(
            status_code=503,
            detail="Verification engine not initialized"
        )
    
    try:
        logger.info(f"Verifying existing answer for: {request.question}")
        
        # Verify existing answer
        results = engine.verify_existing_answer(request.question, request.answer)
        
        # Calculate risk data
        risk_data = engine.calculate_hallucination_risk(results['verification'])
        
        return {
            "question": results['question'],
            "answer": results['answer'],
            "verification": results['verification'],
            "sources": results['sources'],
            "search_queries": results.get('search_queries', []),
            "risk_data": risk_data
        }
        
    except Exception as e:
        logger.error(f"Error during verification: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Verification failed: {str(e)}"
        )


@app.get("/api/config", tags=["Configuration"])
async def get_config():
    """Get current configuration"""
    return {
        "llm_provider": Config.LLM_PROVIDER,
        "main_model": Config.MAIN_MODEL,
        "verifier_model": Config.VERIFIER_MODEL,
        "search_provider": Config.SEARCH_PROVIDER,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

