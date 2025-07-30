@echo off
echo XLIFF Split and Merge Tool
echo =========================

if "%1"=="split" goto split
if "%1"=="merge" goto merge
if "%1"=="test" goto test
if "%1"=="help" goto help

echo Usage: run_tool.bat [split^|merge^|test^|help] [options]
echo.
echo Examples:
echo   run_tool.bat split "[frappe.crm] develop_th.xliff" -c 50
echo   run_tool.bat merge xliff_chunks -o merged.xliff
echo   run_tool.bat test
goto end

:split
echo Splitting XLIFF file...
node split_xliff.js split %2 %3 %4 %5 %6 %7 %8 %9
goto end

:merge
echo Merging XLIFF chunks...
node split_xliff.js merge %2 %3 %4 %5 %6 %7 %8 %9
goto end

:test
echo Running test suite...
node test_xliff.js
goto end

:help
echo XLIFF Split and Merge Tool Help
echo ===============================
echo.
echo Commands:
echo   split    Split a single XLIFF file into multiple chunks
echo   merge    Merge multiple XLIFF chunks back into a single file
echo   test     Run the test suite
echo   help     Show this help message
echo.
echo Split Options:
echo   -c, --chunk-size ^<number^>    Number of trans-units per chunk (default: 100)
echo   -o, --output-dir ^<path^>      Output directory for chunks
echo   -s, --size-based              Split by file size instead of trans-unit count
echo   -m, --max-size ^<bytes^>       Maximum size per chunk when using size-based splitting
echo   -v, --verbose                 Enable verbose output
echo   --validate                    Validate XLIFF structure before processing
echo.
echo Merge Options:
echo   -o, --output-file ^<path^>     Output file for merged XLIFF
echo   -p, --pattern ^<glob^>         File pattern to match for merging
echo   -v, --verbose                 Enable verbose output
echo   --validate                    Validate XLIFF structure before processing
echo.
echo Examples:
echo   run_tool.bat split "[frappe.crm] develop_th.xliff" -c 50
echo   run_tool.bat split "[frappe.crm] develop_th.xliff" -s -m 1024000
echo   run_tool.bat merge xliff_chunks -o merged.xliff
echo   run_tool.bat test

:end
echo.
pause 