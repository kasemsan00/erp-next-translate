# XLIFF Split and Merge Tool - Usage Guide

## Quick Start

### Installation

```bash
npm install
```

### Basic Usage

#### Split a large XLIFF file into smaller chunks:

```bash
# Using Node.js directly
node split_xliff.js split "[frappe.crm] develop_th.xliff" -c 50

# Using the batch file (Windows)
.\run_tool.bat split "[frappe.crm] develop_th.xliff" -c 50
```

#### Merge translated chunks back into a single file:

```bash
# Using Node.js directly
node split_xliff.js merge xliff_chunks -o merged_output.xliff

# Using the batch file (Windows)
.\run_tool.bat merge xliff_chunks -o merged_output.xliff
```

## Practical Examples

### Example 1: Split for Translation Workflow

1. **Split a large XLIFF file into manageable chunks:**

   ```bash
   node split_xliff.js split "[frappe.erpnext] develop_th.xliff" -c 100 -o translation_chunks
   ```

   This creates chunks with 100 translation units each, making them easier to translate.

2. **Translate the chunks** (using your preferred translation tool or service)

3. **Merge the translated chunks back:**
   ```bash
   node split_xliff.js merge translation_chunks -o translated_output.xliff
   ```

### Example 2: Size-based Splitting

For very large files, you might want to split by file size instead:

```bash
node split_xliff.js split "[frappe.erpnext] develop_th.xliff" -s -m 500000 -o size_chunks
```

This creates chunks of approximately 500KB each.

### Example 3: Validation and Verbose Output

```bash
node split_xliff.js split "[frappe.crm] develop_th.xliff" -c 50 --validate -v
```

This will:

- Split into chunks of 50 trans-units each
- Validate the XLIFF structure before processing
- Show detailed progress information

### Example 4: Custom Output Patterns

```bash
# Split with custom output directory
node split_xliff.js split "[frappe.crm] develop_th.xliff" -c 50 -o ./my_translation_work

# Merge with custom output file
node split_xliff.js merge ./my_translation_work -o final_translated.xliff
```

## File Structure After Splitting

When you split an XLIFF file, you'll get:

```
xliff_chunks/
├── manifest.json                    # Metadata about the split operation
├── [frappe.crm] develop_th_chunk_001.xliff
├── [frappe.crm] develop_th_chunk_002.xliff
├── [frappe.crm] develop_th_chunk_003.xliff
└── ...
```

### Manifest File Contents

The `manifest.json` file contains important metadata:

```json
{
  "originalFile": "[frappe.crm] develop_th.xliff",
  "totalChunks": 99,
  "chunkSize": 50,
  "sizeBased": false,
  "created": "2024-01-15T10:30:00.000Z",
  "chunks": [
    {
      "path": "xliff_chunks\\[frappe.crm] develop_th_chunk_001.xliff",
      "transUnitCount": 50,
      "size": 45678
    }
  ]
}
```

## Translation Workflow

### Step 1: Split the File

```bash
node split_xliff.js split "[frappe.crm] develop_th.xliff" -c 50 -o translation_work
```

### Step 2: Translate Each Chunk

You can now:

- Send individual chunks to translators
- Use translation services that have file size limits
- Work on chunks in parallel
- Use different translation tools for different chunks

### Step 3: Merge Back

```bash
node split_xliff.js merge translation_work -o final_translated.xliff
```

## Advanced Features

### Validation

Always validate your XLIFF files before processing:

```bash
node split_xliff.js split input.xliff --validate
```

### Verbose Output

Get detailed information about the process:

```bash
node split_xliff.js split input.xliff -v
```

### Size-based Splitting

For very large files, split by size instead of trans-unit count:

```bash
node split_xliff.js split input.xliff -s -m 1024000  # 1MB chunks
```

### Custom File Patterns

When merging, you can specify which files to include:

```bash
node split_xliff.js merge chunks_dir --pattern "*_translated_*.xliff"
```

## Troubleshooting

### Common Issues

1. **"Input file does not exist"**

   - Check the file path
   - Ensure the file exists in the current directory

2. **"XML parsing failed"**

   - Verify the file is valid XML/XLIFF
   - Check for file corruption

3. **"No file elements found in XLIFF"**

   - Ensure the file is a valid XLIFF file
   - Check if the file contains translation units

4. **PowerShell console issues**
   - Use the batch file: `.\run_tool.bat`
   - Or run directly with Node.js

### Performance Tips

- For very large files (>100MB), use size-based splitting
- Use smaller chunk sizes (25-50) for easier translation
- Use larger chunk sizes (100-200) for faster processing
- Enable verbose mode to monitor progress

### Best Practices

1. **Always validate** your XLIFF files before processing
2. **Keep the manifest file** - it contains important metadata
3. **Use descriptive output directories** for different projects
4. **Test the merge process** with a small subset first
5. **Backup original files** before processing

## Command Reference

### Split Command

```bash
node split_xliff.js split <input_file> [options]
```

**Options:**

- `-c, --chunk-size <number>` - Number of trans-units per chunk (default: 100)
- `-o, --output-dir <path>` - Output directory for chunks (default: ./xliff_chunks)
- `-s, --size-based` - Split by file size instead of trans-unit count
- `-m, --max-size <bytes>` - Maximum size per chunk when using size-based splitting
- `-v, --verbose` - Enable verbose output
- `--validate` - Validate XLIFF structure before processing

### Merge Command

```bash
node split_xliff.js merge <input_dir> [options]
```

**Options:**

- `-o, --output-file <path>` - Output file for merged XLIFF (default: ./merged_output.xliff)
- `-p, --pattern <glob>` - File pattern to match for merging (default: \*.xliff)
- `-v, --verbose` - Enable verbose output
- `--validate` - Validate XLIFF structure before processing

### Help

```bash
node split_xliff.js --help
```

## Testing

Run the test suite to verify everything works:

```bash
# Using Node.js
node test_xliff.js

# Using the batch file
.\run_tool.bat test
```

The test suite will:

1. Create a sample XLIFF file
2. Split it into chunks
3. Merge the chunks back
4. Validate the result
5. Test size-based splitting
6. Clean up test files

All tests should pass if the tool is working correctly.
