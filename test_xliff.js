#!/usr/bin/env node

/**
 * Test script for XLIFF Split and Merge Tool
 *
 * This script demonstrates the functionality by:
 * 1. Creating a sample XLIFF file
 * 2. Splitting it into chunks
 * 3. Merging the chunks back
 * 4. Validating the result
 */

const fs = require("fs");
const path = require("path");
const { splitXliff, mergeXliff, validateXliff, parseXliffFile } = require("./split_xliff.js");

// * Configuration variables
const TEST_XLIFF_FILE = "./test_sample.xliff";
const TEST_CHUNKS_DIR = "./test_chunks";
const TEST_MERGED_FILE = "./test_merged.xliff";

/**
 * Create a sample XLIFF file for testing
 */
function createSampleXliff() {
  const sampleXliff = `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file id="test-file" original="test.pot" source-language="en" target-language="th" datatype="plaintext">
    <header>
      <tool tool-id="test-tool" tool-name="Test Tool" tool-version="1.0"/>
    </header>
    <body>
      <trans-unit id="1" resname="Hello">
        <source>Hello</source>
        <target state="needs-translation">Hello</target>
        <context-group purpose="information">
          <context context-type="source">test.js:1</context>
        </context-group>
      </trans-unit>
      <trans-unit id="2" resname="World">
        <source>World</source>
        <target state="needs-translation">World</target>
        <context-group purpose="information">
          <context context-type="source">test.js:2</context>
        </context-group>
      </trans-unit>
      <trans-unit id="3" resname="Welcome">
        <source>Welcome</source>
        <target state="needs-translation">Welcome</target>
        <context-group purpose="information">
          <context context-type="source">test.js:3</context>
        </context-group>
      </trans-unit>
      <trans-unit id="4" resname="Goodbye">
        <source>Goodbye</source>
        <target state="needs-translation">Goodbye</target>
        <context-group purpose="information">
          <context context-type="source">test.js:4</context>
        </context-group>
      </trans-unit>
      <trans-unit id="5" resname="Thank you">
        <source>Thank you</source>
        <target state="needs-translation">Thank you</target>
        <context-group purpose="information">
          <context context-type="source">test.js:5</context>
        </context-group>
      </trans-unit>
    </body>
  </file>
</xliff>`;

  fs.writeFileSync(TEST_XLIFF_FILE, sampleXliff);
  console.log(`* Created sample XLIFF file: ${TEST_XLIFF_FILE}`);
}

/**
 * Clean up test files
 */
function cleanup() {
  const filesToRemove = [TEST_XLIFF_FILE, TEST_MERGED_FILE];

  const dirsToRemove = [TEST_CHUNKS_DIR];

  // * Remove files
  filesToRemove.forEach((file) => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`* Removed: ${file}`);
    }
  });

  // * Remove directories
  dirsToRemove.forEach((dir) => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`* Removed directory: ${dir}`);
    }
  });
}

/**
 * Validate that two XLIFF files are equivalent
 * @param {string} file1 - First file path
 * @param {string} file2 - Second file path
 * @returns {boolean} - True if equivalent
 */
function validateEquivalence(file1, file2) {
  try {
    const { doc: doc1 } = parseXliffFile(file1);
    const { doc: doc2 } = parseXliffFile(file2);

    // * Get all trans-units from both files
    const transUnits1 = doc1.getElementsByTagName("trans-unit");
    const transUnits2 = doc2.getElementsByTagName("trans-unit");

    if (transUnits1.length !== transUnits2.length) {
      console.error(`! Error: Different number of trans-units: ${transUnits1.length} vs ${transUnits2.length}`);
      return false;
    }

    // * Compare each trans-unit
    for (let i = 0; i < transUnits1.length; i++) {
      const tu1 = transUnits1[i];
      const tu2 = transUnits2[i];

      const source1 = tu1.getElementsByTagName("source")[0]?.textContent;
      const source2 = tu2.getElementsByTagName("source")[0]?.textContent;

      if (source1 !== source2) {
        console.error(`! Error: Different source text at index ${i}: "${source1}" vs "${source2}"`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error(`! Error comparing files: ${error.message}`);
    return false;
  }
}

/**
 * Run the test suite
 */
async function runTests() {
  console.log("=== XLIFF Split and Merge Tool Test Suite ===\n");

  try {
    // * Clean up any existing test files
    cleanup();

    // * Test 1: Create sample XLIFF
    console.log("Test 1: Creating sample XLIFF file...");
    createSampleXliff();

    // * Test 2: Validate sample XLIFF
    console.log("\nTest 2: Validating sample XLIFF...");
    const { doc } = parseXliffFile(TEST_XLIFF_FILE);
    if (validateXliff(doc)) {
      console.log("* Sample XLIFF validation: PASSED");
    } else {
      throw new Error("Sample XLIFF validation failed");
    }

    // * Test 3: Split XLIFF into chunks
    console.log("\nTest 3: Splitting XLIFF into chunks...");
    const manifest = splitXliff(TEST_XLIFF_FILE, {
      chunkSize: 2, // Small chunks for testing
      outputDir: TEST_CHUNKS_DIR,
      validate: true,
      verbose: true,
    });

    console.log(`* Split test: PASSED (${manifest.totalChunks} chunks created)`);

    // * Test 4: Verify chunks exist
    console.log("\nTest 4: Verifying chunk files...");
    const chunkFiles = fs
      .readdirSync(TEST_CHUNKS_DIR)
      .filter((file) => file.endsWith(".xliff"))
      .map((file) => path.join(TEST_CHUNKS_DIR, file));

    if (chunkFiles.length === manifest.totalChunks) {
      console.log(`* Chunk verification: PASSED (${chunkFiles.length} files found)`);
    } else {
      throw new Error(`Expected ${manifest.totalChunks} chunks, found ${chunkFiles.length}`);
    }

    // * Test 5: Validate each chunk
    console.log("\nTest 5: Validating chunk files...");
    for (const chunkFile of chunkFiles) {
      const { doc: chunkDoc } = parseXliffFile(chunkFile);
      if (!validateXliff(chunkDoc)) {
        throw new Error(`Chunk validation failed: ${chunkFile}`);
      }
    }
    console.log("* Chunk validation: PASSED");

    // * Test 6: Merge chunks back
    console.log("\nTest 6: Merging chunks back...");
    const mergeResult = mergeXliff(TEST_CHUNKS_DIR, {
      outputFile: TEST_MERGED_FILE,
      validate: true,
      verbose: true,
    });

    console.log(`* Merge test: PASSED (${mergeResult.totalTransUnits} trans-units merged)`);

    // * Test 7: Validate merged file
    console.log("\nTest 7: Validating merged file...");
    const { doc: mergedDoc } = parseXliffFile(TEST_MERGED_FILE);
    if (validateXliff(mergedDoc)) {
      console.log("* Merged file validation: PASSED");
    } else {
      throw new Error("Merged file validation failed");
    }

    // * Test 8: Compare original and merged files
    console.log("\nTest 8: Comparing original and merged files...");
    if (validateEquivalence(TEST_XLIFF_FILE, TEST_MERGED_FILE)) {
      console.log("* File equivalence: PASSED");
    } else {
      throw new Error("Original and merged files are not equivalent");
    }

    // * Test 9: Test size-based splitting
    console.log("\nTest 9: Testing size-based splitting...");
    const sizeBasedManifest = splitXliff(TEST_XLIFF_FILE, {
      sizeBased: true,
      maxSize: 1000, // Small size for testing
      outputDir: TEST_CHUNKS_DIR + "_size",
      validate: true,
      verbose: true,
    });

    console.log(`* Size-based split: PASSED (${sizeBasedManifest.totalChunks} chunks created)`);

    // * Clean up size-based test
    if (fs.existsSync(TEST_CHUNKS_DIR + "_size")) {
      fs.rmSync(TEST_CHUNKS_DIR + "_size", { recursive: true, force: true });
    }

    console.log("\n=== All Tests PASSED ===");
    console.log("\nThe XLIFF Split and Merge Tool is working correctly!");
  } catch (error) {
    console.error(`\n! Test FAILED: ${error.message}`);
    process.exit(1);
  } finally {
    // * Clean up test files
    console.log("\nCleaning up test files...");
    cleanup();
  }
}

// * Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  createSampleXliff,
  cleanup,
  validateEquivalence,
  runTests,
};
