const fs = require("fs");
const path = require("path");

/**
 * Removes all # command lines from a .po file
 * @param {string} inputFile - Path to the input .po file
 * @param {string} outputFile - Path to the output .po file (optional, defaults to input with _cleaned suffix)
 */
function removeHashCommands(inputFile, outputFile = null) {
  try {
    // * Read the input file
    console.log(`Reading file: ${inputFile}`);
    const content = fs.readFileSync(inputFile, "utf8");

    // * Split content into lines
    const lines = content.split("\n");

    // * Filter out lines that start with # (hash commands)
    const filteredLines = lines.filter((line) => {
      const trimmedLine = line.trim();
      // * Keep lines that don't start with # or are empty
      return !trimmedLine.startsWith("#") || trimmedLine === "";
    });

    // * Join lines back together
    const cleanedContent = filteredLines.join("\n");

    // * Determine output file name
    if (!outputFile) {
      const ext = path.extname(inputFile);
      const baseName = path.basename(inputFile, ext);
      const dir = path.dirname(inputFile);
      outputFile = path.join(dir, `${baseName}_cleaned${ext}`);
    }

    // * Write the cleaned content to output file
    fs.writeFileSync(outputFile, cleanedContent, "utf8");

    // * Calculate statistics
    const originalLines = lines.length;
    const cleanedLines = filteredLines.length;
    const removedLines = originalLines - cleanedLines;

    console.log(`✅ Successfully processed file:`);
    console.log(`   Original lines: ${originalLines}`);
    console.log(`   Lines after cleaning: ${cleanedLines}`);
    console.log(`   Removed lines: ${removedLines}`);
    console.log(`   Output file: ${outputFile}`);

    return {
      success: true,
      originalLines,
      cleanedLines,
      removedLines,
      outputFile,
    };
  } catch (error) {
    console.error(`❌ Error processing file: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Main function to process the erpnext.po file
 */
function main() {
  const inputFile = path.join(__dirname, "erpnext.po");

  // * Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Input file not found: ${inputFile}`);
    process.exit(1);
  }

  // * Process the file
  const result = removeHashCommands(inputFile);

  if (result.success) {
    console.log("\n🎉 File processing completed successfully!");
  } else {
    console.error("\n💥 File processing failed!");
    process.exit(1);
  }
}

// * Run the script if called directly
if (require.main === module) {
  main();
}

module.exports = { removeHashCommands };
