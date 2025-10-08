#!/usr/bin/env python3
"""
Space Debris Risk Model API Startup Script
Cross-platform startup script for Windows, Mac, and Linux
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def print_status(message, status="info"):
    """Print colored status messages"""
    colors = {
        "info": "🛰️ ",
        "success": "✅ ",
        "error": "❌ ",
        "rocket": "🚀 "
    }
    print(f"{colors.get(status, '')}{message}")

def run_command(command, shell=False):
    """Run a command and return success status"""
    try:
        result = subprocess.run(command, shell=shell, check=True, capture_output=True, text=True)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def main():
    print_status("Starting Space Debris Risk Model API...")
    
    # Get the current directory
    api_dir = Path(__file__).parent
    os.chdir(api_dir)
    
    # Determine the platform
    is_windows = platform.system() == "Windows"
    python_cmd = "python" if is_windows else "python3"
    venv_activate = ".venv\\Scripts\\activate" if is_windows else ".venv/bin/activate"
    pip_cmd = ".venv\\Scripts\\pip" if is_windows else ".venv/bin/pip"
    uvicorn_cmd = ".venv\\Scripts\\uvicorn" if is_windows else ".venv/bin/uvicorn"
    
    # Create virtual environment
    print_status("Setting up Python virtual environment...")
    success, output = run_command([python_cmd, "-m", "venv", ".venv"])
    
    if not success:
        print_status(f"Failed to create virtual environment: {output}", "error")
        sys.exit(1)
    
    # Check if virtual environment was created
    venv_dir = Path(".venv")
    if not venv_dir.exists():
        print_status("Failed to create virtual environment", "error")
        sys.exit(1)
    
    print_status("Virtual environment created successfully", "success")
    
    # Install dependencies
    print_status("Installing Python dependencies...")
    if Path("requirements.txt").exists():
        success, output = run_command([pip_cmd, "install", "-r", "requirements.txt"])
        if success:
            print_status("Dependencies installed successfully", "success")
        else:
            print_status(f"Failed to install dependencies: {output}", "error")
            sys.exit(1)
    else:
        print_status("No requirements.txt found, skipping dependency installation")
    
    # Set environment variables
    os.environ["ENVIRONMENT"] = "development"
    os.environ["DEBUG"] = "true"
    os.environ["PYTHONPATH"] = f"{os.environ.get('PYTHONPATH', '')}:{os.getcwd()}"
    
    # Load .env file if it exists
    env_file = Path(".env")
    if env_file.exists():
        print_status("Loading environment variables from .env file...")
        # Simple .env parser
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    if '=' in line:
                        key, value = line.split('=', 1)
                        os.environ[key.strip()] = value.strip()
    
    # Start the API server
    print_status("Starting FastAPI server...", "rocket")
    print_status("📡 API will be available at: http://localhost:8000")
    print_status("📚 Interactive API docs at: http://localhost:8000/docs")
    print_status("📋 ReDoc documentation at: http://localhost:8000/redoc")
    print("")
    print_status("Press Ctrl+C to stop the server")
    
    # Check if main.py exists
    if not Path("main.py").exists():
        print_status("main.py not found. Please create your FastAPI app in main.py", "error")
        sys.exit(1)
    
    # Start uvicorn
    try:
        if is_windows:
            # On Windows, use --reload-dir to avoid multiprocessing issues
            subprocess.run([uvicorn_cmd, "main:app", "--reload", "--reload-dir", ".", "--port", "8000", "--host", "0.0.0.0"])
        else:
            subprocess.run([uvicorn_cmd, "main:app", "--reload", "--port", "8000", "--host", "0.0.0.0"])
    except KeyboardInterrupt:
        print_status("Server stopped by user")
    except FileNotFoundError:
        # Fallback to using python -m uvicorn
        try:
            if is_windows:
                subprocess.run([".venv\\Scripts\\python", "-m", "uvicorn", "main:app", "--reload", "--reload-dir", ".", "--port", "8000", "--host", "0.0.0.0"])
            else:
                subprocess.run([".venv/bin/python", "-m", "uvicorn", "main:app", "--reload", "--port", "8000", "--host", "0.0.0.0"])
        except KeyboardInterrupt:
            print_status("Server stopped by user")

if __name__ == "__main__":
    main()