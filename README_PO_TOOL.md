# Split a PO file into chunks of 500 entries

node po_split_merge.js split hrm/th.po ./chunks 500

# Merge chunks back into a single file

node po_split_merge.js merge ./chunks merged_th.po

# Validate a PO file

node po_split_merge.js validate hrm/th.po

# Windows batch file usage

run_po_tool.bat split hrm/th.po ./chunks 500

# PO File Split and Merge Tool

A JavaScript utility for splitting large PO (Portable Object) files into manageable chunks and merging them back together while preserving the original file structure and pattern.

## Features

- **Split large PO files** into smaller chunks for easier editing
- **Merge chunks back** into a single PO file
- **Preserve original structure** including headers, comments, and translation entries
- **Validate PO files** for structural integrity
- **Cross-platform** - works on Windows, macOS, and Linux
- **Metadata tracking** - keeps track of split information for accurate merging

## Requirements

- Node.js (version 12 or higher)
- No additional dependencies required

## Installation

1. Ensure Node.js is installed on your system
2. Download the `po_split_merge.js` file
3. Make the file executable (Linux/macOS): `chmod +x po_split_merge.js`

## Usage

### Command Line Interface

The tool can be used directly with Node.js:

```bash
node po_split_merge.js <command> [options]
```

### Windows Batch File

On Windows, you can use the provided batch file for easier execution:

```cmd
run_po_tool.bat <command> [options]
```

## Commands

### Split Command

Splits a large PO file into smaller chunks.

```bash
node po_split_merge.js split <input_file> <output_dir> [chunk_size]
```

**Parameters:**

- `input_file`: Path to the input PO file
- `output_dir`: Directory where chunks will be saved
- `chunk_size`: (Optional) Number of entries per chunk (default: 1000)

**Example:**

```bash
node po_split_merge.js split hrm/th.po ./chunks 500
```

### Merge Command

Merges PO file chunks back into a single file.

```bash
node po_split_merge.js merge <input_dir> <output_file>
```

**Parameters:**

- `input_dir`: Directory containing the chunk files
- `output_file`: Path for the merged output file

**Example:**

```bash
node po_split_merge.js merge ./chunks merged_th.po
```

### Validate Command

Validates a PO file for structural integrity.

```bash
node po_split_merge.js validate <po_file>
```

**Parameters:**

- `po_file`: Path to the PO file to validate

**Example:**

```bash
node po_split_merge.js validate hrm/th.po
```

## File Structure

### Split Output

When you split a PO file, the tool creates:

```
output_dir/
├── split_metadata.json    # Metadata about the split operation
├── chunk_001_1-500.po     # First chunk (entries 1-500)
├── chunk_002_501-1000.po  # Second chunk (entries 501-1000)
└── ...
```

### Metadata File

The `split_metadata.json` file contains:

```json
{
  "originalFile": "th.po",
  "totalEntries": 14826,
  "totalChunks": 15,
  "chunkSize": 1000,
  "splitDate": "2025-01-27T10:30:00.000Z",
  "header": "msgid \"\"\nmsgstr \"\"\n..."
}
```

## PO File Structure Preservation

The tool carefully preserves the original PO file structure:

### Header Section

- Project metadata
- Language information
- Plural forms
- Crowdin project details

### Entry Structure

- Comments (starting with `#`)
- Source file references (starting with `#:`)
- Message ID (`msgid`)
- Message string (`msgstr`)
- Proper spacing between entries

### Example Entry Structure

```
#. Label of the action (Select) field in DocType 'Full and Final Asset'
#: hrms/hr/doctype/full_and_final_asset/full_and_final_asset.json
msgid "Action"
msgstr ""
```

## Validation Features

The validation command checks for:

- **Complete entries**: Each entry must have both `msgid` and `msgstr`
- **Proper structure**: Entries must follow the standard PO format
- **Header integrity**: Header section must be properly formatted
- **Common issues**: Empty strings, missing translations, etc.

## Error Handling

The tool provides comprehensive error handling:

- **File not found**: Clear error messages for missing files
- **Invalid structure**: Validation errors for malformed PO files
- **Merge conflicts**: Warnings for potential issues during merging
- **Metadata validation**: Ensures split metadata is present for merging

## Performance Considerations

- **Memory efficient**: Processes files line by line
- **Large file support**: Can handle files with thousands of entries
- **Progress tracking**: Shows progress during split/merge operations
- **Validation speed**: Fast validation of large PO files

## Use Cases

### Translation Workflow

1. Split large PO file into manageable chunks
2. Distribute chunks to different translators
3. Collect translated chunks
4. Merge chunks back into a single file
5. Validate the final merged file

### File Management

- Break down large translation files for easier editing
- Organize translations by modules or sections
- Maintain version control for individual chunks
- Backup and restore translation work

### Quality Assurance

- Validate PO files before deployment
- Check for structural issues
- Ensure all entries are properly formatted
- Verify translation completeness

## Troubleshooting

### Common Issues

**"Metadata file not found"**

- Ensure you're merging from a directory that was created by the split command
- Check that `split_metadata.json` exists in the input directory

**"No chunk files found"**

- Verify that chunk files follow the naming pattern `chunk_XXX_start-end.po`
- Check that files have `.po` extension

**"Incomplete entry" errors**

- Review the PO file structure
- Ensure each entry has both `msgid` and `msgstr`
- Check for proper spacing between entries

### Debug Mode

For detailed debugging, you can modify the script to add more verbose logging:

```javascript
// Add this line at the beginning of functions for debugging
console.log(`* Debug: Processing ${filePath}`);
```

## Contributing

To contribute to this tool:

1. Follow the existing code style
2. Add proper error handling
3. Include validation for new features
4. Update documentation for any changes
5. Test with various PO file formats

## License

This tool is provided as-is for use with ERPNext translation projects.

## Support

For issues or questions:

1. Check the troubleshooting section
2. Validate your PO file structure
3. Review the error messages for specific guidance
4. Ensure you're using the correct command syntax
