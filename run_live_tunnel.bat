@echo off
title Mini CRM Live Server & Cloudflare Host
cd /d "%~dp0"
set "PATH=C:\Users\USER\AppData\Local\Programs\nodejs;C:\Users\USER\AppData\Local\Programs;%PATH%"

echo ========================================================
echo   Starting Mini CRM Server and Cloudflare Tunnel...
echo ========================================================

start "Mini CRM Backend" /min node server.js
timeout /t 2 /nobreak >nul

echo Starting Public Tunnel...
start "Cloudflare Tunnel" cloudflared.exe tunnel --url http://localhost:5000

echo.
echo Server is running locally on http://localhost:5000
echo Check the Cloudflare Tunnel window for your active live public HTTPS link.
pause
