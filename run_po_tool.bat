@echo off
REM PO File Split and Merge Tool - Windows Batch File
REM This batch file provides easy access to the po_split_merge.js tool

echo PO File Split and Merge Utility
echo ================================
echo.

if "%1"=="" (
    echo Usage:
    echo   run_po_tool.bat split ^<input_file^> ^<output_dir^> [chunk_size]
    echo   run_po_tool.bat merge ^<input_dir^> ^<output_file^>
    echo   run_po_tool.bat validate ^<po_file^>
    echo.
    echo Examples:
    echo   run_po_tool.bat split hrm/th.po ./chunks 500
    echo   run_po_tool.bat merge ./chunks merged_th.po
    echo   run_po_tool.bat validate hrm/th.po
    echo.
    pause
    exit /b 1
)

node po_split_merge.js %*

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error occurred. Press any key to exit...
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Operation completed successfully. Press any key to exit...
pause 