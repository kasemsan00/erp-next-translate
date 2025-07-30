const fs = require('fs');
const path = require('path');

/**
 * * Extracts msgid entries with empty msgstr translations from a .po file
 * * Outputs the results as a CSV table
 */
function extractEmptyTranslations(poFilePath, outputCsvPath) {
    try {
        // * Read the .po file
        const content = fs.readFileSync(poFilePath, 'utf8');
        const lines = content.split('\n');
        
        const emptyTranslations = [];
        let currentMsgid = '';
        let currentContext = '';
        let lineNumber = 0;
        
        // * Parse the .po file line by line
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            lineNumber = i + 1;
            
            // * Check for context lines (comments starting with #:)
            if (line.startsWith('#:')) {
                currentContext = line.substring(2).trim();
                continue;
            }
            
            // * Check for msgid lines
            if (line.startsWith('msgid ')) {
                // * Extract the msgid content (remove the "msgid " prefix and quotes)
                const msgidContent = line.substring(6).replace(/^"(.*)"$/, '$1');
                currentMsgid = msgidContent;
                continue;
            }
            
            // * Check for msgstr "" lines (empty translations)
            if (line === 'msgstr ""') {
                // * Only add if we have a valid msgid (not empty or header)
                if (currentMsgid && currentMsgid !== '') {
                    emptyTranslations.push({
                        lineNumber: lineNumber,
                        context: currentContext,
                        msgid: currentMsgid,
                        msgstr: ''
                    });
                }
                currentMsgid = '';
                currentContext = '';
                continue;
            }
            
            // * Handle multi-line msgid (if msgid starts with empty string)
            if (line === 'msgid ""' && currentMsgid === '') {
                // * This is a multi-line msgid, skip it as it's usually the header
                currentMsgid = '';
                continue;
            }
        }
        
        // * Generate CSV content
        const csvHeader = 'Line Number,Context,Message ID,Message String\n';
        const csvRows = emptyTranslations.map(item => {
            // * Escape quotes and commas in CSV
            const escapedContext = `"${item.context.replace(/"/g, '""')}"`;
            const escapedMsgid = `"${item.msgid.replace(/"/g, '""')}"`;
            const escapedMsgstr = `"${item.msgstr.replace(/"/g, '""')}"`;
            
            return `${item.lineNumber},${escapedContext},${escapedMsgid},${escapedMsgstr}`;
        }).join('\n');
        
        const csvContent = csvHeader + csvRows;
        
        // * Write to CSV file
        fs.writeFileSync(outputCsvPath, csvContent, 'utf8');
        
        console.log(`✅ Successfully extracted ${emptyTranslations.length} empty translations`);
        console.log(`📁 Output saved to: ${outputCsvPath}`);
        
        // * Display summary
        console.log('\n📊 Summary:');
        console.log(`Total empty translations found: ${emptyTranslations.length}`);
        
        if (emptyTranslations.length > 0) {
            console.log('\n🔍 First 5 empty translations:');
            emptyTranslations.slice(0, 5).forEach((item, index) => {
                console.log(`${index + 1}. Line ${item.lineNumber}: "${item.msgid}"`);
            });
        }
        
        return emptyTranslations;
        
    } catch (error) {
        console.error('❌ Error processing file:', error.message);
        throw error;
    }
}

/**
 * * Main execution function
 */
function main() {
    const poFilePath = path.join(__dirname, 'th_updated.po');
    const outputCsvPath = path.join(__dirname, 'empty_translations.csv');
    
    // * Check if input file exists
    if (!fs.existsSync(poFilePath)) {
        console.error(`❌ Input file not found: ${poFilePath}`);
        process.exit(1);
    }
    
    console.log('🔍 Extracting empty translations from .po file...');
    console.log(`📂 Input file: ${poFilePath}`);
    console.log(`📄 Output file: ${outputCsvPath}`);
    console.log('');
    
    try {
        const results = extractEmptyTranslations(poFilePath, outputCsvPath);
        
        // * Also create a summary report
        const summaryPath = path.join(__dirname, 'empty_translations_summary.txt');
        const summaryContent = `Empty Translations Summary
Generated: ${new Date().toISOString()}
Input file: ${poFilePath}
Total empty translations: ${results.length}

First 10 empty translations:
${results.slice(0, 10).map((item, index) => 
    `${index + 1}. Line ${item.lineNumber}: "${item.msgid}"`
).join('\n')}

${results.length > 10 ? `... and ${results.length - 10} more entries` : ''}
`;
        
        fs.writeFileSync(summaryPath, summaryContent, 'utf8');
        console.log(`📋 Summary report saved to: ${summaryPath}`);
        
    } catch (error) {
        console.error('❌ Failed to process file:', error.message);
        process.exit(1);
    }
}

// * Run the script if called directly
if (require.main === module) {
    main();
}

module.exports = { extractEmptyTranslations }; 