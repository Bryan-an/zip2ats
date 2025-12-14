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
 * Maximum number of documents allowed per request.
 *
 * IMPORTANT (DoS/OOM guardrails):
 * - This is only a "count" limit. It does NOT cap total request payload size.
 * - `request.json()` buffers the entire body before validation, so callers MUST
 *   enforce an inbound request-body size cap at the edge/proxy/platform (CDN,
 *   reverse proxy, WAF, etc.) to prevent memory spikes and OOM.
 * - Clients should chunk large workloads into multiple smaller requests
 *   (batching) instead of sending massive arrays in a single call.
 * - If you raise this limit, ensure downstream processing is chunked/streamed
 *   and avoid building huge intermediate in-memory structures.
 *
 * Config:
 * - Override via `NEXT_PUBLIC_ATS_MAX_DOCUMENTS_PER_REQUEST` (clamped to a hard
 *   ceiling to avoid accidental spikes).
 */
const DEFAULT_MAX_DOCUMENTS_PER_REQUEST = 1000;
const HARD_MAX_DOCUMENTS_PER_REQUEST = 2000;

const envMaxDocumentsPerRequest = Number.parseInt(
  process.env.NEXT_PUBLIC_ATS_MAX_DOCUMENTS_PER_REQUEST ?? "",
  10
);

export const MAX_DOCUMENTS_PER_REQUEST =
  Number.isFinite(envMaxDocumentsPerRequest) && envMaxDocumentsPerRequest > 0
    ? Math.min(envMaxDocumentsPerRequest, HARD_MAX_DOCUMENTS_PER_REQUEST)
    : DEFAULT_MAX_DOCUMENTS_PER_REQUEST;

/**
 * Valid periodo format (YYYY-MM)
 */
export const PERIODO_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Valid RUC format (13 digits)
 */
export const RUC_REGEX = /^\d{13}$/;
