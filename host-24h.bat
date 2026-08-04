@echo off
title Awaken.ai 24/7 Cloudflare Tunnel Host
echo =================================================================
echo       AWAKEN.AI - CONTINUOUS 24-HOUR PUBLIC HOST LAUNCHER
echo =================================================================
echo.
echo 1. Starting PHP 8.3 Backend (127.0.0.1:8000)...
start Awaken.ai PHP Server cmd /k cd server && C:\Users\yashk\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe -S 127.0.0.1:8000 index.php

timeout /t 2 >nul

echo 2. Launching Continuous Cloudflare Tunnel...
echo Keep this window open or minimized to keep the public link alive.
echo.
C:\Program Files (x86)\cloudflared\cloudflared.exe tunnel --url http://127.0.0.1:8000
pause
