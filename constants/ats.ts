/**
 * ATS Generation API Constants
 * Error codes and validation constants for the ATS generation endpoint
 */

/**
 * Error codes for ATS generation endpoint
 */
export const ATS_ERRORS = {
  INVALID_DOCUMENTS: "ATS_INVALID_DOCUMENTS",
  INVALID_FORMAT: "ATS_INVALID_FORMAT",
  INVALID_PERIODO: "ATS_INVALID_PERIODO",
  INVALID_RUC: "ATS_INVALID_RUC",
  INVALID_CSV_SECTION: "ATS_INVALID_CSV_SECTION",
  GENERATION_FAILED: "ATS_GENERATION_FAILED",
  INVALID_REQUEST: "ATS_INVALID_REQUEST",
} as const;

/**
 * Maximum number of documents allowed per request
 */
export const MAX_DOCUMENTS_PER_REQUEST = 10000;

/**
 * Valid periodo format (YYYY-MM)
 */
export const PERIODO_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Valid RUC format (13 digits)
 */
export const RUC_REGEX = /^\d{13}$/;
