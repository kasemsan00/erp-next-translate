@echo off
echo ========================================
echo   Extract Empty Translations from .po
echo ========================================
echo.

cd /d "%~dp0"
node extract_empty_translations.js

echo.
echo ========================================
echo   Process completed!
echo ========================================
pause 