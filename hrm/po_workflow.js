const fs = require('fs');
const path = require('path');

/**
 * * PO Workflow Tool
 * * Combined tool for PO to CSV and CSV to PO operations
 * * Supports full translation workflow
 */

// * Import functions from other modules
const { parsePoFile, convertToCsv, escapeCsv } = require('./po_to_csv.js');
const { parseCsvTranslations, updatePoFile, parseCsvLine } = require('./csv_to_po_updater.js');

// * Configuration variables
const DEFAULT_PO_FILE = 'th.po';
const DEFAULT_CSV_FILE = 'th_translations.csv';
const DEFAULT_UPDATED_PO_FILE = 'th_updated.po';
const ENCODING = 'utf8';

/**
 * * Converts PO file to CSV
 * @param {string} poFile - Input PO file path
 * @param {string} csvFile - Output CSV file path
 */
function poToCsv(poFile, csvFile) {
    console.log('* Converting PO to CSV...');
    
    if (!fs.existsSync(poFile)) {
        console.error('! Input PO file not found:', poFile);
        return false;
    }
    
    const translations = parsePoFile(poFile);
    if (translations.length === 0) {
        console.error('! No translations found in PO file');
        return false;
    }
    
    const csvContent = convertToCsv(translations);
    fs.writeFileSync(csvFile, csvContent, ENCODING);
    
    const translatedCount = translations.filter(t => t.msgstr).length;
    console.log(`* CSV file created: ${csvFile}`);
    console.log(`* Total entries: ${translations.length}`);
    console.log(`* Translated: ${translatedCount}`);
    console.log(`* Translation rate: ${((translatedCount / translations.length) * 100).toFixed(2)}%`);
    
    return true;
}

/**
 * * Updates PO file with translations from CSV
 * @param {string} csvFile - Input CSV file path
 * @param {string} poFile - Input PO file path
 * @param {string} updatedPoFile - Output PO file path
 */
function csvToPo(csvFile, poFile, updatedPoFile) {
    console.log('* Updating PO with CSV translations...');
    
    if (!fs.existsSync(csvFile)) {
        console.error('! Input CSV file not found:', csvFile);
        return false;
    }
    
    if (!fs.existsSync(poFile)) {
        console.error('! Input PO file not found:', poFile);
        return false;
    }
    
    const translations = parseCsvTranslations(csvFile);
    if (translations.size === 0) {
        console.error('! No translations found in CSV file');
        return false;
    }
    
    updatePoFile(poFile, translations, updatedPoFile);
    return true;
}

/**
 * * Full workflow: PO -> CSV -> Edit -> CSV -> PO
 * @param {string} poFile - Input PO file
 * @param {string} csvFile - Intermediate CSV file
 * @param {string} updatedPoFile - Final PO file
 */
function fullWorkflow(poFile, csvFile, updatedPoFile) {
    console.log('* Starting full PO workflow...\n');
    
    // * Step 1: PO to CSV
    console.log('=== Step 1: PO to CSV ===');
    if (!poToCsv(poFile, csvFile)) {
        return false;
    }
    
    console.log('\n=== Step 2: Ready for editing ===');
    console.log(`* Please edit the CSV file: ${csvFile}`);
    console.log('* Add translations to the msgstr column');
    console.log('* Change status to "Translated" for completed translations');
    console.log('* Save the file when done');
    
    // * Ask user if they want to continue
    console.log('\n* Press Enter when you have finished editing the CSV file...');
    console.log('* (Or run this script again with --csv-to-po to skip this step)');
    
    return true;
}

/**
 * * Shows workflow statistics
 * @param {string} poFile - PO file path
 * @param {string} csvFile - CSV file path
 */
function showStatistics(poFile, csvFile) {
    console.log('* Translation Statistics:\n');
    
    // * PO file statistics
    if (fs.existsSync(poFile)) {
        const poTranslations = parsePoFile(poFile);
        const poTranslatedCount = poTranslations.filter(t => t.msgstr).length;
        console.log(`PO File (${poFile}):`);
        console.log(`  - Total entries: ${poTranslations.length}`);
        console.log(`  - Translated: ${poTranslatedCount}`);
        console.log(`  - Translation rate: ${((poTranslatedCount / poTranslations.length) * 100).toFixed(2)}%`);
    }
    
    // * CSV file statistics
    if (fs.existsSync(csvFile)) {
        const csvTranslations = parseCsvTranslations(csvFile);
        console.log(`\nCSV File (${csvFile}):`);
        console.log(`  - Translated entries: ${csvTranslations.size}`);
    }
}

/**
 * * Main function
 */
function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
PO Workflow Tool

Usage: node po_workflow.js [command] [options]

Commands:
  po-to-csv          Convert PO file to CSV
  csv-to-po          Update PO file with CSV translations
  full-workflow      Complete workflow: PO -> CSV -> Edit -> PO
  stats              Show translation statistics

Options:
  --po <file>        PO file (default: th.po)
  --csv <file>       CSV file (default: th_translations.csv)
  --output <file>    Updated PO file (default: th_updated.po)
  --help, -h         Show this help message

Examples:
  node po_workflow.js po-to-csv
  node po_workflow.js csv-to-po
  node po_workflow.js full-workflow
  node po_workflow.js stats
  node po_workflow.js po-to-csv --po myfile.po --csv myfile.csv
        `);
        process.exit(0);
    }
    
    // * Parse command line arguments
    let poFile = DEFAULT_PO_FILE;
    let csvFile = DEFAULT_CSV_FILE;
    let updatedPoFile = DEFAULT_UPDATED_PO_FILE;
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--po' && args[i + 1]) {
            poFile = args[i + 1];
            i++;
        } else if (args[i] === '--csv' && args[i + 1]) {
            csvFile = args[i + 1];
            i++;
        } else if (args[i] === '--output' && args[i + 1]) {
            updatedPoFile = args[i + 1];
            i++;
        }
    }
    
    // * Execute command
    const command = args[0];
    
    switch (command) {
        case 'po-to-csv':
            poToCsv(poFile, csvFile);
            break;
            
        case 'csv-to-po':
            csvToPo(csvFile, poFile, updatedPoFile);
            break;
            
        case 'full-workflow':
            fullWorkflow(poFile, csvFile, updatedPoFile);
            break;
            
        case 'stats':
            showStatistics(poFile, csvFile);
            break;
            
        default:
            console.error('! Unknown command. Use --help for usage information.');
            process.exit(1);
    }
}

// * CLI support
if (require.main === module) {
    main();
}

module.exports = {
    poToCsv,
    csvToPo,
    fullWorkflow,
    showStatistics
}; 