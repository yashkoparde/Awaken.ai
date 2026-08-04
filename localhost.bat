@echo off
title Awaken.ai Localhost Runner
echo ========================================================
echo        AWAKEN.AI - LOCALHOST LAUNCHER
echo ========================================================
echo.
echo [1/2] Starting PHP Backend Server (http://127.0.0.1:8000)...
start Awaken.ai PHP Server cmd /k cd server && C:\Users\yashk\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe -S 127.0.0.1:8000 index.php

timeout /t 2 >nul

echo [2/2] Starting Frontend Web App (http://localhost:3000)...
echo.
echo ========================================================
echo  App:        http://localhost:3000
echo  Database:   http://127.0.0.1:8000/admin
echo ========================================================
echo.
call npm run dev -- --port 3000
pause
