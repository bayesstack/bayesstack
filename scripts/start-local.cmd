@echo off
rem BayesStack Master Startup Script Launcher for Windows CMD
setlocal enabledelayedexpansion

PowerShell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-local.ps1" %*
exit /b %ERRORLEVEL%
