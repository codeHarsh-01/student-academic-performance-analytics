@echo off
setlocal

echo ==========================================================================
echo   NIET GREATER NOIDA - Share Analytics Dashboard Online
echo   Student Academic Performance Analytics System (Group G-2)
echo ==========================================================================

cd /d "%~dp0"

if not exist "..\cloudflared.exe" (
    echo [ERROR] cloudflared.exe not found in parent scratch folder!
    pause
    exit /b 1
)

echo Starting secure public tunnel to http://localhost:8080 ...
echo Share the generated https://*.trycloudflare.com link with your faculty or friends!
echo.

"..\cloudflared.exe" tunnel --url http://localhost:8080

pause
