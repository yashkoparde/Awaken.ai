@echo off
title Awaken.ai 24-Hour Continuous Cloudflare Host
echo =================================================================
echo       AWAKEN.AI - 24-HOUR CONTINUOUS PUBLIC HOST LAUNCHER
echo =================================================================
echo.
echo [1/4] Starting Local PHP Backend (Port 8000)...
start Awaken.ai PHP Server cmd /k cd server && C:\Users\yashk\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe -S 127.0.0.1:8000 index.php

timeout /t 2 >nul

echo [2/4] Starting Frontend Dev Server (Port 3000)...
start Awaken.ai Frontend App cmd /k npm run dev -- --port 3000 --host

timeout /t 3 >nul

echo [3/4] Launching Public Tunnel for PHP Backend (Port 8000)...
start Cloudflare Tunnel - Backend cmd /k echo Starting Tunnel for PHP Backend... && C:\Program Files (x86)\cloudflared\cloudflared.exe tunnel --url http://127.0.0.1:8000

echo [4/4] Launching Public Tunnel for Frontend Web App (Port 3000)...
echo.
echo Keep all windows open or minimized to keep services running continuously for 24 hours.
echo.
C:\Program Files (x86)\cloudflared\cloudflared.exe tunnel --url http://localhost:3000
pause
