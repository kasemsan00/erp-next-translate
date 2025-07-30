# PO File Translation Tool

This tool automatically translates empty `msgstr` entries in PO files using a dictionary-based approach.

## Files

- `translate_empty_msgstr.js` - Basic translation script
- `translate_empty_msgstr_improved.js` - Improved translation script with better matching logic
- `dictionary.md` - Thai-English translation dictionary
- `th_updated.po` - Source PO file
- `th_updated_translated.po` - Output file from basic script
- `th_updated_translated_improved.po` - Output file from improved script

## Usage

### Basic Translation

```bash
node translate_empty_msgstr.js
```

### Improved Translation (Recommended)

```bash
node translate_empty_msgstr_improved.js
```

### Using Batch Files (Windows)

```bash
run_translate_improved.bat
```

## Features

### Basic Script

- Finds empty `msgstr ""` entries
- Uses dictionary for exact and partial matches
- Translates 91 out of 121 entries

### Improved Script

- **Smart Filtering**: Automatically skips numeric values, time formats, and HTML tags
- **Better Matching**: Uses scoring algorithm for partial matches
- **Quality Control**: Minimum match thresholds to ensure accuracy
- **Detailed Logging**: Separate logs for translations and skipped entries

## Translation Results

### Improved Script Results

- **Total entries processed**: 121
- **Successfully translated**: 8
- **Skipped (appropriate)**: 113
  - Numeric values (0.25, 0.5, 1.0)
  - Time formats (00:00, 01:00, etc.)
  - HTML tags (<hr>)
  - Complex sentences without dictionary matches

### Sample Translations

```
Job profile, qualifications required etc. -> คุณสมบัติ
Mark as In Progress -> กำลังดำเนินการ
Maximum Leave Allocation Allowed per Leave Period -> การจัดสรรวันลา
No of. Positions -> ตำแหน่ง
Please set the Date Of Joining for employee {0} -> วันที่เริ่มงาน
Please set the Holiday List. -> รายการวันหยุด
Please set the relieving date for employee {0} -> วันที่พ้นสภาพ
```

## Output Files

- `translation_log_improved.txt` - List of successful translations
- `skipped_entries.txt` - List of entries that were not translated
- `th_updated_translated_improved.po` - Updated PO file with translations

## Dictionary Format

The dictionary uses markdown table format:

```markdown
| English  | Thai    |
| -------- | ------- |
| Account  | บัญชี   |
| Employee | พนักงาน |
```

## Algorithm Details

### Translation Logic

1. **Exact Match**: Look for exact dictionary matches
2. **Partial Match**: Find best partial matches using scoring
3. **Quality Threshold**: Minimum 30% match for contained terms, 50% for containing terms

### Skip Conditions

- Numeric values (regex: `/^\d+(\.\d+)?$/`)
- Time formats (regex: `/^\d{1,2}:\d{2}$/`)
- HTML tags only (regex: `/^<[^>]+>$/`)
- Very short strings (≤ 2 characters)

## Manual Review Required

After running the script, manually review:

1. **Translation accuracy** - Check if translations make sense in context
2. **Skipped entries** - Review `skipped_entries.txt` for entries that might need manual translation
3. **Context appropriateness** - Ensure translations fit the UI context

## Notes

- The script preserves the original PO file structure
- Only empty `msgstr` entries are processed
- The dictionary contains 633 translation entries
- Complex sentences often require manual translation due to lack of exact dictionary matches
