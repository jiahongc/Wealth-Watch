#!/usr/bin/env python3
import os
import sys
import subprocess

def main():
    # Get port from environment variable
    port = os.environ.get('PORT', '8000')
    
    # Check if uvicorn is available
    try:
        import uvicorn
        print(f"Uvicorn version: {uvicorn.__version__}")
    except ImportError:
        print("Uvicorn not found, installing...")
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'uvicorn[standard]'])
    
    # Start the server
    print(f"Starting server on port {port}")
    os.system(f"python -m uvicorn main:app --host 0.0.0.0 --port {port}")

if __name__ == "__main__":
    main() 