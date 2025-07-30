# Translation Extraction Tool Summary

## Overview

Created a JavaScript tool to extract translation patterns from XLIFF files where the target has `state="needs-translation"` and output them to CSV format for easy translation work.

## Files Created

### 1. `extract_needs_translation.js`

- **Main JavaScript script** for extracting translation patterns
- **Features:**
  - Extracts source text and target with `state="needs-translation"`
  - Processes all XLIFF files recursively in current directory
  - Decodes HTML entities (`&lt;`, `&gt;`, `&amp;`, etc.)
  - Generates CSV output with proper escaping
  - Handles command line arguments for specific file processing
  - Robust error handling and logging

### 2. `extract_translations.bat`

- **Windows batch file** for easy execution
- Simply double-click to run the extraction on all XLIFF files

### 3. `README_EXTRACTION.md`

- **Comprehensive documentation** explaining how to use the tool
- Includes usage examples, output format, and requirements

## Usage Examples

### Process all XLIFF files:

```bash
node extract_needs_translation.js
# or
extract_translations.bat
```

### Process specific file:

```bash
node extract_needs_translation.js "path/to/file.xliff"
```

## Output Format

The tool generates `needs_translation.csv` with columns:

- **Source**: Original English text
- **Target**: Current target text (usually same as source for needs-translation)
- **File**: Source XLIFF file name

## Test Results

Successfully tested the tool:

- **Total files processed**: 184 XLIFF files
- **Total translations extracted**: 11,424 entries
- **Files included**:
  - `merged_output.xliff` (3,557 entries)
  - `[frappe.erpnext] develop_th.xliff` (3,557 entries)
  - `[frappe.crm] develop_th.xliff` (640 entries)
  - `[frappe.drive] develop_th.xliff` (113 entries)
  - 180 chunk files with various entry counts

## Key Features

1. **Pattern Recognition**: Correctly identifies `<source>` and `<target state="needs-translation">` patterns
2. **HTML Entity Decoding**: Converts `&lt;` to `<`, `&gt;` to `>`, etc.
3. **CSV Escaping**: Properly handles commas, quotes, and newlines in CSV output
4. **Recursive Processing**: Finds all `.xliff` files in subdirectories
5. **Error Handling**: Continues processing even if individual files fail
6. **Progress Reporting**: Shows count of entries found in each file

## Performance

- **Processing Speed**: Fast processing of large XLIFF files
- **Memory Efficient**: Processes files one at a time
- **Scalable**: Can handle hundreds of files and thousands of entries

## Next Steps

The generated CSV file can now be used for:

1. **Translation Work**: Translators can work with the CSV format
2. **Review**: Review which texts need translation
3. **Import**: Import translations back into XLIFF format (would need additional tool)
4. **Analysis**: Analyze translation coverage and progress
