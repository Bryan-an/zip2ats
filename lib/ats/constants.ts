/**
 * ATS module constants
 * Centralized string literals to avoid magic strings
 */

// =====================================================
// TRANSACTION TYPES
// =====================================================

/**
 * Transaction type constants for document classification
 */
export const TRANSACTION_TYPES = {
  COMPRA: "compra",
  VENTA: "venta",
} as const;

/**
 * Transaction type (compra or venta)
 */
export type TransactionType =
  (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

// =====================================================
// REPORT TYPES
// =====================================================

/**
 * ATS report type constants
 */
export const ATS_REPORT_TYPES = {
  COMPRAS: "compras",
  VENTAS: "ventas",
  COMPLETO: "completo",
} as const;

/**
 * ATS report type (compras, ventas, or completo)
 */
export type ATSReportType =
  (typeof ATS_REPORT_TYPES)[keyof typeof ATS_REPORT_TYPES];

/**
 * Human-readable labels for ATS report types
 */
export const ATS_REPORT_TYPE_LABELS: Record<ATSReportType, string> = {
  compras: "Compras",
  ventas: "Ventas",
  completo: "Completo",
};

// =====================================================
// FILE FORMATS
// =====================================================

/**
 * ATS file format constants
 */
export const ATS_FILE_FORMATS = {
  XLSX: "xlsx",
  CSV: "csv",
} as const;

/**
 * ATS file format (xlsx or csv)
 */
export type ATSFileFormat =
  (typeof ATS_FILE_FORMATS)[keyof typeof ATS_FILE_FORMATS];

// =====================================================
// CSV SECTIONS
// =====================================================

/**
 * CSV section export options
 */
export const CSV_SECTIONS = {
  COMPRAS: "compras",
  VENTAS: "ventas",
} as const;

/**
 * CSV section type
 */
export type CSVSection = (typeof CSV_SECTIONS)[keyof typeof CSV_SECTIONS];

// =====================================================
// CSV EXPORT MODES
// =====================================================

/**
 * Export modes for CSV output.
 *
 * When `options.formato === "csv"` and no `options.csvSection` is provided,
 * the API returns a ZIP bundle containing one CSV per section with data.
 */
export const CSV_EXPORT_MODES = {
  ZIP: "zip",
} as const;

/**
 * CSV export mode: either a ZIP bundle or a single section CSV.
 */
export type CSVExportMode =
  | (typeof CSV_EXPORT_MODES)[keyof typeof CSV_EXPORT_MODES]
  | CSVSection;

// =====================================================
// DEFAULT VALUES (Fallbacks when parsing fails)
// =====================================================

/**
 * Default values when clave de acceso cannot be parsed
 */
export const DEFAULT_DOCUMENTO_PARTS = {
  ESTABLECIMIENTO: "000",
  PUNTO_EMISION: "000",
  SECUENCIAL: "000000000",
} as const;
