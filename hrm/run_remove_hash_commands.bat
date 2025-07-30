@echo off
echo ========================================
echo Remove Hash Commands from PO File
echo ========================================
echo.

cd /d "%~dp0"
node remove_hash_commands.js

echo.
echo ========================================
echo Process completed!
echo ========================================
pause 