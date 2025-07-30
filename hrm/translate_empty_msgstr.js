const fs = require("fs");
const path = require("path");

// * Configuration variables
const PO_FILE_PATH = "th_updated.po";
const DICTIONARY_FILE_PATH = "dictionary.md";
const OUTPUT_FILE_PATH = "th_updated_translated.po";

// * Load dictionary
function loadDictionary() {
  const dictionaryContent = fs.readFileSync(DICTIONARY_FILE_PATH, "utf8");
  const dictionary = {};

  // * Parse markdown table format
  const lines = dictionaryContent.split("\n");
  let inTable = false;

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

// * Find exact or partial matches in dictionary
function findTranslation(msgid, dictionary) {
  const cleanMsgid = msgid.trim();

  // * Try exact match first
  if (dictionary[cleanMsgid.toLowerCase()]) {
    return dictionary[cleanMsgid.toLowerCase()];
  }

  // * Try partial matches for longer strings
  const words = cleanMsgid.split(/\s+/);
  if (words.length > 1) {
    // * Try to find translations for individual words and combine them
    const translatedWords = words.map((word) => {
      const cleanWord = word.replace(/[^\w\s]/g, "").toLowerCase();
      return dictionary[cleanWord] || word;
    });

    // * If we found some translations, return the combined result
    const hasTranslations = translatedWords.some((word) => dictionary[word.toLowerCase()]);
    if (hasTranslations) {
      return translatedWords.join(" ");
    }
  }

  // * Try to find similar entries (case-insensitive partial match)
  for (const [english, thai] of Object.entries(dictionary)) {
    if (cleanMsgid.toLowerCase().includes(english) || english.includes(cleanMsgid.toLowerCase())) {
      return thai;
    }
  }

  return null;
}

// * Process PO file and translate empty msgstr entries
function translateEmptyMsgstr() {
  console.log("* Starting translation of empty msgstr entries...");

  const dictionary = loadDictionary();
  const poContent = fs.readFileSync(PO_FILE_PATH, "utf8");
  const lines = poContent.split("\n");

  let translatedCount = 0;
  let skippedCount = 0;
  const translations = [];

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
        const translation = findTranslation(msgid, dictionary);
        if (translation) {
          lines[i] = `msgstr "${translation}"`;
          translatedCount++;
          translations.push({ msgid, translation });
          console.log(`* Translated: "${msgid}" -> "${translation}"`);
        } else {
          skippedCount++;
          console.log(`! No translation found for: "${msgid}"`);
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
  console.log(`  - Skipped (no dictionary match): ${skippedCount}`);
  console.log(`  - Output file: ${OUTPUT_FILE_PATH}`);

  // * Save translation log
  const logContent = translations.map((t) => `${t.msgid} -> ${t.translation}`).join("\n");
  fs.writeFileSync("translation_log.txt", logContent, "utf8");
  console.log(`  - Translation log saved to: translation_log.txt`);

  return { translatedCount, skippedCount, translations };
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

module.exports = { translateEmptyMsgstr, loadDictionary, findTranslation };
