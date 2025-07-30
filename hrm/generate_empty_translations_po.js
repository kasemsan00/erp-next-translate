const fs = require('fs');
const path = require('path');

// Read the empty translations markdown file
const markdownContent = fs.readFileSync(path.join(__dirname, 'empty_translations.md'), 'utf8');

// Parse the markdown table to extract translations
const lines = markdownContent.split('\n');
const translations = [];

// Skip the header and description lines
let inTable = false;
for (const line of lines) {
    if (line.includes('| Line Number | Context | Message ID | Message String (Thai Translation) |')) {
        inTable = true;
        continue;
    }
    
    if (inTable && line.trim().startsWith('|')) {
        const parts = line.split('|').map(part => part.trim());
        if (parts.length >= 5) {
            const lineNumber = parts[1];
            const context = parts[2];
            const messageId = parts[3];
            const messageString = parts[4];
            
            if (lineNumber && context && messageId && messageString && 
                lineNumber !== 'Line Number' && !isNaN(parseInt(lineNumber))) {
                translations.push({
                    lineNumber: parseInt(lineNumber),
                    context: context,
                    messageId: messageId,
                    messageString: messageString
                });
            }
        }
    }
}

// Generate PO file header
let poContent = `msgid ""
msgstr ""
"Project-Id-Version: frappe\\n"
"Report-Msgid-Bugs-To: contact@frappe.io\\n"
"POT-Creation-Date: 2025-06-08 09:35+0000\\n"
"PO-Revision-Date: 2025-07-30 02:17\\n"
"Last-Translator: contact@frappe.io\\n"
"Language-Team: Thai\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Generated-By: Babel 2.13.1\\n"
"Plural-Forms: nplurals=1; plural=0;\\n"
"X-Crowdin-Project: frappe\\n"
"X-Crowdin-Project-ID: 639578\\n"
"X-Crowdin-Language: th\\n"
"X-Crowdin-File: /[frappe.hrms] develop/hrms/locale/main.pot\\n"
"X-Crowdin-File-ID: 58\\n"
"Language: th_TH\\n"
"\\n"`;

// Generate PO entries
for (const translation of translations) {
    // Determine the comment type based on context
    let commentType = 'Field description';
    if (translation.context.includes('.py:')) {
        commentType = 'Error message';
    } else if (translation.context.includes('.js:')) {
        commentType = 'JavaScript help text';
    } else if (translation.context.includes('.vue:')) {
        commentType = 'Frontend message';
    } else if (translation.context.includes('workspace/')) {
        commentType = 'Workspace label';
    } else if (translation.context.includes('public/js/')) {
        commentType = 'JavaScript utility';
    } else if (translation.context.includes('controllers/')) {
        commentType = 'Controller message';
    } else if (translation.context.includes('patches/')) {
        commentType = 'Patch message';
    } else if (translation.context.includes('api/')) {
        commentType = 'API message';
    } else if (translation.context.includes('overrides/')) {
        commentType = 'Override message';
    } else if (translation.context.includes('mixins/')) {
        commentType = 'Mixin message';
    }
    
    // Extract DocType name from context if available
    let docTypeName = '';
    const match = translation.context.match(/doctype\/([^\/]+)\//);
    if (match) {
        docTypeName = match[1].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    // Generate comment
    let comment = `#. ${commentType}`;
    if (docTypeName) {
        comment += ` in DocType '${docTypeName}'`;
    }
    
    // Add context reference
    comment += `\n#: ${translation.context}`;
    
    // Handle special characters in message ID
    let messageId = translation.messageId;
    if (messageId.includes('"')) {
        messageId = messageId.replace(/"/g, '\\"');
    }
    
    // Handle special characters in message string
    let messageString = translation.messageString;
    if (messageString.includes('"')) {
        messageString = messageString.replace(/"/g, '\\"');
    }
    
    // Add the PO entry
    poContent += `\n${comment}\nmsgid "${messageId}"\nmsgstr "${messageString}"\n`;
}

// Write the PO file
fs.writeFileSync(path.join(__dirname, 'empty_translations_complete.po'), poContent, 'utf8');

console.log(`Generated PO file with ${translations.length} translations`);
console.log('File saved as: empty_translations_complete.po'); 