#!/usr/bin/env python3
import os
import subprocess
import sys

def main():
    # Get port from environment variable
    port = os.environ.get('PORT', '8000')
    
    print(f"Starting WealthFolio API on port {port}")
    print(f"Python version: {sys.version}")
    
    # Start the server directly with uvicorn
    cmd = [
        sys.executable, '-m', 'uvicorn', 
        'main:app', 
        '--host', '0.0.0.0', 
        '--port', port
    ]
    
    print(f"Running command: {' '.join(cmd)}")
    subprocess.run(cmd)

if __name__ == "__main__":
    main() 