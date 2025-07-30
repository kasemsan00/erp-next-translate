# Extract Empty Translations from .po File

This script extracts all `msgid` entries that have empty `msgstr` translations (i.e., `msgstr ""`) from a .po file and outputs them as a CSV table.

## Files Created

- `extract_empty_translations.js` - Main JavaScript script
- `run_extract_empty.bat` - Windows batch file to run the script
- `empty_translations.csv` - Output CSV file with empty translations
- `empty_translations_summary.txt` - Summary report

## Usage

### Method 1: Using the batch file (Windows)

```bash
run_extract_empty.bat
```

### Method 2: Using Node.js directly

```bash
node extract_empty_translations.js
```

## Output Format

The script generates a CSV file with the following columns:

| Column         | Description                                                           |
| -------------- | --------------------------------------------------------------------- |
| Line Number    | The line number in the .po file where the empty translation was found |
| Context        | The context information (file path and line number from comments)     |
| Message ID     | The original text that needs translation                              |
| Message String | The translation (empty for these entries)                             |

## Example Output

```csv
Line Number,Context,Message ID,Message String
55,"hrms/hr/doctype/leave_type/leave_type.json","0.25",""
60,"hrms/hr/doctype/leave_type/leave_type.json","0.5",""
66,"hrms/hr/doctype/daily_work_summary_group/daily_work_summary_group.json","00:00",""
```

## Features

- ✅ Extracts all empty translations (`msgstr ""`)
- ✅ Includes line numbers for easy reference
- ✅ Captures context information from comments
- ✅ Generates both CSV and summary report
- ✅ Handles multi-line msgid entries properly
- ✅ Skips header entries automatically
- ✅ Proper CSV escaping for quotes and commas

## Requirements

- Node.js installed on your system
- The `th_updated.po` file in the same directory

## Notes

- The script automatically skips the header section of the .po file
- Empty translations are identified by the pattern `msgstr ""`
- Context information is extracted from comments starting with `#:`
- The output files are created in the same directory as the script
