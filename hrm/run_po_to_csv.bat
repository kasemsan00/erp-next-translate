@echo off
echo * Running PO to CSV Converter...
echo.

REM * Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ! Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM * Run the converter script
node po_to_csv.js

echo.
echo * Process completed!
pause 