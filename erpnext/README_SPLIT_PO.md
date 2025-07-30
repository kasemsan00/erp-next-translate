# PO File Splitting Documentation

## Overview

This document describes the splitting of `erpnext_cleaned.po` into smaller manageable chunks.

## Original File

- **File**: `erpnext_cleaned.po`
- **Total Lines**: 27,099 lines
- **Size**: Large PO file containing ERPNext translations

## Splitting Configuration

- **Lines per chunk**: 300 lines
- **Total chunks created**: 91 chunks
- **Output directory**: `chunks/`
- **File naming pattern**: `chunk_XXX_YYYY-ZZZZ.po`

## Chunk Details

- **Chunks 1-90**: 300 lines each (full chunks)
- **Chunk 91**: 99 lines (final chunk with remaining content)

## File Structure

```
chunks/
├── chunk_001_1-300.po
├── chunk_002_301-600.po
├── chunk_003_601-900.po
...
├── chunk_090_26701-27000.po
└── chunk_091_27001-27099.po
```

## Scripts Created

1. **`split_po_file.ps1`** - PowerShell script for splitting PO files
2. **`run_split_po.bat`** - Batch file for easy execution

## Usage

To split a PO file:

```powershell
# Run the PowerShell script directly
powershell -ExecutionPolicy Bypass -File "split_po_file.ps1"

# Or use the batch file
run_split_po.bat
```

## Script Features

- **Configurable chunk size**: Default 300 lines, can be modified
- **UTF-8 encoding**: Preserves Thai characters correctly
- **Line range tracking**: Each filename includes the line range
- **Progress reporting**: Shows creation progress for each chunk
- **Error handling**: Validates input file existence

## Benefits

- **Easier management**: Smaller files are easier to work with
- **Parallel processing**: Multiple chunks can be processed simultaneously
- **Version control**: Smaller files work better with Git
- **Memory efficiency**: Reduces memory usage when processing

## Notes

- All chunks maintain the original PO file format
- Thai translations are preserved correctly
- Each chunk is a valid PO file that can be processed independently
