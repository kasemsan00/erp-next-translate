@echo off
echo Splitting erpnext_cleaned.po into chunks of 300 lines each...
powershell -ExecutionPolicy Bypass -File "split_po_file.ps1"
pause 