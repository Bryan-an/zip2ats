/**
 * CSV generator for ATS reports
 */

import { centsToDollars, formatToSRIDate } from "@/lib/db-utils";
import { DOCUMENT_TYPE_LABELS } from "@/constants/document-types";
import { getNumeroDocumento } from "./mapper";
import { CSV_SECTIONS, type CSVSection } from "./constants";
import type {
  ATSReport,
  ATSComprasRow,
  ATSVentasRow,
  ATSFileResult,
} from "./types";

// =====================================================
// CSV UTILITIES
// =====================================================

/**
 * Escapes a value for CSV format
 * Wraps in quotes if contains comma, quote, or newline
 */
function escapeCSV(value: string | number | undefined | null): string {
  if (value === undefined || value === null) {
    return "";
  }

  const str = String(value);

  // If contains special characters, wrap in quotes and escape existing quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Converts an array of values to a CSV row
 */
function toCSVRow(values: (string | number | undefined | null)[]): string {
  return values.map(escapeCSV).join(",");
}

/**
 * Formats a monetary value from cents to string
 */
function formatMoney(cents: number): string {
  return centsToDollars(cents).toFixed(2);
}

// =====================================================
// COMPRAS CSV
// =====================================================

const COMPRAS_HEADERS = [
  "RUC Proveedor",
  "Razón Social",
  "Tipo Documento",
  "Fecha Emisión",
  "Número Documento",
  "Autorización",
  "Base IVA Gravada",
  "Base IVA 0%",
  "Base No Objeto",
  "Monto IVA",
  "Monto ICE",
  "Total",
  "Retención IVA",
  "Retención Renta",
];

/**
 * Converts a compras row to CSV values
 */
function comprasRowToCSV(row: ATSComprasRow): (string | number)[] {
  return [
    row.identificacion,
    row.razonSocial,
    DOCUMENT_TYPE_LABELS[row.tipoComprobante] ?? row.tipoComprobante,
    formatToSRIDate(row.fechaEmision),
    getNumeroDocumento(row),
    row.autorizacion,
    formatMoney(row.baseIvaGravada),
    formatMoney(row.baseIva0),
    formatMoney(row.baseNoObjetoIva),
    formatMoney(row.montoIva),
    formatMoney(row.montoIce),
    formatMoney(row.total),
    formatMoney(row.retencionIva),
    formatMoney(row.retencionRenta),
  ];
}

/**
 * Generates CSV content for compras
 */
function generateComprasCSV(rows: ATSComprasRow[]): string {
  const lines: string[] = [];

  // Header
  lines.push(toCSVRow(COMPRAS_HEADERS));

  // Data rows
  for (const row of rows) {
    lines.push(toCSVRow(comprasRowToCSV(row)));
  }

  return lines.join("\n");
}

// =====================================================
// VENTAS CSV
// =====================================================

const VENTAS_HEADERS = [
  "Tipo ID",
  "Identificación",
  "Razón Social",
  "Tipo Documento",
  "Fecha Emisión",
  "Número Documento",
  "Autorización",
  "Base IVA Gravada",
  "Base IVA 0%",
  "Base No Objeto",
  "Monto IVA",
  "Monto ICE",
  "Total",
];

/**
 * Converts a ventas row to CSV values
 */
function ventasRowToCSV(row: ATSVentasRow): (string | number)[] {
  return [
    row.tipoIdentificacion,
    row.identificacion,
    row.razonSocial,
    DOCUMENT_TYPE_LABELS[row.tipoComprobante] ?? row.tipoComprobante,
    formatToSRIDate(row.fechaEmision),
    getNumeroDocumento(row),
    row.autorizacion,
    formatMoney(row.baseIvaGravada),
    formatMoney(row.baseIva0),
    formatMoney(row.baseNoObjetoIva),
    formatMoney(row.montoIva),
    formatMoney(row.montoIce),
    formatMoney(row.total),
  ];
}

/**
 * Generates CSV content for ventas
 */
function generateVentasCSV(rows: ATSVentasRow[]): string {
  const lines: string[] = [];

  // Header
  lines.push(toCSVRow(VENTAS_HEADERS));

  // Data rows
  for (const row of rows) {
    lines.push(toCSVRow(ventasRowToCSV(row)));
  }

  return lines.join("\n");
}

// =====================================================
// MAIN GENERATOR
// =====================================================

/**
 * Generates a CSV file from an ATS report
 *
 * @param report - ATS report data
 * @param section - Which section to export (compras or ventas)
 * @returns File result with buffer, filename, and MIME type
 */
export function generateCSV(
  report: ATSReport,
  section: CSVSection
): ATSFileResult {
  let content = "";
  let filename = `ATS_${report.periodo}`;

  if (section === CSV_SECTIONS.COMPRAS) {
    content = generateComprasCSV(report.compras?.filas ?? []);
    filename += "_compras";
  } else {
    content = generateVentasCSV(report.ventas?.filas ?? []);
    filename += "_ventas";
  }

  // Add BOM for Excel UTF-8 compatibility
  const BOM = "\uFEFF";
  const csvContent = BOM + content;

  // Convert to Uint8Array
  const encoder = new TextEncoder();
  const buffer = encoder.encode(csvContent);

  return {
    buffer,
    filename: `${filename}.csv`,
    mimeType: "text/csv;charset=utf-8",
  };
}

/**
 * Generates separate CSV files for compras and ventas
 *
 * @param report - ATS report data
 * @returns Array of file results (one for each section with data)
 */
export function generateSeparateCSVs(report: ATSReport): ATSFileResult[] {
  const results: ATSFileResult[] = [];

  if (report.compras && report.compras.filas.length > 0) {
    results.push(generateCSV(report, CSV_SECTIONS.COMPRAS));
  }

  if (report.ventas && report.ventas.filas.length > 0) {
    results.push(generateCSV(report, CSV_SECTIONS.VENTAS));
  }

  return results;
}
