@echo off
echo Splitting erpnext_cleaned.po into chunks of 500 lines each...
powershell -ExecutionPolicy Bypass -File "split_po_file.ps1"
pause 