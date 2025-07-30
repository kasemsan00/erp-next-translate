#!/usr/bin/env node

/**
 * XLIFF Split and Merge Tool
 *
 * This tool helps split large XLIFF files into smaller chunks for easier translation
 * and then merge the translated chunks back into a single XLIFF file.
 *
 * Features:
 * - Split XLIFF files by number of trans-units or file size
 * - Merge translated chunks back into original structure
 * - Progress tracking with tqdm-style output
 * - Validation of XLIFF structure
 * - CLI support with intuitive arguments
 * - Preserves all XLIFF metadata and context
 */

const fs = require("fs");
const path = require("path");
const { DOMParser, XMLSerializer } = require("@xmldom/xmldom");

// * Configuration variables
const DEFAULT_CHUNK_SIZE = 100; // Number of trans-units per chunk
const DEFAULT_OUTPUT_DIR = "./xliff_chunks";
const DEFAULT_MERGE_OUTPUT = "./merged_output.xliff";
const VALID_XLIFF_VERSIONS = ["1.0", "1.1", "1.2", "2.0", "2.1"];

/**
 * Display help information
 */
function showHelp() {
  console.log(`
XLIFF Split and Merge Tool

Usage:
  node split_xliff.js split <input_file> [options]
  node split_xliff.js merge <input_dir> [options]

Commands:
  split    Split a single XLIFF file into multiple chunks
  merge    Merge multiple XLIFF chunks back into a single file

Split Options:
  -c, --chunk-size <number>    Number of trans-units per chunk (default: ${DEFAULT_CHUNK_SIZE})
  -o, --output-dir <path>      Output directory for chunks (default: ${DEFAULT_OUTPUT_DIR})
  -s, --size-based            Split by file size instead of trans-unit count
  -m, --max-size <bytes>       Maximum size per chunk when using size-based splitting

Merge Options:
  -o, --output-file <path>     Output file for merged XLIFF (default: ${DEFAULT_MERGE_OUTPUT})
  -p, --pattern <glob>         File pattern to match for merging (default: *.xliff)

General Options:
  -h, --help                   Show this help message
  -v, --verbose               Enable verbose output
  --validate                  Validate XLIFF structure before processing

Examples:
  node split_xliff.js split "[frappe.crm] develop_th.xliff" -c 50
  node split_xliff.js split "[frappe.crm] develop_th.xliff" -s -m 1024000
  node split_xliff.js merge ./xliff_chunks -o merged.xliff
  node split_xliff.js merge ./xliff_chunks --pattern "*_chunk_*.xliff"
`);
}

/**
 * Display progress bar
 * @param {number} current - Current progress value
 * @param {number} total - Total value
 * @param {string} label - Progress label
 */
function showProgress(current, total, label = "Progress") {
  const percentage = Math.round((current / total) * 100);
  const barLength = 30;
  const filledLength = Math.round((barLength * current) / total);
  const bar = "█".repeat(filledLength) + "░".repeat(barLength - filledLength);

  process.stdout.write(`\r${label}: [${bar}] ${percentage}% (${current}/${total})`);

  if (current === total) {
    process.stdout.write("\n");
  }
}

/**
 * Validate XLIFF structure
 * @param {Document} doc - XML document to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateXliff(doc) {
  try {
    const xliffElement = doc.documentElement;

    // * Check if root element is xliff
    if (xliffElement.tagName !== "xliff") {
      console.error('! Error: Root element must be "xliff"');
      return false;
    }

    // * Check version attribute
    const version = xliffElement.getAttribute("version");
    if (!version || !VALID_XLIFF_VERSIONS.includes(version)) {
      console.error(`! Error: Invalid XLIFF version: ${version}`);
      return false;
    }

    // * Check for file elements
    const files = xliffElement.getElementsByTagName("file");
    if (files.length === 0) {
      console.error("! Error: No file elements found in XLIFF");
      return false;
    }

    // * Check each file element
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const body = file.getElementsByTagName("body")[0];

      if (!body) {
        console.error(`! Error: File ${i + 1} missing body element`);
        return false;
      }

      const transUnits = body.getElementsByTagName("trans-unit");
      if (transUnits.length === 0) {
        console.error(`! Error: File ${i + 1} has no trans-unit elements`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("! Error validating XLIFF:", error.message);
    return false;
  }
}

/**
 * Parse XLIFF file and return structured data
 * @param {string} filePath - Path to XLIFF file
 * @returns {Object} - Parsed XLIFF data
 */
function parseXliffFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/xml");

    // * Check for parsing errors
    const errors = doc.getElementsByTagName("parsererror");
    if (errors.length > 0) {
      throw new Error("XML parsing failed: " + errors[0].textContent);
    }

    return {
      doc,
      content,
      filePath,
    };
  } catch (error) {
    throw new Error(`Failed to parse XLIFF file: ${error.message}`);
  }
}

/**
 * Split XLIFF file into chunks
 * @param {string} inputFile - Input XLIFF file path
 * @param {Object} options - Split options
 */
function splitXliff(inputFile, options = {}) {
  const {
    chunkSize = DEFAULT_CHUNK_SIZE,
    outputDir = DEFAULT_OUTPUT_DIR,
    sizeBased = false,
    maxSize = 1024000, // 1MB default
    validate = false,
    verbose = false,
  } = options;

  console.log(`* Splitting XLIFF file: ${inputFile}`);
  console.log(`* Output directory: ${outputDir}`);
  console.log(`* Chunk size: ${sizeBased ? `${maxSize} bytes` : `${chunkSize} trans-units`}`);

  // * Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    if (verbose) console.log(`* Created output directory: ${outputDir}`);
  }

  // * Parse input file
  const { doc, content } = parseXliffFile(inputFile);

  // * Validate if requested
  if (validate && !validateXliff(doc)) {
    throw new Error("XLIFF validation failed");
  }

  const xliffElement = doc.documentElement;
  const files = xliffElement.getElementsByTagName("file");

  if (files.length === 0) {
    throw new Error("No file elements found in XLIFF");
  }

  let totalChunks = 0;
  const chunkFiles = [];

  // * Process each file element
  for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
    const file = files[fileIndex];
    const body = file.getElementsByTagName("body")[0];
    const transUnits = body.getElementsByTagName("trans-unit");

    if (verbose) {
      console.log(`* Processing file ${fileIndex + 1}/${files.length}: ${transUnits.length} trans-units`);
    }

    if (transUnits.length === 0) {
      console.log(`! Warning: File ${fileIndex + 1} has no trans-units, skipping`);
      continue;
    }

    // * Split trans-units into chunks
    const chunks = [];
    let currentChunk = [];
    let currentSize = 0;

    for (let i = 0; i < transUnits.length; i++) {
      const transUnit = transUnits[i];
      const transUnitXml = new XMLSerializer().serializeToString(transUnit);

      if (sizeBased) {
        // * Size-based splitting
        if (currentSize + transUnitXml.length > maxSize && currentChunk.length > 0) {
          chunks.push([...currentChunk]);
          currentChunk = [transUnit];
          currentSize = transUnitXml.length;
        } else {
          currentChunk.push(transUnit);
          currentSize += transUnitXml.length;
        }
      } else {
        // * Count-based splitting
        currentChunk.push(transUnit);
        if (currentChunk.length >= chunkSize) {
          chunks.push([...currentChunk]);
          currentChunk = [];
        }
      }

      if (verbose && i % 100 === 0) {
        showProgress(i + 1, transUnits.length, `Processing trans-units for file ${fileIndex + 1}`);
      }
    }

    // * Add remaining trans-units
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    if (verbose) {
      showProgress(transUnits.length, transUnits.length, `Processing trans-units for file ${fileIndex + 1}`);
    }

    // * Create chunk files
    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex];
      const chunkDoc = doc.implementation.createDocument(null, "xliff", null);
      const chunkXliff = chunkDoc.documentElement;

      // * Copy xliff attributes
      for (let i = 0; i < xliffElement.attributes.length; i++) {
        const attr = xliffElement.attributes[i];
        chunkXliff.setAttribute(attr.name, attr.value);
      }

      // * Create file element for this chunk
      const chunkFile = chunkDoc.createElement("file");

      // * Copy file attributes
      for (let i = 0; i < file.attributes.length; i++) {
        const attr = file.attributes[i];
        chunkFile.setAttribute(attr.name, attr.value);
      }

      // * Add chunk identifier to file id
      const originalId = chunkFile.getAttribute("id");
      chunkFile.setAttribute("id", `${originalId}_chunk_${chunkIndex + 1}`);

      // * Copy header if exists
      const header = file.getElementsByTagName("header")[0];
      if (header) {
        const chunkHeader = header.cloneNode(true);
        chunkFile.appendChild(chunkHeader);
      }

      // * Create body with chunk trans-units
      const chunkBody = chunkDoc.createElement("body");
      chunk.forEach((transUnit) => {
        const clonedTransUnit = transUnit.cloneNode(true);
        chunkBody.appendChild(clonedTransUnit);
      });

      chunkFile.appendChild(chunkBody);
      chunkXliff.appendChild(chunkFile);

      // * Generate chunk filename
      const baseName = path.basename(inputFile, path.extname(inputFile));
      const chunkFileName = `${baseName}_chunk_${String(chunkIndex + 1).padStart(3, "0")}.xliff`;
      const chunkFilePath = path.join(outputDir, chunkFileName);

      // * Write chunk file
      const chunkContent = new XMLSerializer().serializeToString(chunkDoc);
      fs.writeFileSync(chunkFilePath, `<?xml version="1.0" encoding="UTF-8"?>\n${chunkContent}`);

      chunkFiles.push({
        path: chunkFilePath,
        transUnitCount: chunk.length,
        size: fs.statSync(chunkFilePath).size,
      });

      totalChunks++;

      if (verbose) {
        console.log(`* Created chunk: ${chunkFileName} (${chunk.length} trans-units, ${fs.statSync(chunkFilePath).size} bytes)`);
      }
    }
  }

  // * Create manifest file
  const manifest = {
    originalFile: inputFile,
    totalChunks: totalChunks,
    chunkSize: sizeBased ? maxSize : chunkSize,
    sizeBased: sizeBased,
    created: new Date().toISOString(),
    chunks: chunkFiles,
  };

  const manifestPath = path.join(outputDir, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`\n* Split completed successfully!`);
  console.log(`* Total chunks created: ${totalChunks}`);
  console.log(`* Manifest file: ${manifestPath}`);
  console.log(`* Chunks directory: ${outputDir}`);

  return manifest;
}

/**
 * Merge XLIFF chunks back into a single file
 * @param {string} inputDir - Input directory containing chunks
 * @param {Object} options - Merge options
 */
function mergeXliff(inputDir, options = {}) {
  const { outputFile = DEFAULT_MERGE_OUTPUT, pattern = "*.xliff", validate = false, verbose = false } = options;

  console.log(`* Merging XLIFF chunks from: ${inputDir}`);
  console.log(`* Output file: ${outputFile}`);
  console.log(`* File pattern: ${pattern}`);

  // * Check if input directory exists
  if (!fs.existsSync(inputDir)) {
    throw new Error(`Input directory does not exist: ${inputDir}`);
  }

  // * Try to load manifest first
  const manifestPath = path.join(inputDir, "manifest.json");
  let manifest = null;
  let chunkFiles = [];

  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      if (verbose) console.log(`* Found manifest file: ${manifestPath}`);
    } catch (error) {
      console.log(`! Warning: Could not parse manifest file: ${error.message}`);
    }
  }

  // * Get chunk files
  if (manifest && manifest.chunks) {
    chunkFiles = manifest.chunks.map((chunk) => chunk.path);
    if (verbose) console.log(`* Using chunk files from manifest: ${chunkFiles.length} files`);
  } else {
    // * Fallback: scan directory for XLIFF files
    const files = fs.readdirSync(inputDir);
    chunkFiles = files
      .filter((file) => file.endsWith(".xliff") && file !== path.basename(outputFile))
      .map((file) => path.join(inputDir, file))
      .sort(); // * Natural sort for consistent ordering

    if (verbose) console.log(`* Found ${chunkFiles.length} XLIFF files in directory`);
  }

  if (chunkFiles.length === 0) {
    throw new Error("No XLIFF files found to merge");
  }

  // * Parse first chunk to get base structure
  const firstChunk = parseXliffFile(chunkFiles[0]);

  if (validate && !validateXliff(firstChunk.doc)) {
    throw new Error("XLIFF validation failed on first chunk");
  }

  // * Create merged document
  const mergedDoc = firstChunk.doc.implementation.createDocument(null, "xliff", null);
  const mergedXliff = mergedDoc.documentElement;

  // * Copy xliff attributes from first chunk
  const firstXliff = firstChunk.doc.documentElement;
  for (let i = 0; i < firstXliff.attributes.length; i++) {
    const attr = firstXliff.attributes[i];
    mergedXliff.setAttribute(attr.name, attr.value);
  }

  // * Group chunks by original file
  const fileGroups = new Map();

  for (let i = 0; i < chunkFiles.length; i++) {
    const chunkFile = chunkFiles[i];
    if (verbose) {
      showProgress(i + 1, chunkFiles.length, "Parsing chunk files");
    }

    const { doc } = parseXliffFile(chunkFile);
    const files = doc.getElementsByTagName("file");

    for (let j = 0; j < files.length; j++) {
      const file = files[j];
      const fileId = file.getAttribute("id");

      // * Extract original file ID (remove chunk suffix)
      const originalId = fileId.replace(/_chunk_\d+$/, "");

      if (!fileGroups.has(originalId)) {
        fileGroups.set(originalId, {
          file: file,
          chunks: [],
        });
      }

      fileGroups.get(originalId).chunks.push(file);
    }
  }

  if (verbose) {
    showProgress(chunkFiles.length, chunkFiles.length, "Parsing chunk files");
  }

  // * Merge each file group
  let totalTransUnits = 0;

  for (const [originalId, group] of fileGroups) {
    if (verbose) {
      console.log(`* Merging file group: ${originalId} (${group.chunks.length} chunks)`);
    }

    // * Create merged file element
    const mergedFile = mergedDoc.createElement("file");
    const firstFile = group.chunks[0];

    // * Copy file attributes from first chunk (without chunk suffix)
    for (let i = 0; i < firstFile.attributes.length; i++) {
      const attr = firstFile.attributes[i];
      if (attr.name === "id") {
        mergedFile.setAttribute("id", originalId);
      } else {
        mergedFile.setAttribute(attr.name, attr.value);
      }
    }

    // * Copy header from first chunk
    const header = firstFile.getElementsByTagName("header")[0];
    if (header) {
      const mergedHeader = header.cloneNode(true);
      mergedFile.appendChild(mergedHeader);
    }

    // * Create merged body
    const mergedBody = mergedDoc.createElement("body");

    // * Collect all trans-units from all chunks
    for (const chunkFile of group.chunks) {
      const body = chunkFile.getElementsByTagName("body")[0];
      const transUnits = body.getElementsByTagName("trans-unit");

      for (let i = 0; i < transUnits.length; i++) {
        const transUnit = transUnits[i];
        const clonedTransUnit = transUnit.cloneNode(true);
        mergedBody.appendChild(clonedTransUnit);
        totalTransUnits++;
      }
    }

    mergedFile.appendChild(mergedBody);
    mergedXliff.appendChild(mergedFile);
  }

  // * Write merged file
  const mergedContent = new XMLSerializer().serializeToString(mergedDoc);
  fs.writeFileSync(outputFile, `<?xml version="1.0" encoding="UTF-8"?>\n${mergedContent}`);

  console.log(`\n* Merge completed successfully!`);
  console.log(`* Output file: ${outputFile}`);
  console.log(`* Total trans-units: ${totalTransUnits}`);
  console.log(`* File size: ${fs.statSync(outputFile).size} bytes`);

  return {
    outputFile,
    totalTransUnits,
    fileSize: fs.statSync(outputFile).size,
  };
}

/**
 * Parse command line arguments
 * @returns {Object} - Parsed arguments
 */
function parseArguments() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(0);
  }

  const command = args[0];
  const options = {};
  let inputPath = null;

  // * Parse options
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "-c":
      case "--chunk-size":
        options.chunkSize = parseInt(args[++i]);
        break;
      case "-o":
      case "--output-dir":
      case "--output-file":
        if (command === "split") {
          options.outputDir = args[++i];
        } else {
          options.outputFile = args[++i];
        }
        break;
      case "-s":
      case "--size-based":
        options.sizeBased = true;
        break;
      case "-m":
      case "--max-size":
        options.maxSize = parseInt(args[++i]);
        break;
      case "-p":
      case "--pattern":
        options.pattern = args[++i];
        break;
      case "-v":
      case "--verbose":
        options.verbose = true;
        break;
      case "--validate":
        options.validate = true;
        break;
      default:
        if (!inputPath) {
          inputPath = arg;
        } else {
          console.error(`! Error: Unexpected argument: ${arg}`);
          showHelp();
          process.exit(1);
        }
    }
  }

  if (!inputPath) {
    console.error("! Error: Input file/directory is required");
    showHelp();
    process.exit(1);
  }

  return { command, inputPath, options };
}

/**
 * Main function
 */
function main() {
  try {
    const { command, inputPath, options } = parseArguments();

    switch (command) {
      case "split":
        if (!fs.existsSync(inputPath)) {
          throw new Error(`Input file does not exist: ${inputPath}`);
        }
        splitXliff(inputPath, options);
        break;

      case "merge":
        mergeXliff(inputPath, options);
        break;

      default:
        console.error(`! Error: Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error(`! Error: ${error.message}`);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// * Run main function if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  splitXliff,
  mergeXliff,
  validateXliff,
  parseXliffFile,
};
