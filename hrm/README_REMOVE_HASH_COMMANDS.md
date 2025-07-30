# Remove Hash Commands from PO File

This script removes all `#` command lines from `.po` files, including:
- `#:` lines (source file references)
- `#.` lines (comments/descriptions)

## Files

- `remove_hash_commands.js` - Main JavaScript script
- `run_remove_hash_commands.bat` - Windows batch file to run the script
- `README_REMOVE_HASH_COMMANDS.md` - This documentation

## Usage

### Method 1: Using the batch file (Windows)
1. Double-click `run_remove_hash_commands.bat`
2. The script will process `th(4).po` and create `th(4)_cleaned.po`

### Method 2: Using Node.js directly
```bash
cd hrm
node remove_hash_commands.js
```

### Method 3: Using as a module
```javascript
const { removeHashCommands } = require('./remove_hash_commands.js');

// Process a specific file
const result = removeHashCommands('input.po', 'output.po');

if (result.success) {
    console.log(`Removed ${result.removedLines} lines`);
}
```

## What it does

The script:
1. Reads the input `.po` file
2. Filters out all lines that start with `#` (hash commands)
3. Preserves empty lines and non-hash lines
4. Creates a new file with `_cleaned` suffix
5. Provides statistics about the operation

## Output

The script will create a new file named `th(4)_cleaned.po` with all hash command lines removed.

## Example

**Before:**
```
#: hrms/hr/doctype/hr_settings/hr_settings.json
msgid " Unlink Payment on Cancellation of Employee Advance"
msgstr " ยกเลิกการเชื่อมโยงการชำระเงินเมื่อยกเลิกเงินล่วงหน้าของพนักงาน"

#. Option for the 'Rounding' (Select) field in DocType 'Leave Type'
#: hrms/hr/doctype/leave_type/leave_type.json
msgid "0.25"
msgstr "0.25"
```

**After:**
```
msgid " Unlink Payment on Cancellation of Employee Advance"
msgstr " ยกเลิกการเชื่อมโยงการชำระเงินเมื่อยกเลิกเงินล่วงหน้าของพนักงาน"

msgid "0.25"
msgstr "0.25"
```

## Requirements

- Node.js installed on your system
- The `th(4).po` file in the same directory as the script 