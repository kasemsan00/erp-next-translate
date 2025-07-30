#!/usr/bin/env node

/**
 * Example Usage of PO Split and Merge Tool
 * 
 * This script demonstrates how to use the po_split_merge.js tool
 * programmatically for common translation workflow scenarios.
 */

const { parsePOFile, splitPOFile, mergePOFiles, validatePOFile } = require('./po_split_merge.js');
const fs = require('fs');
const path = require('path');

// * Configuration
const INPUT_FILE = 'hrm/th.po';
const CHUNK_SIZE = 500; // * Entries per chunk
const OUTPUT_DIR = './translation_chunks';
const MERGED_FILE = './merged_th.po';

/**
 * * Example 1: Split a large PO file for translation work
 */
function exampleSplitForTranslation() {
    console.log('* Example 1: Splitting PO file for translation work');
    console.log('=' .repeat(50));
    
    try {
        // * Validate the input file first
        console.log('* Validating input file...');
        const isValid = validatePOFile(INPUT_FILE);
        
        if (!isValid) {
            console.log('* Warning: Input file has validation issues');
        }
        
        // * Split the file into manageable chunks
        console.log('* Splitting file into chunks...');
        splitPOFile(INPUT_FILE, OUTPUT_DIR, CHUNK_SIZE);
        
        console.log('* Split completed successfully!');
        console.log(`* Chunks saved in: ${OUTPUT_DIR}`);
        
        // * Show chunk information
        const files = fs.readdirSync(OUTPUT_DIR)
            .filter(file => file.startsWith('chunk_') && file.endsWith('.po'))
            .sort();
        
        console.log(`* Total chunks created: ${files.length}`);
        console.log(`* Chunk size: ${CHUNK_SIZE} entries`);
        
    } catch (error) {
        console.error(`* Error in split example: ${error.message}`);
    }
}

/**
 * * Example 2: Merge translated chunks back together
 */
function exampleMergeTranslatedChunks() {
    console.log('\n* Example 2: Merging translated chunks');
    console.log('=' .repeat(50));
    
    try {
        // * Check if chunks directory exists
        if (!fs.existsSync(OUTPUT_DIR)) {
            console.log('* No chunks directory found. Run Example 1 first.');
            return;
        }
        
        // * Merge the chunks back together
        console.log('* Merging chunks...');
        mergePOFiles(OUTPUT_DIR, MERGED_FILE);
        
        console.log('* Merge completed successfully!');
        console.log(`* Merged file: ${MERGED_FILE}`);
        
        // * Validate the merged file
        console.log('* Validating merged file...');
        const isValid = validatePOFile(MERGED_FILE);
        
        if (isValid) {
            console.log('* Merged file validation passed!');
        } else {
            console.log('* Warning: Merged file has validation issues');
        }
        
    } catch (error) {
        console.error(`* Error in merge example: ${error.message}`);
    }
}

/**
 * * Example 3: Analyze PO file structure
 */
function exampleAnalyzePOFile() {
    console.log('\n* Example 3: Analyzing PO file structure');
    console.log('=' .repeat(50));
    
    try {
        // * Parse the PO file
        console.log('* Parsing PO file structure...');
        const poStructure = parsePOFile(INPUT_FILE);
        
        // * Display analysis
        console.log('* File Analysis:');
        console.log(`  - Total entries: ${poStructure.entries.length}`);
        console.log(`  - Header lines: ${poStructure.header.split('\n').length}`);
        
        // * Count translated vs untranslated entries
        let translated = 0;
        let untranslated = 0;
        
        poStructure.entries.forEach(entry => {
            if (entry.includes('msgstr ""') || entry.includes('msgstr ""')) {
                untranslated++;
            } else {
                translated++;
            }
        });
        
        console.log(`  - Translated entries: ${translated}`);
        console.log(`  - Untranslated entries: ${untranslated}`);
        console.log(`  - Translation progress: ${((translated / poStructure.entries.length) * 100).toFixed(1)}%`);
        
        // * Show some sample entries
        console.log('\n* Sample entries:');
        const sampleEntries = poStructure.entries.slice(0, 3);
        sampleEntries.forEach((entry, index) => {
            console.log(`  Entry ${index + 1}:`);
            console.log(`    ${entry.split('\n').slice(0, 3).join('\n    ')}...`);
        });
        
    } catch (error) {
        console.error(`* Error in analysis example: ${error.message}`);
    }
}

/**
 * * Example 4: Translation workflow simulation
 */
function exampleTranslationWorkflow() {
    console.log('\n* Example 4: Translation workflow simulation');
    console.log('=' .repeat(50));
    
    try {
        // * Step 1: Split for translation
        console.log('* Step 1: Splitting file for translation...');
        splitPOFile(INPUT_FILE, OUTPUT_DIR, 200); // * Smaller chunks for easier work
        
        // * Step 2: Simulate translation work (modify a few entries)
        console.log('* Step 2: Simulating translation work...');
        const files = fs.readdirSync(OUTPUT_DIR)
            .filter(file => file.startsWith('chunk_') && file.endsWith('.po'))
            .sort();
        
        // * Modify the first chunk to simulate translation
        if (files.length > 0) {
            const firstChunkPath = path.join(OUTPUT_DIR, files[0]);
            let content = fs.readFileSync(firstChunkPath, 'utf8');
            
            // * Replace some empty msgstr with sample translations
            content = content.replace(
                /msgstr ""/g,
                'msgstr "ตัวอย่างการแปล"'
            );
            
            fs.writeFileSync(firstChunkPath, content);
            console.log('* Modified first chunk with sample translations');
        }
        
        // * Step 3: Merge back
        console.log('* Step 3: Merging translated chunks...');
        mergePOFiles(OUTPUT_DIR, MERGED_FILE);
        
        // * Step 4: Validate final result
        console.log('* Step 4: Validating final result...');
        const isValid = validatePOFile(MERGED_FILE);
        
        if (isValid) {
            console.log('* Translation workflow completed successfully!');
        } else {
            console.log('* Warning: Final file has validation issues');
        }
        
    } catch (error) {
        console.error(`* Error in workflow example: ${error.message}`);
    }
}

/**
 * * Main function to run examples
 */
function main() {
    console.log('PO Split and Merge Tool - Usage Examples');
    console.log('==========================================');
    
    // * Check if input file exists
    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`* Error: Input file not found: ${INPUT_FILE}`);
        console.log('* Please ensure the hrm/th.po file exists before running examples.');
        process.exit(1);
    }
    
    // * Run examples
    exampleAnalyzePOFile();
    exampleSplitForTranslation();
    exampleMergeTranslatedChunks();
    exampleTranslationWorkflow();
    
    console.log('\n* All examples completed!');
    console.log('* Check the generated files:');
    console.log(`  - Chunks directory: ${OUTPUT_DIR}`);
    console.log(`  - Merged file: ${MERGED_FILE}`);
}

// * Run examples if this script is executed directly
if (require.main === module) {
    main();
}

module.exports = {
    exampleSplitForTranslation,
    exampleMergeTranslatedChunks,
    exampleAnalyzePOFile,
    exampleTranslationWorkflow
}; 