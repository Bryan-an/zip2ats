/**
 * Normalizer utilities for SRI XML data
 * Handles date conversion, monetary values, and array normalization
 */

/**
 * Parse SRI date format (DD/MM/YYYY) to ISO date (YYYY-MM-DD)
 */
export function parseSRIDate(dateStr: string): string {
  if (!dateStr) return "";

  // Handle DD/MM/YYYY format
  const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateStr.match(ddmmyyyy);

  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }

  // If already ISO format, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  return dateStr;
}

/**
 * Parse SRI datetime format to ISO datetime
 * Handles formats like: "DD/MM/YYYY HH:mm:ss" or "YYYY-MM-DDTHH:mm:ss"
 */
export function parseSRIDateTime(dateTimeStr: string): string {
  if (!dateTimeStr) return "";

  // Handle DD/MM/YYYY HH:mm:ss format
  const ddmmyyyyTime = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/;
  const match = dateTimeStr.match(ddmmyyyyTime);

  if (match) {
    const [, day, month, year, hour, min, sec] = match;
    return `${year}-${month}-${day}T${hour}:${min}:${sec}`;
  }

  // If already ISO format, return as-is
  if (/^\d{4}-\d{2}-\d{2}T/.test(dateTimeStr)) {
    return dateTimeStr;
  }

  return dateTimeStr;
}

/**
 * Parse period format (MM/YYYY) to ISO period (YYYY-MM)
 */
export function parseSRIPeriod(periodStr: string): string {
  if (!periodStr) return "";

  const mmyyyy = /^(\d{2})\/(\d{4})$/;
  const match = periodStr.match(mmyyyy);

  if (match) {
    const [, month, year] = match;
    return `${year}-${month}`;
  }

  return periodStr;
}

/**
 * Convert decimal string to cents (integer)
 * "123.45" -> 12345
 * "100" -> 10000
 */
export function parseMoneyToCents(value: string | number | undefined): number {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return 0;
  }

  // Round to avoid floating point issues
  return Math.round(numValue * 100);
}

/**
 * Convert cents to decimal number
 * 12345 -> 123.45
 */
export function centsToMoney(cents: number): number {
  return cents / 100;
}

/**
 * Ensure value is always an array
 * SRI XML can have single item or array of items
 */
export function ensureArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

/**
 * Clean and normalize string values
 */
export function normalizeString(value: string | undefined | null): string {
  if (!value) return "";
  return String(value).trim();
}

/**
 * Extract RUC check digit (9th digit at index 8)
 * The Ecuadorian RUC validation digit is at position 9 of the 13-digit RUC
 */
export function getRUCValidationDigit(ruc: string): string | null {
  if (!ruc || ruc.length !== 13) return null;
  return ruc.charAt(8);
}

/**
 * Validate RUC format (13 digits)
 */
export function isValidRUCFormat(ruc: string): boolean {
  return /^\d{13}$/.test(ruc);
}

/**
 * Validate Cédula format (10 digits)
 */
export function isValidCedulaFormat(cedula: string): boolean {
  return /^\d{10}$/.test(cedula);
}

/**
 * Parse percentage string to number
 * "12.00" -> 12
 * "15%" -> 15
 */
export function parsePercentage(value: string | undefined): number {
  if (!value) return 0;

  const cleaned = value.replace("%", "").trim();
  const num = parseFloat(cleaned);

  return isNaN(num) ? 0 : num;
}

/**
 * Get document number from parts (estab-ptoEmi-secuencial)
 */
export function formatDocumentNumber(
  estab: string,
  ptoEmi: string,
  secuencial: string
): string {
  return `${estab}-${ptoEmi}-${secuencial}`;
}
