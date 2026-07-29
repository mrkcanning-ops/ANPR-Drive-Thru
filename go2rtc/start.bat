@echo off
REM go2rtc startup script for Windows
REM Downloads and runs go2rtc if not already present

setlocal enabledelayedexpansion

cd /d "%~dp0"

echo [go2rtc] Checking for go2rtc.exe...

if not exist "go2rtc.exe" (
    echo [go2rtc] Downloading go2rtc v1.9.1...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/AlexxIT/go2rtc/releases/download/v1.9.1/go2rtc_win64.exe' -OutFile 'go2rtc.exe'"
    if errorlevel 1 (
        echo [ERROR] Failed to download go2rtc
        exit /b 1
    )
    echo [go2rtc] Downloaded successfully
)

echo [go2rtc] Starting go2rtc on port 1984...
echo [go2rtc] Config: go2rtc.yaml
echo [go2rtc] Camera stream: RTSP from Reolink at 192.168.0.92
echo.
echo [go2rtc] Access WebRTC at: http://localhost:1984/
echo [go2rtc] Press Ctrl+C to stop
echo.

go2rtc.exe -c go2rtc.yaml
