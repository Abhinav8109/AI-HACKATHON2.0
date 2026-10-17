#!/bin/bash
set -e

echo "=========================================================="
echo "TalentPilot AI — Starting Full-Stack Platform"
echo "=========================================================="

export PYTHONPATH="$(pwd)/backend"

if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
    ./.venv/bin/pip install -r backend/requirements.txt
fi

echo "Launching Backend API Server on http://127.0.0.1:8000..."
./.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

echo "Launching Frontend Dev Server on http://localhost:5173..."
cd frontend && npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

wait
