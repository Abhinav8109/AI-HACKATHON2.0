# TalentPilot AI — Windows Local Development Launcher
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "TalentPilot AI — Starting Full-Stack Platform" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Set environment
$env:PYTHONPATH = "$PSScriptRoot\backend"

# Ensure venv exists
if (-not (Test-Path "$PSScriptRoot\.venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
    .\.venv\Scripts\pip install -r backend\requirements.txt
}

Write-Host "Launching Backend API Server on http://127.0.0.1:8000..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "`$env:PYTHONPATH='$PSScriptRoot\backend'; & '$PSScriptRoot\.venv\Scripts\uvicorn.exe' app.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "Launching Frontend Dev Server on http://localhost:5173..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\frontend'; npm run dev"

Write-Host "`nAll services launched!" -ForegroundColor Cyan
Write-Host "Recruiter Workspace: http://localhost:5173/login" -ForegroundColor Yellow
Write-Host "Public Website:      http://localhost:5173" -ForegroundColor Yellow
Write-Host "Demo Candidate:      http://localhost:5173/interview/live_demo_priya_sharma_token" -ForegroundColor Yellow
Write-Host "Backend API Docs:    http://127.0.0.1:8000/docs" -ForegroundColor Yellow
