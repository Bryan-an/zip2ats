/**
 * Centralized error codes for the ZIP processor module
 */

export const ZIP_ERRORS = {
  // ZIP file errors
  INVALID_ZIP: "INVALID_ZIP",
  EMPTY_ZIP: "EMPTY_ZIP",
  NO_XML_FILES: "NO_XML_FILES",
  EXTRACTION_FAILED: "EXTRACTION_FAILED",
} as const;

export type ZipErrorCode = (typeof ZIP_ERRORS)[keyof typeof ZIP_ERRORS];
