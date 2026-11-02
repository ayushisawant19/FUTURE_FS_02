@echo off
title Mini CRM Server
cd /d "%~dp0"
set "PATH=C:\Users\USER\AppData\Local\Programs\nodejs;%PATH%"
echo ===================================================
echo   Starting Mini CRM Server...
echo ===================================================
start "" "http://localhost:5000/login"
node server.js
if %errorlevel% neq 0 (
    echo.
    echo Server stopped or encountered an error.
    pause
)
