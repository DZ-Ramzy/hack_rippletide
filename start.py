"""
TruthLens Launcher
Start both backend API and frontend dev server
"""
import subprocess
import sys
import time
import os
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    print("[CHECK] Checking dependencies...")
    
    # Check Python packages
    try:
        import fastapi
        import uvicorn
        print("[OK] Backend dependencies found")
    except ImportError:
        print("[INSTALL] Backend dependencies missing. Installing...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements-api.txt"])
    
    # Check if frontend/node_modules exists
    frontend_dir = Path("frontend")
    if not (frontend_dir / "node_modules").exists():
        print("[INSTALL] Frontend dependencies missing. Installing...")
        subprocess.run(["npm", "install"], cwd=frontend_dir, shell=True)
    else:
        print("[OK] Frontend dependencies found")

def start_backend():
    """Start FastAPI backend server"""
    print("\n[START] Starting backend API on http://localhost:8000...")
    return subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "api:app", "--reload", "--port", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )

def start_frontend():
    """Start Next.js frontend dev server"""
    print("[START] Starting frontend on http://localhost:3000...")
    return subprocess.Popen(
        ["npm", "run", "dev"],
        cwd="frontend",
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )

def main():
    """Main launcher"""
    print("""
==================================================
        TruthLens Launcher
   AI Hallucination Detection Tool
==================================================
    """)
    
    # Check dependencies
    check_dependencies()
    
    print("\n" + "="*50)
    print("Starting TruthLens...")
    print("="*50 + "\n")
    
    # Start backend
    backend_process = start_backend()
    time.sleep(3)  # Give backend time to start
    
    # Start frontend
    frontend_process = start_frontend()
    
    print("\n" + "="*50)
    print("[SUCCESS] TruthLens is running!")
    print("="*50)
    print("\n[INFO] Backend API:  http://localhost:8000")
    print("[INFO] Frontend App: http://localhost:3000")
    print("[INFO] API Docs:     http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop both servers\n")
    
    try:
        # Keep both processes running
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\n\n[STOP] Stopping TruthLens...")
        backend_process.terminate()
        frontend_process.terminate()
        print("[SUCCESS] Shutdown complete")

if __name__ == "__main__":
    main()

