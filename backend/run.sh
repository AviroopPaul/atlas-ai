#!/bin/bash

# RAG Document Chatbot Backend Runner
# This script starts the FastAPI application

echo "Starting My Stuff AI Backend..."
echo "================================"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Creating one..."
    python3 -m venv venv
    echo "Virtual environment created."
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
if [ ! -f "venv/bin/uvicorn" ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
    echo "Dependencies installed."
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "WARNING: .env file not found!"
    echo "Please create a .env file with your configuration."
    echo "See README.md for details."
    exit 1
fi

# Run the application
echo "Starting server on http://0.0.0.0:8000"
echo "API Documentation: http://localhost:8000/docs"
echo "================================"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

