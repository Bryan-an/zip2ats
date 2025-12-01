/**
 * Types for ZIP processing module
 */

import type { ParserResult } from "@/types/sri-xml";
import type { ZipErrorCode } from "./errors";

/**
 * Extracted file from ZIP archive
 */
export interface ExtractedFile {
  filename: string;
  content: string; // XML string (decoded UTF-8)
  size: number;
}

/**
 * Error from ZIP processing
 */
export interface ZipError {
  code: ZipErrorCode;
  message: string;
  filename?: string;
}

/**
 * Result of extracting XML files from ZIP
 */
export interface ZipExtractionResult {
  success: boolean;
  files: ExtractedFile[];
  skipped: string[]; // Non-XML files skipped
  errors?: ZipError[];
}

/**
 * Result of processing a single XML file
 */
export interface FileProcessResult {
  filename: string;
  result: ParserResult;
}

/**
 * Result of processing an entire ZIP file
 */
export interface BatchProcessResult {
  totalFiles: number;
  xmlFiles: number;
  processed: number;
  failed: number;
  skipped: string[];
  results: FileProcessResult[];
  errors: ZipError[];
}
