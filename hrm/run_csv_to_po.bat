@echo off
echo * Running CSV to PO Updater...
echo.

REM * Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ! Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM * Run the updater script
node csv_to_po_updater.js

echo.
echo * Process completed!
pause 