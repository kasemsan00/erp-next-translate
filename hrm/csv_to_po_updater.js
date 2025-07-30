const fs = require('fs');
const path = require('path');

/**
 * * CSV to PO Updater
 * * Reads translations from CSV and updates PO file with translated strings
 * * Matches msgid and replaces corresponding msgstr in PO file
 */

// * Configuration variables
const INPUT_CSV_FILE = 'th_translations.csv';
const INPUT_PO_FILE = 'th.po';
const OUTPUT_PO_FILE = 'th_updated.po';
const ENCODING = 'utf8';

/**
 * * Parses CSV file and creates a map of msgid to msgstr
 * @param {string} csvFilePath - Path to the CSV file
 * @returns {Map} Map of msgid -> msgstr for translated entries
 */
function parseCsvTranslations(csvFilePath) {
    try {
        const content = fs.readFileSync(csvFilePath, ENCODING);
        const lines = content.split('\n');
        const translations = new Map();
        
        // * Skip header line
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // * Parse CSV line (handle quoted fields)
            const fields = parseCsvLine(line);
            if (fields.length >= 3) {
                const lineNumber = parseInt(fields[0]);
                const msgid = fields[1];
                const msgstr = fields[2];
                const status = fields[3];
                
                // * Only include translated entries
                if (status === 'Translated' && msgstr && msgstr.trim() !== '') {
                    translations.set(msgid, msgstr);
                }
            }
        }
        
        console.log(`* Found ${translations.size} translated entries in CSV`);
        return translations;
    } catch (error) {
        console.error('! Error reading CSV file:', error.message);
        return new Map();
    }
}

/**
 * * Parses a CSV line handling quoted fields
 * @param {string} line - CSV line to parse
 * @returns {Array} Array of field values
 */
function parseCsvLine(line) {
    const fields = [];
    let currentField = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                // * Escaped quote
                currentField += '"';
                i += 2;
            } else {
                // * Toggle quote state
                inQuotes = !inQuotes;
                i++;
            }
        } else if (char === ',' && !inQuotes) {
            // * Field separator
            fields.push(currentField);
            currentField = '';
            i++;
        } else {
            currentField += char;
            i++;
        }
    }
    
    // * Add the last field
    fields.push(currentField);
    return fields;
}

/**
 * * Updates PO file with translations from CSV
 * @param {string} poFilePath - Path to the PO file
 * @param {Map} translations - Map of msgid -> msgstr
 * @param {string} outputPath - Path for the updated PO file
 */
function updatePoFile(poFilePath, translations, outputPath) {
    try {
        const content = fs.readFileSync(poFilePath, ENCODING);
        const lines = content.split('\n');
        const updatedLines = [];
        let currentMsgid = '';
        let isInMsgid = false;
        let isInMsgstr = false;
        let updatedCount = 0;
        let skippedCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            // * Check for msgid start
            if (trimmedLine.startsWith('msgid ')) {
                currentMsgid = trimmedLine.substring(6).replace(/^"|"$/g, '');
                isInMsgid = true;
                isInMsgstr = false;
                updatedLines.push(line);
                continue;
            }
            
            // * Check for msgstr start
            if (trimmedLine.startsWith('msgstr ')) {
                isInMsgid = false;
                isInMsgstr = true;
                
                // * Check if we have a translation for this msgid
                if (translations.has(currentMsgid)) {
                    const translation = translations.get(currentMsgid);
                    updatedLines.push(`msgstr "${translation}"`);
                    updatedCount++;
                    console.log(`* Updated: "${currentMsgid}" -> "${translation}"`);
                } else {
                    updatedLines.push(line);
                    skippedCount++;
                }
                continue;
            }
            
            // * Handle multi-line strings
            if (trimmedLine.startsWith('"') && trimmedLine.endsWith('"')) {
                if (isInMsgid) {
                    // * Continue building msgid
                    currentMsgid += trimmedLine.replace(/^"|"$/g, '');
                    updatedLines.push(line);
                } else if (isInMsgstr) {
                    // * Skip continuation lines for msgstr if we updated it
                    if (!translations.has(currentMsgid)) {
                        updatedLines.push(line);
                    }
                }
            } else {
                // * Keep all other lines as is
                updatedLines.push(line);
            }
        }
        
        // * Write updated PO file
        fs.writeFileSync(outputPath, updatedLines.join('\n'), ENCODING);
        
        console.log(`* PO file updated successfully: ${outputPath}`);
        console.log(`* Updated ${updatedCount} translations`);
        console.log(`* Skipped ${skippedCount} untranslated entries`);
        
    } catch (error) {
        console.error('! Error updating PO file:', error.message);
        throw error;
    }
}

/**
 * * Main function to process CSV and update PO file
 */
function main() {
    console.log('* Starting CSV to PO updater...');
    
    // * Check if input files exist
    if (!fs.existsSync(INPUT_CSV_FILE)) {
        console.error('! Input CSV file not found:', INPUT_CSV_FILE);
        process.exit(1);
    }
    
    if (!fs.existsSync(INPUT_PO_FILE)) {
        console.error('! Input PO file not found:', INPUT_PO_FILE);
        process.exit(1);
    }
    
    // * Parse CSV translations
    console.log('* Parsing CSV translations...');
    const translations = parseCsvTranslations(INPUT_CSV_FILE);
    
    if (translations.size === 0) {
        console.error('! No translations found in CSV file');
        process.exit(1);
    }
    
    // * Update PO file
    console.log('* Updating PO file...');
    updatePoFile(INPUT_PO_FILE, translations, OUTPUT_PO_FILE);
    
    console.log('* Process completed successfully!');
}

// * CLI support
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
CSV to PO Updater

Usage: node csv_to_po_updater.js [options]

Options:
  --csv <file>      Input CSV file (default: th_translations.csv)
  --po <file>       Input PO file (default: th.po)
  --output <file>   Output PO file (default: th_updated.po)
  --help, -h        Show this help message

Examples:
  node csv_to_po_updater.js
  node csv_to_po_updater.js --csv my_translations.csv --po myfile.po --output updated.po
        `);
        process.exit(0);
    }
    
    // * Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--csv' && args[i + 1]) {
            INPUT_CSV_FILE = args[i + 1];
            i++;
        } else if (args[i] === '--po' && args[i + 1]) {
            INPUT_PO_FILE = args[i + 1];
            i++;
        } else if (args[i] === '--output' && args[i + 1]) {
            OUTPUT_PO_FILE = args[i + 1];
            i++;
        }
    }
    
    main();
}

module.exports = {
    parseCsvTranslations,
    updatePoFile,
    parseCsvLine
}; 