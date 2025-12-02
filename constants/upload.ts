/**
 * Upload configuration constants
 */

/**
 * FormData field name for ZIP file uploads
 */
export const ZIP_FILE_FIELD_NAME = "file";

/**
 * Maximum file size for ZIP uploads (50MB)
 */
export const MAX_ZIP_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Allowed MIME types for ZIP files (server-side validation)
 */
export const ALLOWED_ZIP_MIME_TYPES = [
  "application/zip",
  "application/x-zip-compressed",
  "application/x-zip",
  "multipart/x-zip",
] as const;

/**
 * Upload API error codes
 */
export const UPLOAD_ERRORS = {
  NO_FILE: "NO_FILE",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  PROCESSING_FAILED: "PROCESSING_FAILED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type UploadErrorCode =
  (typeof UPLOAD_ERRORS)[keyof typeof UPLOAD_ERRORS];
