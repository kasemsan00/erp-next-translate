const fs = require("fs");
const path = require("path");

// * Configuration variables
const PO_FILE_PATH = "th_updated.po";
const DICTIONARY_FILE_PATH = "dictionary.md";
const OUTPUT_FILE_PATH = "th_updated_translated_improved.po";

// * Load dictionary
function loadDictionary() {
  const dictionaryContent = fs.readFileSync(DICTIONARY_FILE_PATH, "utf8");
  const dictionary = {};

  // * Parse markdown table format
  const lines = dictionaryContent.split("\n");

  for (const line of lines) {
    const trimmedLine = line.trim();

    // * Skip empty lines and header separator
    if (!trimmedLine || trimmedLine.startsWith("|:") || trimmedLine === "|") {
      continue;
    }

    // * Check if this is a table row
    if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) {
      const parts = trimmedLine
        .split("|")
        .map((part) => part.trim())
        .filter((part) => part);

      if (parts.length >= 2) {
        const english = parts[0];
        const thai = parts[1];

        // * Skip header row
        if (english === "English" || thai === "Thai") {
          continue;
        }

        if (english && thai) {
          dictionary[english.toLowerCase()] = thai;
        }
      }
    }
  }

  console.log(`* Loaded ${Object.keys(dictionary).length} dictionary entries`);
  return dictionary;
}

// * Check if string should be skipped (numeric values, time formats, etc.)
function shouldSkipTranslation(msgid) {
  const cleanMsgid = msgid.trim();

  // * Skip numeric values
  if (/^\d+(\.\d+)?$/.test(cleanMsgid)) {
    return true;
  }

  // * Skip time formats (HH:MM)
  if (/^\d{1,2}:\d{2}$/.test(cleanMsgid)) {
    return true;
  }

  // * Skip HTML tags only
  if (/^<[^>]+>$/.test(cleanMsgid)) {
    return true;
  }

  // * Skip very short strings (likely abbreviations)
  if (cleanMsgid.length <= 2) {
    return true;
  }

  return false;
}

// * Find exact or partial matches in dictionary with improved logic
function findTranslation(msgid, dictionary) {
  const cleanMsgid = msgid.trim();

  // * Skip certain types of strings
  if (shouldSkipTranslation(cleanMsgid)) {
    return null;
  }

  // * Try exact match first
  if (dictionary[cleanMsgid.toLowerCase()]) {
    return dictionary[cleanMsgid.toLowerCase()];
  }

  // * Try to find the best partial match
  let bestMatch = null;
  let bestScore = 0;

  for (const [english, thai] of Object.entries(dictionary)) {
    const englishLower = english.toLowerCase();
    const msgidLower = cleanMsgid.toLowerCase();

    // * Check if the English term is contained in the msgid
    if (msgidLower.includes(englishLower)) {
      const score = englishLower.length / msgidLower.length;
      if (score > bestScore && score > 0.3) {
        // * Minimum 30% match
        bestScore = score;
        bestMatch = thai;
      }
    }

    // * Check if msgid is contained in the English term
    if (englishLower.includes(msgidLower)) {
      const score = msgidLower.length / englishLower.length;
      if (score > bestScore && score > 0.5) {
        // * Minimum 50% match
        bestScore = score;
        bestMatch = thai;
      }
    }
  }

  return bestMatch;
}

// * Process PO file and translate empty msgstr entries
function translateEmptyMsgstr() {
  console.log("* Starting improved translation of empty msgstr entries...");

  const dictionary = loadDictionary();
  const poContent = fs.readFileSync(PO_FILE_PATH, "utf8");
  const lines = poContent.split("\n");

  let translatedCount = 0;
  let skippedCount = 0;
  const translations = [];
  const skippedEntries = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // * Look for empty msgstr entries
    if (line.trim() === 'msgstr ""') {
      // * Find the corresponding msgid
      let msgid = "";
      let j = i - 1;

      // * Look backwards for msgid
      while (j >= 0) {
        if (lines[j].startsWith("msgid ")) {
          msgid = lines[j].substring(6).trim();
          // * Remove quotes if present
          if (msgid.startsWith('"') && msgid.endsWith('"')) {
            msgid = msgid.slice(1, -1);
          }
          break;
        }
        j--;
      }

      if (msgid) {
        if (shouldSkipTranslation(msgid)) {
          skippedCount++;
          skippedEntries.push(msgid);
          console.log(`* Skipped (numeric/time/HTML): "${msgid}"`);
        } else {
          const translation = findTranslation(msgid, dictionary);
          if (translation) {
            lines[i] = `msgstr "${translation}"`;
            translatedCount++;
            translations.push({ msgid, translation });
            console.log(`* Translated: "${msgid}" -> "${translation}"`);
          } else {
            skippedCount++;
            skippedEntries.push(msgid);
            console.log(`! No translation found for: "${msgid}"`);
          }
        }
      }
    }
  }

  // * Write the updated content
  const updatedContent = lines.join("\n");
  fs.writeFileSync(OUTPUT_FILE_PATH, updatedContent, "utf8");

  console.log(`\n* Translation Summary:`);
  console.log(`  - Total empty msgstr entries processed: ${translatedCount + skippedCount}`);
  console.log(`  - Successfully translated: ${translatedCount}`);
  console.log(`  - Skipped (no match or should skip): ${skippedCount}`);
  console.log(`  - Output file: ${OUTPUT_FILE_PATH}`);

  // * Save translation log
  const logContent = translations.map((t) => `${t.msgid} -> ${t.translation}`).join("\n");
  fs.writeFileSync("translation_log_improved.txt", logContent, "utf8");

  // * Save skipped entries log
  const skippedContent = skippedEntries.join("\n");
  fs.writeFileSync("skipped_entries.txt", skippedContent, "utf8");

  console.log(`  - Translation log saved to: translation_log_improved.txt`);
  console.log(`  - Skipped entries saved to: skipped_entries.txt`);

  return { translatedCount, skippedCount, translations, skippedEntries };
}

// * Main execution
if (require.main === module) {
  try {
    translateEmptyMsgstr();
  } catch (error) {
    console.error("! Error during translation:", error.message);
    process.exit(1);
  }
}

module.exports = { translateEmptyMsgstr, loadDictionary, findTranslation, shouldSkipTranslation };
