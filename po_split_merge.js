#!/usr/bin/env node

/**
 * PO File Split and Merge Utility
 * 
 * This script can split a large PO file into smaller chunks and merge them back together
 * while preserving the original PO file structure and pattern.
 * 
 * Usage:
 *   node po_split_merge.js split <input_file> <output_dir> [chunk_size]
 *   node po_split_merge.js merge <input_dir> <output_file>
 *   node po_split_merge.js validate <po_file>
 */

const fs = require('fs');
const path = require('path');

// * Configuration variables
const DEFAULT_CHUNK_SIZE = 1000; // * Default number of entries per chunk
const HEADER_END_MARKERS = ['msgid ""', 'msgstr ""']; // * Markers that indicate end of header

/**
 * * Parses a PO file and returns its structure
 * @param {string} filePath - Path to the PO file
 * @returns {Object} Parsed PO file structure
 */
function parsePOFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let header = [];
    let entries = [];
    let currentEntry = [];
    let inHeader = true;
    let headerEnded = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (inHeader) {
            header.push(line);
            
            // * Check if header has ended (empty msgid followed by empty msgstr)
            if (line === 'msgid ""' && i + 1 < lines.length && lines[i + 1] === 'msgstr ""') {
                headerEnded = true;
                inHeader = false;
                i++; // * Skip the msgstr line as it's already added
                continue;
            }
            // * Alternative: check for empty line after header content
            else if (line === 'msgid ""' && i + 1 < lines.length && lines[i + 1].trim() === '') {
                headerEnded = true;
                inHeader = false;
                i++; // * Skip the empty line
                continue;
            }
        } else {
            // * Check for new entry start
            if (line.startsWith('#') || line.startsWith('msgid ')) {
                if (currentEntry.length > 0) {
                    entries.push(currentEntry.join('\n'));
                    currentEntry = [];
                }
            }
            currentEntry.push(line);
        }
    }
    
    // * Add the last entry
    if (currentEntry.length > 0) {
        entries.push(currentEntry.join('\n'));
    }
    
    return {
        header: header.join('\n'),
        entries: entries
    };
}

/**
 * * Splits a PO file into multiple chunks
 * @param {string} inputFile - Path to input PO file
 * @param {string} outputDir - Directory to save chunks
 * @param {number} chunkSize - Number of entries per chunk
 */
function splitPOFile(inputFile, outputDir, chunkSize = DEFAULT_CHUNK_SIZE) {
    console.log(`* Splitting ${inputFile} into chunks of ${chunkSize} entries...`);
    
    // * Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const poStructure = parsePOFile(inputFile);
    const totalEntries = poStructure.entries.length;
    const totalChunks = Math.ceil(totalEntries / chunkSize);
    
    console.log(`* Total entries: ${totalEntries}`);
    console.log(`* Total chunks: ${totalChunks}`);
    
    // * Create metadata file
    const metadata = {
        originalFile: path.basename(inputFile),
        totalEntries: totalEntries,
        totalChunks: totalChunks,
        chunkSize: chunkSize,
        splitDate: new Date().toISOString(),
        header: poStructure.header
    };
    
    fs.writeFileSync(
        path.join(outputDir, 'split_metadata.json'),
        JSON.stringify(metadata, null, 2)
    );
    
    // * Split entries into chunks
    for (let i = 0; i < totalChunks; i++) {
        const startIndex = i * chunkSize;
        const endIndex = Math.min(startIndex + chunkSize, totalEntries);
        const chunkEntries = poStructure.entries.slice(startIndex, endIndex);
        
        // * Create chunk file with header
        const chunkContent = poStructure.header + '\n\n' + chunkEntries.join('\n\n');
        
        const chunkFileName = `chunk_${String(i + 1).padStart(3, '0')}_${startIndex + 1}-${endIndex}.po`;
        const chunkPath = path.join(outputDir, chunkFileName);
        
        fs.writeFileSync(chunkPath, chunkContent);
        
        console.log(`* Created ${chunkFileName} (${chunkEntries.length} entries)`);
    }
    
    console.log(`* Split completed. Chunks saved in: ${outputDir}`);
}

/**
 * * Merges PO file chunks back into a single file
 * @param {string} inputDir - Directory containing chunks
 * @param {string} outputFile - Path to output merged file
 */
function mergePOFiles(inputDir, outputFile) {
    console.log(`* Merging chunks from ${inputDir} into ${outputFile}...`);
    
    // * Read metadata
    const metadataPath = path.join(inputDir, 'split_metadata.json');
    if (!fs.existsSync(metadataPath)) {
        throw new Error('Metadata file not found. Cannot merge without metadata.');
    }
    
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    // * Get all chunk files
    const files = fs.readdirSync(inputDir)
        .filter(file => file.startsWith('chunk_') && file.endsWith('.po'))
        .sort();
    
    if (files.length === 0) {
        throw new Error('No chunk files found in the input directory.');
    }
    
    console.log(`* Found ${files.length} chunk files`);
    
    // * Read header from first chunk
    const firstChunkPath = path.join(inputDir, files[0]);
    const firstChunkContent = fs.readFileSync(firstChunkPath, 'utf8');
    const firstChunkStructure = parsePOFile(firstChunkPath);
    
    // * Collect all entries from all chunks
    let allEntries = [];
    
    for (const file of files) {
        const chunkPath = path.join(inputDir, file);
        const chunkStructure = parsePOFile(chunkPath);
        allEntries = allEntries.concat(chunkStructure.entries);
        
        console.log(`* Processed ${file} (${chunkStructure.entries.length} entries)`);
    }
    
    // * Create merged content
    const mergedContent = firstChunkStructure.header + '\n\n' + allEntries.join('\n\n');
    
    // * Write merged file
    fs.writeFileSync(outputFile, mergedContent);
    
    console.log(`* Merge completed. Total entries: ${allEntries.length}`);
    console.log(`* Merged file saved as: ${outputFile}`);
    
    // * Validate the merge
    validatePOFile(outputFile);
}

/**
 * * Validates a PO file structure
 * @param {string} poFile - Path to PO file to validate
 */
function validatePOFile(poFile) {
    console.log(`* Validating ${poFile}...`);
    
    const content = fs.readFileSync(poFile, 'utf8');
    const lines = content.split('\n');
    
    let errors = [];
    let warnings = [];
    let entryCount = 0;
    let inEntry = false;
    let hasMsgid = false;
    let hasMsgstr = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNumber = i + 1;
        
        // * Check for entry start
        if (line.startsWith('msgid ')) {
            if (inEntry && (!hasMsgid || !hasMsgstr)) {
                errors.push(`Line ${lineNumber}: Incomplete entry (missing msgid or msgstr)`);
            }
            
            inEntry = true;
            hasMsgid = true;
            hasMsgstr = false;
            entryCount++;
        } else if (line.startsWith('msgstr ')) {
            if (!inEntry) {
                errors.push(`Line ${lineNumber}: msgstr without msgid`);
            }
            hasMsgstr = true;
        } else if (line.startsWith('"') && inEntry) {
            // * Continuation line
            continue;
        } else if (line.trim() === '' && inEntry) {
            // * End of entry
            if (!hasMsgid || !hasMsgstr) {
                errors.push(`Line ${lineNumber}: Incomplete entry`);
            }
            inEntry = false;
            hasMsgid = false;
            hasMsgstr = false;
        }
    }
    
    // * Check for incomplete last entry
    if (inEntry && (!hasMsgid || !hasMsgstr)) {
        errors.push(`End of file: Incomplete entry`);
    }
    
    // * Check for common issues
    if (content.includes('msgstr ""') && !content.includes('msgid ""')) {
        warnings.push('Empty msgstr found without corresponding msgid');
    }
    
    if (content.includes('msgid ""') && !content.includes('msgstr ""')) {
        warnings.push('Empty msgid found without corresponding msgstr');
    }
    
    console.log(`* Validation completed:`);
    console.log(`  - Total entries: ${entryCount}`);
    console.log(`  - Errors: ${errors.length}`);
    console.log(`  - Warnings: ${warnings.length}`);
    
    if (errors.length > 0) {
        console.log(`* Errors found:`);
        errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (warnings.length > 0) {
        console.log(`* Warnings:`);
        warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    return errors.length === 0;
}

/**
 * * CLI argument parsing and main function
 */
function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log(`
PO File Split and Merge Utility

Usage:
  node po_split_merge.js split <input_file> <output_dir> [chunk_size]
  node po_split_merge.js merge <input_dir> <output_file>
  node po_split_merge.js validate <po_file>

Examples:
  node po_split_merge.js split hrm/th.po ./chunks 500
  node po_split_merge.js merge ./chunks merged_th.po
  node po_split_merge.js validate hrm/th.po
        `);
        process.exit(1);
    }
    
    const command = args[0];
    
    try {
        switch (command) {
            case 'split':
                if (args.length < 3) {
                    throw new Error('Split command requires input file and output directory');
                }
                const inputFile = args[1];
                const outputDir = args[2];
                const chunkSize = args[3] ? parseInt(args[3]) : DEFAULT_CHUNK_SIZE;
                
                if (!fs.existsSync(inputFile)) {
                    throw new Error(`Input file not found: ${inputFile}`);
                }
                
                splitPOFile(inputFile, outputDir, chunkSize);
                break;
                
            case 'merge':
                if (args.length < 3) {
                    throw new Error('Merge command requires input directory and output file');
                }
                const inputDir = args[1];
                const outputFile = args[2];
                
                if (!fs.existsSync(inputDir)) {
                    throw new Error(`Input directory not found: ${inputDir}`);
                }
                
                mergePOFiles(inputDir, outputFile);
                break;
                
            case 'validate':
                if (args.length < 2) {
                    throw new Error('Validate command requires PO file path');
                }
                const poFile = args[1];
                
                if (!fs.existsSync(poFile)) {
                    throw new Error(`PO file not found: ${poFile}`);
                }
                
                validatePOFile(poFile);
                break;
                
            default:
                throw new Error(`Unknown command: ${command}`);
        }
    } catch (error) {
        console.error(`* Error: ${error.message}`);
        process.exit(1);
    }
}

// * Run the main function if this script is executed directly
if (require.main === module) {
    main();
}

module.exports = {
    parsePOFile,
    splitPOFile,
    mergePOFiles,
    validatePOFile
}; 