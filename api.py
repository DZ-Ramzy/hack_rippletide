"""
TruthLens - FastAPI Backend
RESTful API for AI Hallucination Detection
"""
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from verification_engine import VerificationEngine
from pdf_processor import PDFProcessor
from config import Config
import logging
import os
import shutil
from pathlib import Path

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

# PDF storage directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Store active PDF processors
pdf_processors: Dict[str, PDFProcessor] = {}


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


class PdfQuestionRequest(BaseModel):
    filename: str
    question: str


class PdfAnswerResponse(BaseModel):
    question: str
    answer: str
    source_positions: List[Dict[str, Any]]
    total_pages: int
    filename: str


# Startup/Shutdown Events
@app.on_event("startup")
async def startup_event():
    """Initialize the verification engine on startup"""
    global engine
    try:
        logger.info("Initializing TruthLens Verification Engine...")
        engine = VerificationEngine()
        logger.info("✅ Verification Engine initialized successfully")
        
        # Reload existing PDFs
        if UPLOAD_DIR.exists():
            for pdf_file in UPLOAD_DIR.glob("*.pdf"):
                try:
                    processor = PDFProcessor(str(pdf_file))
                    pdf_processors[pdf_file.name] = processor
                    logger.info(f"✅ Reloaded PDF: {pdf_file.name}")
                except Exception as e:
                    logger.warning(f"⚠️ Could not reload {pdf_file.name}: {e}")
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
        logger.info(f"Step 1/4: Processing question: {request.question}")
        
        # Generate and verify answer
        logger.info("Step 2/4: Generating answer and verifying...")
        results = engine.generate_and_verify(request.question)
        
        logger.info("Step 3/4: Calculating risk data...")
        # Calculate risk data
        risk_data = engine.calculate_hallucination_risk(results['verification'])
        
        logger.info("Step 4/4: Compilation complete!")
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
@app.post("/api/upload-pdf", tags=["PDF"])
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF file for processing
    
    - **file**: PDF file to upload
    """
    try:
        # Check if it's a PDF
        if not file.filename.endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are accepted"
            )
        
        # Save the uploaded file
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Create PDF processor
        processor = PDFProcessor(str(file_path))
        pdf_processors[file.filename] = processor
        
        logger.info(f"✅ PDF uploaded successfully: {file.filename}")
        
        return {
            "filename": file.filename,
            "status": "success",
            "total_pages": processor.get_page_count(),
            "message": "PDF uploaded and processed successfully"
        }
        
    except Exception as e:
        logger.error(f"Error uploading PDF: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload PDF: {str(e)}"
        )


@app.post("/api/ask-pdf", response_model=PdfAnswerResponse, tags=["PDF"])
async def ask_pdf_question(request: PdfQuestionRequest):
    """
    Ask a question about an uploaded PDF
    
    - **filename**: Name of the uploaded PDF file
    - **question**: Question to ask about the PDF
    """
    try:
        # Check if PDF exists in memory
        if request.filename not in pdf_processors:
            # Try to load it from disk if it exists
            file_path = UPLOAD_DIR / request.filename
            if file_path.exists():
                logger.info(f"📂 Loading PDF from disk: {request.filename}")
                processor = PDFProcessor(str(file_path))
                pdf_processors[request.filename] = processor
            else:
                raise HTTPException(
                    status_code=404,
                    detail=f"PDF file '{request.filename}' not found. Please upload it first."
                )
        
        processor = pdf_processors[request.filename]
        
        # Get answer from PDF
        result = processor.answer_question(request.question)
        
        logger.info(f"✅ Question answered for {request.filename}")
        
        return {
            "question": result['question'],
            "answer": result['answer'],
            "source_positions": result['source_positions'],
            "total_pages": result['total_pages'],
            "filename": request.filename
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error answering PDF question: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to answer question: {str(e)}"
        )


@app.get("/api/pdf/{filename}", tags=["PDF"])
async def get_pdf(filename: str):
    """
    Get the PDF file for viewing
    
    - **filename**: Name of the PDF file
    """
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"PDF file '{filename}' not found"
        )
    
    return FileResponse(
        path=str(file_path),
        media_type="application/pdf",
        filename=filename
    )


@app.delete("/api/pdf/{filename}", tags=["PDF"])
async def delete_pdf(filename: str):
    """
    Delete an uploaded PDF
    
    - **filename**: Name of the PDF file to delete
    """
    try:
        # Remove from processors
        if filename in pdf_processors:
            pdf_processors[filename].close()
            del pdf_processors[filename]
        
        # Delete file
        file_path = UPLOAD_DIR / filename
        if file_path.exists():
            os.remove(file_path)
        
        logger.info(f"✅ PDF deleted: {filename}")
        
        return {"status": "success", "message": f"PDF '{filename}' deleted"}
        
    except Exception as e:
        logger.error(f"Error deleting PDF: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete PDF: {str(e)}"
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

