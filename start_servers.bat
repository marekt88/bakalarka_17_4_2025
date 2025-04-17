@echo off
echo Starting Voice Assistant Platform...
echo.

echo Step 1: Starting Backend Server...
start cmd /k "cd Bakalarka-code-1 - Copy && python api.py"

echo Step 2: Starting Frontend Server...
start cmd /k "cd Frontend/AI-voice-agent-platform-frontend && npm run dev"

echo.
echo Both servers started successfully!
echo.
echo Backend API is running at: http://localhost:8000
echo Frontend is running at: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul
