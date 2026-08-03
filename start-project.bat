@echo off
title Awaken.ai Launcher
echo ========================================================
echo        AWAKEN.AI - ONE-CLICK LAUNCHER
echo ========================================================
echo.
echo [1/2] Launching PHP Backend Server (Port 8000)...
start "Awaken.ai Backend Server" cmd /c "cd server && php -S 127.0.0.1:8000 index.php"

echo [2/2] Launching Frontend Web App (Port 3000)...
call npm run dev
pause
