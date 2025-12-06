/**
 * Excel generator for ATS reports
 * Uses ExcelJS (MIT license) for full styling support
 */

import ExcelJS from "exceljs";
import { centsToDollars, formatToSRIDate } from "@/lib/db-utils";
import { DOCUMENT_TYPE_LABELS } from "@/constants/document-types";
import { getNumeroDocumento } from "./mapper";
import { ATS_REPORT_TYPE_LABELS } from "./constants";
import type {
  ATSReport,
  ATSComprasRow,
  ATSVentasRow,
  ATSFileResult,
} from "./types";

// =====================================================
// STYLES
// =====================================================

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1F4E79" }, // Dark blue
};

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" }, // White
  size: 11,
};

const HEADER_ALIGNMENT: Partial<ExcelJS.Alignment> = {
  vertical: "middle",
  horizontal: "center",
  wrapText: true,
};

const CURRENCY_FORMAT = '"$"#,##0.00';

const THIN_BORDER: Partial<ExcelJS.Border> = { style: "thin" };

const CELL_BORDER: Partial<ExcelJS.Borders> = {
  top: THIN_BORDER,
  left: THIN_BORDER,
  bottom: THIN_BORDER,
  right: THIN_BORDER,
};

// =====================================================
// COLUMN DEFINITIONS
// =====================================================

interface ColumnDef {
  header: string;
  key: string;
  width: number;
  style?: Partial<ExcelJS.Style>;
}

const COMPRAS_COLUMNS: ColumnDef[] = [
  { header: "RUC Proveedor", key: "identificacion", width: 16 },
  { header: "Razón Social", key: "razonSocial", width: 35 },
  { header: "Tipo Doc.", key: "tipoDoc", width: 12 },
  { header: "Fecha Emisión", key: "fechaEmision", width: 14 },
  { header: "Número Documento", key: "numeroDocumento", width: 20 },
  { header: "Autorización", key: "autorizacion", width: 50 },
  {
    header: "Base IVA Gravada",
    key: "baseIvaGravada",
    width: 16,
    style: { numFmt: CURRENCY_FORMAT },
  },
  {
    header: "Base IVA 0%",
    key: "baseIva0",
    width: 14,
    style: { numFmt: CURRENCY_FORMAT },
  },
  {
    header: "Base No Objeto",
    key: "baseNoObjetoIva",
    width: 14,
    style: { numFmt: CURRENCY_FORMAT },
  },
  {
    header: "Monto IVA",
    key: "montoIva",
    width: 12,
    style: { numFmt: CURRENCY_FORMAT },
  },
  {
    header: "Monto ICE",
    key: "montoIce",
    width: 12,
    style: { numFmt: CURRENCY_FORMAT },
  },
  {
    header: "Total",
    key: "total",
    width: 14,
    style: { numFmt: CURRENCY_FORMAT },
  },
  {
    header: "Ret. IVA",
    key: "retencionIva",
    width: 12,
    style: { numFmt: CURRENCY_FORMAT },
  },
  {
    header: "Ret. Renta",
    key: "retencionRenta",
    width: 12,
    style: { numFmt: CURRENCY_FORMAT },
  },
];

const VENTAS_COLUMNS: ColumnDef[] = [
  { header: "Tipo ID", key: "tipoIdentificacion", width: 10 },
  { header: "Identificación", key: "identificacion", width: 16 },
  { header: "Razón Social", key: "razonSocial", width: 35 },
  { header: "Tipo Doc.", key: "tipoDoc", width: 12 },
  { header: "Fecha Emisión", key: "fechaEmision", width: 14 },
  { header: "Número Documento", key: "numeroDocumento", width: 20 },
  { header: "Autorización", key: "autorizacion", width: 50 },
  {
    header: "Base IVA Gravada",
    key: "baseIvaGravada",
    width: 16,
    style: { numFmt: CURRENCY_FORMAT },
  },
  {
    header: "Base IVA 0%",
    key: "baseIva0",
    width: 14,
    style: { numFmt: CURRENCY_FORMAT },
  },
  {
    header: "Base No Objeto",
    key: "baseNoObjetoIva",
    width: 14,
    style: { numFmt: CURRENCY_FORMAT },
  },
  {
    header: "Monto IVA",
    key: "montoIva",
    width: 12,
    style: { numFmt: CURRENCY_FORMAT },
  },
  {
    header: "Monto ICE",
    key: "montoIce",
    width: 12,
    style: { numFmt: CURRENCY_FORMAT },
  },
  {
    header: "Total",
    key: "total",
    width: 14,
    style: { numFmt: CURRENCY_FORMAT },
  },
];

// =====================================================
// HELPERS
// =====================================================

/**
 * Applies header styling to a row
 */
function styleHeaderRow(row: ExcelJS.Row): void {
  row.height = 30;

  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = HEADER_ALIGNMENT;
    cell.border = CELL_BORDER;
  });
}

/**
 * Applies data row styling
 */
function styleDataRow(row: ExcelJS.Row): void {
  row.eachCell((cell) => {
    cell.border = CELL_BORDER;
    cell.alignment = { vertical: "middle" };
  });
}

/**
 * Converts a compras row to Excel row data
 */
function comprasRowToExcel(row: ATSComprasRow): Record<string, unknown> {
  return {
    identificacion: row.identificacion,
    razonSocial: row.razonSocial,
    tipoDoc: DOCUMENT_TYPE_LABELS[row.tipoComprobante] ?? row.tipoComprobante,
    fechaEmision: formatToSRIDate(row.fechaEmision),
    numeroDocumento: getNumeroDocumento(row),
    autorizacion: row.autorizacion,
    baseIvaGravada: centsToDollars(row.baseIvaGravada),
    baseIva0: centsToDollars(row.baseIva0),
    baseNoObjetoIva: centsToDollars(row.baseNoObjetoIva),
    montoIva: centsToDollars(row.montoIva),
    montoIce: centsToDollars(row.montoIce),
    total: centsToDollars(row.total),
    retencionIva: centsToDollars(row.retencionIva),
    retencionRenta: centsToDollars(row.retencionRenta),
  };
}

/**
 * Converts a ventas row to Excel row data
 */
function ventasRowToExcel(row: ATSVentasRow): Record<string, unknown> {
  return {
    tipoIdentificacion: row.tipoIdentificacion,
    identificacion: row.identificacion,
    razonSocial: row.razonSocial,
    tipoDoc: DOCUMENT_TYPE_LABELS[row.tipoComprobante] ?? row.tipoComprobante,
    fechaEmision: formatToSRIDate(row.fechaEmision),
    numeroDocumento: getNumeroDocumento(row),
    autorizacion: row.autorizacion,
    baseIvaGravada: centsToDollars(row.baseIvaGravada),
    baseIva0: centsToDollars(row.baseIva0),
    baseNoObjetoIva: centsToDollars(row.baseNoObjetoIva),
    montoIva: centsToDollars(row.montoIva),
    montoIce: centsToDollars(row.montoIce),
    total: centsToDollars(row.total),
  };
}

// =====================================================
// WORKSHEET BUILDERS
// =====================================================

/**
 * Creates the Resumen (summary) worksheet
 */
function createResumenSheet(
  workbook: ExcelJS.Workbook,
  report: ATSReport
): void {
  const ws = workbook.addWorksheet("Resumen", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  // Title
  ws.mergeCells("A1:D1");
  const titleCell = ws.getCell("A1");
  titleCell.value = `Reporte ATS - Período ${report.periodo}`;
  titleCell.font = { bold: true, size: 16 };
  titleCell.alignment = { horizontal: "center" };

  // Generation date
  ws.getCell("A3").value = "Generado:";
  ws.getCell("A3").font = { bold: true };
  ws.getCell("B3").value = new Date(report.generadoEn).toLocaleString("es-EC");

  // Report type
  ws.getCell("A4").value = "Tipo:";
  ws.getCell("A4").font = { bold: true };
  ws.getCell("B4").value = ATS_REPORT_TYPE_LABELS[report.tipo];

  let currentRow = 6;

  // Compras summary
  if (report.compras) {
    ws.getCell(`A${currentRow}`).value = "COMPRAS";
    ws.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow++;

    ws.getCell(`A${currentRow}`).value = "Total comprobantes:";

    ws.getCell(`B${currentRow}`).value =
      report.compras.resumen.totalComprobantes;

    currentRow++;

    ws.getCell(`A${currentRow}`).value = "Base IVA Gravada:";

    ws.getCell(`B${currentRow}`).value = centsToDollars(
      report.compras.resumen.totales.baseIvaGravada
    );

    ws.getCell(`B${currentRow}`).numFmt = CURRENCY_FORMAT;
    currentRow++;

    ws.getCell(`A${currentRow}`).value = "Base IVA 0%:";

    ws.getCell(`B${currentRow}`).value = centsToDollars(
      report.compras.resumen.totales.baseIva0
    );

    ws.getCell(`B${currentRow}`).numFmt = CURRENCY_FORMAT;
    currentRow++;

    ws.getCell(`A${currentRow}`).value = "Monto IVA:";

    ws.getCell(`B${currentRow}`).value = centsToDollars(
      report.compras.resumen.totales.montoIva
    );

    ws.getCell(`B${currentRow}`).numFmt = CURRENCY_FORMAT;
    currentRow++;

    ws.getCell(`A${currentRow}`).value = "Total:";

    ws.getCell(`B${currentRow}`).value = centsToDollars(
      report.compras.resumen.totales.total
    );

    ws.getCell(`B${currentRow}`).numFmt = CURRENCY_FORMAT;
    ws.getCell(`B${currentRow}`).font = { bold: true };
    currentRow++;

    ws.getCell(`A${currentRow}`).value = "Retención IVA:";

    ws.getCell(`B${currentRow}`).value = centsToDollars(
      report.compras.resumen.totales.retencionIva
    );

    ws.getCell(`B${currentRow}`).numFmt = CURRENCY_FORMAT;
    currentRow++;

    ws.getCell(`A${currentRow}`).value = "Retención Renta:";

    ws.getCell(`B${currentRow}`).value = centsToDollars(
      report.compras.resumen.totales.retencionRenta
    );

    ws.getCell(`B${currentRow}`).numFmt = CURRENCY_FORMAT;
    currentRow += 2;
  }

  // Ventas summary
  if (report.ventas) {
    ws.getCell(`A${currentRow}`).value = "VENTAS";
    ws.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow++;

    ws.getCell(`A${currentRow}`).value = "Total comprobantes:";

    ws.getCell(`B${currentRow}`).value =
      report.ventas.resumen.totalComprobantes;

    currentRow++;

    ws.getCell(`A${currentRow}`).value = "Base IVA Gravada:";

    ws.getCell(`B${currentRow}`).value = centsToDollars(
      report.ventas.resumen.totales.baseIvaGravada
    );

    ws.getCell(`B${currentRow}`).numFmt = CURRENCY_FORMAT;
    currentRow++;

    ws.getCell(`A${currentRow}`).value = "Base IVA 0%:";

    ws.getCell(`B${currentRow}`).value = centsToDollars(
      report.ventas.resumen.totales.baseIva0
    );

    ws.getCell(`B${currentRow}`).numFmt = CURRENCY_FORMAT;
    currentRow++;

    ws.getCell(`A${currentRow}`).value = "Monto IVA:";

    ws.getCell(`B${currentRow}`).value = centsToDollars(
      report.ventas.resumen.totales.montoIva
    );

    ws.getCell(`B${currentRow}`).numFmt = CURRENCY_FORMAT;
    currentRow++;

    ws.getCell(`A${currentRow}`).value = "Total:";

    ws.getCell(`B${currentRow}`).value = centsToDollars(
      report.ventas.resumen.totales.total
    );

    ws.getCell(`B${currentRow}`).numFmt = CURRENCY_FORMAT;
    ws.getCell(`B${currentRow}`).font = { bold: true };
  }

  // Set column widths
  ws.getColumn("A").width = 20;
  ws.getColumn("B").width = 25;
}

/**
 * Creates the Compras worksheet
 */
function createComprasSheet(
  workbook: ExcelJS.Workbook,
  rows: ATSComprasRow[]
): void {
  const ws = workbook.addWorksheet("Compras", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  // Set columns
  ws.columns = COMPRAS_COLUMNS.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width,
    style: col.style,
  }));

  // Style header row
  styleHeaderRow(ws.getRow(1));

  // Add data rows
  for (const row of rows) {
    const excelRow = ws.addRow(comprasRowToExcel(row));
    styleDataRow(excelRow);
  }

  // Auto-filter
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: rows.length + 1, column: COMPRAS_COLUMNS.length },
  };
}

/**
 * Creates the Ventas worksheet
 */
function createVentasSheet(
  workbook: ExcelJS.Workbook,
  rows: ATSVentasRow[]
): void {
  const ws = workbook.addWorksheet("Ventas", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  // Set columns
  ws.columns = VENTAS_COLUMNS.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width,
    style: col.style,
  }));

  // Style header row
  styleHeaderRow(ws.getRow(1));

  // Add data rows
  for (const row of rows) {
    const excelRow = ws.addRow(ventasRowToExcel(row));
    styleDataRow(excelRow);
  }

  // Auto-filter
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: rows.length + 1, column: VENTAS_COLUMNS.length },
  };
}

// =====================================================
// MAIN GENERATOR
// =====================================================

/**
 * Generates an Excel file from an ATS report
 *
 * @param report - ATS report data
 * @returns File result with buffer, filename, and MIME type
 */
export async function generateExcel(report: ATSReport): Promise<ATSFileResult> {
  const workbook = new ExcelJS.Workbook();

  // Set workbook properties
  workbook.creator = "zip2ats";
  workbook.created = new Date();
  workbook.modified = new Date();

  // Create Resumen sheet
  createResumenSheet(workbook, report);

  // Create Compras sheet if there are compras
  if (report.compras && report.compras.filas.length > 0) {
    createComprasSheet(workbook, report.compras.filas);
  }

  // Create Ventas sheet if there are ventas
  if (report.ventas && report.ventas.filas.length > 0) {
    createVentasSheet(workbook, report.ventas.filas);
  }

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer: new Uint8Array(buffer),
    filename: `ATS_${report.periodo}.xlsx`,
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}
