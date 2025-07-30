const fs = require('fs');
const path = require('path');

/**
 * * PO to CSV Converter
 * * Reads a .po file and extracts msgid/msgstr pairs to CSV format
 * * Handles multi-line strings and preserves special characters
 */

// * Configuration variables
const INPUT_PO_FILE = 'th.po';
const OUTPUT_CSV_FILE = 'th_translations.csv';
const ENCODING = 'utf8';

/**
 * * Parses a PO file and extracts msgid/msgstr pairs
 * @param {string} filePath - Path to the PO file
 * @returns {Array} Array of objects with msgid and msgstr
 */
function parsePoFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, ENCODING);
        const lines = content.split('\n');
        const translations = [];
        let currentMsgid = '';
        let currentMsgstr = '';
        let isInMsgid = false;
        let isInMsgstr = false;
        let lineNumber = 0;

        for (const line of lines) {
            lineNumber++;
            const trimmedLine = line.trim();

            // * Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                continue;
            }

            // * Check for msgid start
            if (trimmedLine.startsWith('msgid ')) {
                // * Save previous translation if exists
                if (currentMsgid && currentMsgid !== '""') {
                    translations.push({
                        msgid: currentMsgid,
                        msgstr: currentMsgstr,
                        lineNumber: lineNumber
                    });
                }
                
                // * Start new msgid
                currentMsgid = trimmedLine.substring(6).replace(/^"|"$/g, '');
                currentMsgstr = '';
                isInMsgid = true;
                isInMsgstr = false;
                continue;
            }

            // * Check for msgstr start
            if (trimmedLine.startsWith('msgstr ')) {
                currentMsgstr = trimmedLine.substring(7).replace(/^"|"$/g, '');
                isInMsgid = false;
                isInMsgstr = true;
                continue;
            }

            // * Handle multi-line strings
            if (trimmedLine.startsWith('"') && trimmedLine.endsWith('"')) {
                const stringContent = trimmedLine.replace(/^"|"$/g, '');
                
                if (isInMsgid) {
                    currentMsgid += stringContent;
                } else if (isInMsgstr) {
                    currentMsgstr += stringContent;
                }
            }
        }

        // * Add the last translation
        if (currentMsgid && currentMsgid !== '""') {
            translations.push({
                msgid: currentMsgid,
                msgstr: currentMsgstr,
                lineNumber: lineNumber
            });
        }

        return translations;
    } catch (error) {
        console.error('! Error reading PO file:', error.message);
        return [];
    }
}

/**
 * * Escapes CSV special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeCsv(text) {
    if (text.includes('"') || text.includes(',') || text.includes('\n') || text.includes('\r')) {
        return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
}

/**
 * * Converts translations array to CSV format
 * @param {Array} translations - Array of translation objects
 * @returns {string} CSV content
 */
function convertToCsv(translations) {
    const csvHeader = 'Line Number,msgid,msgstr,Status\n';
    const csvRows = translations.map(translation => {
        const status = translation.msgstr ? 'Translated' : 'Untranslated';
        return `${translation.lineNumber},"${escapeCsv(translation.msgid)}","${escapeCsv(translation.msgstr)}",${status}`;
    });
    
    return csvHeader + csvRows.join('\n');
}

/**
 * * Main function to process PO file and generate CSV
 */
function main() {
    console.log('* Starting PO to CSV conversion...');
    
    // * Check if input file exists
    if (!fs.existsSync(INPUT_PO_FILE)) {
        console.error('! Input file not found:', INPUT_PO_FILE);
        process.exit(1);
    }

    // * Parse PO file
    console.log('* Parsing PO file...');
    const translations = parsePoFile(INPUT_PO_FILE);
    
    if (translations.length === 0) {
        console.error('! No translations found in PO file');
        process.exit(1);
    }

    console.log(`* Found ${translations.length} translations`);

    // * Convert to CSV
    console.log('* Converting to CSV format...');
    const csvContent = convertToCsv(translations);

    // * Write CSV file
    try {
        fs.writeFileSync(OUTPUT_CSV_FILE, csvContent, ENCODING);
        console.log(`* CSV file created successfully: ${OUTPUT_CSV_FILE}`);
        
        // * Show statistics
        const translatedCount = translations.filter(t => t.msgstr).length;
        const untranslatedCount = translations.length - translatedCount;
        
        console.log('* Translation Statistics:');
        console.log(`  - Total entries: ${translations.length}`);
        console.log(`  - Translated: ${translatedCount}`);
        console.log(`  - Untranslated: ${untranslatedCount}`);
        console.log(`  - Translation rate: ${((translatedCount / translations.length) * 100).toFixed(2)}%`);
        
    } catch (error) {
        console.error('! Error writing CSV file:', error.message);
        process.exit(1);
    }
}

// * CLI support
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
PO to CSV Converter

Usage: node po_to_csv.js [options]

Options:
  --input <file>     Input PO file (default: th.po)
  --output <file>    Output CSV file (default: th_translations.csv)
  --help, -h         Show this help message

Examples:
  node po_to_csv.js
  node po_to_csv.js --input myfile.po --output myfile.csv
        `);
        process.exit(0);
    }

    // * Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--input' && args[i + 1]) {
            INPUT_PO_FILE = args[i + 1];
            i++;
        } else if (args[i] === '--output' && args[i + 1]) {
            OUTPUT_CSV_FILE = args[i + 1];
            i++;
        }
    }

    main();
}

module.exports = {
    parsePoFile,
    convertToCsv,
    escapeCsv
}; 