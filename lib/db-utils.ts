/**
 * Database utility functions
 * Helpers for working with database records and conversions
 */

// =====================================================
// CASE CONVERSION
// =====================================================

/**
 * Converts snake_case keys to camelCase
 * Useful when reading from SQLite (snake_case) to TypeScript (camelCase)
 */
export function toCamelCase<T>(obj: unknown): T {
  if (obj === null || obj === undefined) return obj as T;
  if (typeof obj !== "object") return obj as T;

  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCase(item)) as T;
  }

  const result: Record<string, unknown> = {};

  for (const key in obj as Record<string, unknown>) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );

      result[camelKey] = toCamelCase((obj as Record<string, unknown>)[key]);
    }
  }

  return result as T;
}

/**
 * Converts camelCase keys to snake_case
 * Useful when writing from TypeScript (camelCase) to SQLite (snake_case)
 */
export function toSnakeCase(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => toSnakeCase(item));
  }

  const result: Record<string, unknown> = {};

  for (const key in obj as Record<string, unknown>) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      result[snakeKey] = toSnakeCase((obj as Record<string, unknown>)[key]);
    }
  }

  return result;
}

// =====================================================
// MONETARY CONVERSIONS
// =====================================================

/**
 * Converts dollars to cents to avoid floating point precision issues
 * @param dollars - Amount in dollars (e.g., 12.50)
 * @returns Amount in cents (e.g., 1250)
 * @example
 * dollarsToCents(12.50) // 1250
 * dollarsToCents("12.50") // 1250
 */
export function dollarsToCents(dollars: number | string): number {
  const num = typeof dollars === "string" ? parseFloat(dollars) : dollars;

  if (isNaN(num)) {
    throw new Error(`Invalid dollar amount: ${dollars}`);
  }

  return Math.round(num * 100);
}

/**
 * Converts cents to dollars for display
 * @param cents - Amount in cents (e.g., 1250)
 * @returns Amount in dollars (e.g., 12.50)
 * @example
 * centsToDollars(1250) // 12.50
 */
export function centsToDollars(cents: number): number {
  if (isNaN(cents)) {
    throw new Error(`Invalid cents amount: ${cents}`);
  }

  return cents / 100;
}

/**
 * Formats cents as currency string
 * @param cents - Amount in cents
 * @param locale - Locale for formatting (default: 'es-EC')
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string (e.g., "$12.50")
 */
export function formatCurrency(
  cents: number,
  locale: string = "es-EC",
  currency: string = "USD"
): string {
  const dollars = centsToDollars(cents);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(dollars);
}

// =====================================================
// ID GENERATION
// =====================================================

/**
 * Generates a UUID v4
 * @returns UUID string
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Generates a short ID (8 characters)
 * Useful for user-facing IDs or file names
 * @returns Short ID string
 */
export function generateShortId(): string {
  return generateUUID().split("-")[0];
}

// =====================================================
// TIMESTAMP UTILITIES
// =====================================================

/**
 * Gets current Unix timestamp in seconds
 * @returns Unix timestamp
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Converts Date to Unix timestamp
 * @param date - Date object or ISO string
 * @returns Unix timestamp in seconds
 */
export function dateToTimestamp(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  return Math.floor(d.getTime() / 1000);
}

/**
 * Converts Unix timestamp to Date
 * @param timestamp - Unix timestamp in seconds
 * @returns Date object
 */
export function timestampToDate(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

/**
 * Formats timestamp as ISO date string (YYYY-MM-DD)
 * @param timestamp - Unix timestamp in seconds
 * @returns ISO date string
 */
export function timestampToISODate(timestamp: number): string {
  return timestampToDate(timestamp).toISOString().split("T")[0];
}

/**
 * Gets period string from date (YYYY-MM)
 * @param date - Date object, ISO string, or Unix timestamp
 * @returns Period string (e.g., "2025-01")
 */
export function getPeriod(date: Date | string | number): string {
  let d: Date;

  if (typeof date === "number") {
    d = timestampToDate(date);
  } else if (typeof date === "string") {
    d = new Date(date);
  } else {
    d = date;
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// =====================================================
// HASH UTILITIES
// =====================================================

/**
 * Generates SHA-256 hash of a string
 * @param text - Text to hash
 * @returns Hex-encoded hash string
 */
export async function generateSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// =====================================================
// VALIDATION UTILITIES
// =====================================================

/**
 * Validates Ecuadorian RUC (Registro Único de Contribuyentes)
 * @param ruc - RUC string (13 digits)
 * @returns True if valid
 */
export function validateRUC(ruc: string): boolean {
  if (!ruc || ruc.length !== 13) return false;
  if (!/^\d+$/.test(ruc)) return false;

  // Check if third digit is valid (0-6 for natural persons, 9 for legal entities)
  const thirdDigit = parseInt(ruc[2]);
  if (thirdDigit < 0 || (thirdDigit > 6 && thirdDigit !== 9)) return false;

  return true;
}

/**
 * Validates Ecuadorian Cédula (10 digits)
 * @param cedula - Cédula string (10 digits)
 * @returns True if valid
 */
export function validateCedula(cedula: string): boolean {
  if (!cedula || cedula.length !== 10) return false;
  if (!/^\d+$/.test(cedula)) return false;

  // Province code (first 2 digits) should be between 01 and 24
  const province = parseInt(cedula.substring(0, 2));
  if (province < 1 || province > 24) return false;

  return true;
}

/**
 * Validates SRI access key (49 digits)
 * @param claveAcceso - Access key string
 * @returns True if valid
 */
export function validateClaveAcceso(claveAcceso: string): boolean {
  if (!claveAcceso || claveAcceso.length !== 49) return false;
  if (!/^\d+$/.test(claveAcceso)) return false;
  return true;
}

// =====================================================
// DATE PARSING UTILITIES
// =====================================================

/**
 * Parses SRI date format (DD/MM/YYYY) to ISO date (YYYY-MM-DD)
 * @param sriDate - Date in DD/MM/YYYY format
 * @returns ISO date string (YYYY-MM-DD)
 */
export function parseSRIDate(sriDate: string): string {
  const [day, month, year] = sriDate.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/**
 * Formats ISO date to SRI format (DD/MM/YYYY)
 * @param isoDate - ISO date string (YYYY-MM-DD)
 * @returns Date in DD/MM/YYYY format
 */
export function formatToSRIDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

// =====================================================
// PAGINATION UTILITIES
// =====================================================

/**
 * Calculates pagination offset
 * @param page - Page number (1-based)
 * @param perPage - Items per page
 * @returns Offset for SQL query
 */
export function calculateOffset(page: number, perPage: number): number {
  return (page - 1) * perPage;
}

/**
 * Calculates total pages
 * @param totalItems - Total number of items
 * @param perPage - Items per page
 * @returns Total number of pages
 */
export function calculateTotalPages(
  totalItems: number,
  perPage: number
): number {
  return Math.ceil(totalItems / perPage);
}

/**
 * Creates pagination metadata
 */
export interface PaginationMeta {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Generates pagination metadata
 * @param page - Current page (1-based)
 * @param perPage - Items per page
 * @param totalItems - Total number of items
 * @returns Pagination metadata
 */
export function createPaginationMeta(
  page: number,
  perPage: number,
  totalItems: number
): PaginationMeta {
  const totalPages = calculateTotalPages(totalItems, perPage);

  return {
    page,
    perPage,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

// =====================================================
// ERROR UTILITIES
// =====================================================

/**
 * Creates a standardized error object
 */
export interface DatabaseError {
  code: string;
  message: string;
  field?: string;
  details?: unknown;
}

/**
 * Creates a database error object
 * @param code - Error code
 * @param message - Error message
 * @param field - Field that caused the error (optional)
 * @param details - Additional error details (optional)
 * @returns DatabaseError object
 */
export function createError(
  code: string,
  message: string,
  field?: string,
  details?: unknown
): DatabaseError {
  return { code, message, field, details };
}

/**
 * Checks if an error is a unique constraint violation
 * @param error - Error object from database
 * @returns True if unique constraint violation
 */
export function isUniqueConstraintError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { message?: string; code?: string };

  return (
    err.message?.includes("UNIQUE constraint failed") ||
    err.code === "SQLITE_CONSTRAINT_UNIQUE"
  );
}

/**
 * Checks if an error is a foreign key constraint violation
 * @param error - Error object from database
 * @returns True if foreign key constraint violation
 */
export function isForeignKeyError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { message?: string; code?: string };

  return (
    err.message?.includes("FOREIGN KEY constraint failed") ||
    err.code === "SQLITE_CONSTRAINT_FOREIGNKEY"
  );
}
