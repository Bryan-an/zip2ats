/**
 * Main ZIP processor - orchestrates extraction and parsing
 */

import { extractXMLsFromZip } from "./extractor";
import { parseXMLBatch } from "@/lib/parser/xml-parser";
import type { BatchProcessResult, FileProcessResult, ZipError } from "./types";
import type { ParserOptions } from "@/types/sri-xml";
import { ZIP_ERRORS } from "./errors";

/**
 * Process a ZIP file containing SRI XML documents
 *
 * @param buffer - ZIP file as ArrayBuffer or Uint8Array
 * @param options - Parser options to apply to all XML files
 * @returns Batch processing result with all parsed documents
 */
export async function processZipFile(
  buffer: ArrayBuffer | Uint8Array,
  options: ParserOptions = {}
): Promise<BatchProcessResult> {
  // Step 1: Extract XML files from ZIP
  const extractionResult = await extractXMLsFromZip(buffer);

  if (!extractionResult.success) {
    return {
      totalFiles:
        extractionResult.files.length + extractionResult.skipped.length,
      xmlFiles: extractionResult.files.length,
      processed: 0,
      failed: 0,
      skipped: extractionResult.skipped,
      results: [],
      errors: extractionResult.errors || [],
    };
  }

  const xmlFiles = extractionResult.files;
  const xmlContents = xmlFiles.map((file) => file.content);

  // Step 2: Parse all XMLs in batch
  const parseResults = await parseXMLBatch(xmlContents, options);

  // Step 3: Map parse results back to filenames and aggregate
  const results: FileProcessResult[] = [];
  const errors: ZipError[] = [...(extractionResult.errors || [])];
  let processed = 0;
  let failed = 0;

  for (let i = 0; i < xmlFiles.length; i++) {
    const file = xmlFiles[i];
    const parseResult = parseResults[i];

    results.push({
      filename: file.filename,
      result: parseResult,
    });

    if (parseResult.success) {
      processed++;
    } else {
      failed++;

      // Add parse errors to batch errors
      if (parseResult.errors) {
        for (const error of parseResult.errors) {
          errors.push({
            code: ZIP_ERRORS.EXTRACTION_FAILED,
            message: `Error al procesar ${file.filename}: ${error.message}`,
            filename: file.filename,
          });
        }
      }
    }
  }

  return {
    totalFiles: xmlFiles.length + extractionResult.skipped.length,
    xmlFiles: xmlFiles.length,
    processed,
    failed,
    skipped: extractionResult.skipped,
    results,
    errors,
  };
}

/**
 * Process a ZIP file from a base64-encoded string
 *
 * Convenience function for API routes that receive base64 data
 *
 * @param base64 - Base64-encoded ZIP file
 * @param options - Parser options to apply to all XML files
 * @returns Batch processing result with all parsed documents
 */
export async function processZipFileFromBase64(
  base64: string,
  options: ParserOptions = {}
): Promise<BatchProcessResult> {
  try {
    // Decode base64 to binary
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return processZipFile(bytes, options);
  } catch (error) {
    return {
      totalFiles: 0,
      xmlFiles: 0,
      processed: 0,
      failed: 0,
      skipped: [],
      results: [],
      errors: [
        {
          code: ZIP_ERRORS.INVALID_ZIP,
          message: `Error al decodificar base64: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}
