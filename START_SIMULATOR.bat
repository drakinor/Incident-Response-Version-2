@echo off
REM Incident Response Tabletop Simulator - Double-Click Launcher
REM This launches the PowerShell script with proper execution policy

PowerShell -NoProfile -ExecutionPolicy Bypass -File "%~dp0launch-simulator.ps1"
pause
