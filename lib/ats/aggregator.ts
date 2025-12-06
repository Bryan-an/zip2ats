/**
 * ATS Report aggregator
 * Groups documents and calculates totals
 */

import type { ParsedDocument } from "@/types/sri-xml";
import type { DocumentType } from "@/constants/document-types";
import { getPeriod } from "@/lib/db-utils";
import {
  classifyDocuments,
  separateByTransactionType,
  inferContribuyenteRuc,
} from "./detector";
import { mapToComprasRow, mapToVentasRow } from "./mapper";
import { ATS_REPORT_TYPES } from "./constants";
import type {
  ATSReport,
  ATSComprasSection,
  ATSVentasSection,
  ATSComprasRow,
  ATSVentasRow,
  ATSResumen,
  ATSTotals,
  ATSVentasTotals,
  ATSProveedorAgregado,
  ATSClienteAgregado,
  ATSGeneratorOptions,
} from "./types";

// =====================================================
// TOTALS CALCULATION
// =====================================================

/**
 * Creates an empty totals object
 */
function createEmptyTotals(): ATSTotals {
  return {
    baseIvaGravada: 0,
    baseIva0: 0,
    baseNoObjetoIva: 0,
    montoIva: 0,
    montoIce: 0,
    total: 0,
    retencionIva: 0,
    retencionRenta: 0,
  };
}

/**
 * Creates an empty ventas totals object (without retenciones)
 */
function createEmptyVentasTotals(): ATSVentasTotals {
  return {
    baseIvaGravada: 0,
    baseIva0: 0,
    baseNoObjetoIva: 0,
    montoIva: 0,
    montoIce: 0,
    total: 0,
  };
}

/**
 * Adds values from a compras row to totals
 */
function addComprasRowToTotals(totals: ATSTotals, row: ATSComprasRow): void {
  totals.baseIvaGravada += row.baseIvaGravada;
  totals.baseIva0 += row.baseIva0;
  totals.baseNoObjetoIva += row.baseNoObjetoIva;
  totals.montoIva += row.montoIva;
  totals.montoIce += row.montoIce;
  totals.total += row.total;
  totals.retencionIva += row.retencionIva;
  totals.retencionRenta += row.retencionRenta;
}

/**
 * Adds values from a ventas row to totals
 */
function addVentasRowToTotals(
  totals: ATSVentasTotals,
  row: ATSVentasRow
): void {
  totals.baseIvaGravada += row.baseIvaGravada;
  totals.baseIva0 += row.baseIva0;
  totals.baseNoObjetoIva += row.baseNoObjetoIva;
  totals.montoIva += row.montoIva;
  totals.montoIce += row.montoIce;
  totals.total += row.total;
}

// =====================================================
// PERIOD INFERENCE
// =====================================================

/**
 * Infers the period from documents
 * Returns the most common YYYY-MM period
 */
function inferPeriodo(documents: ParsedDocument[]): string {
  if (documents.length === 0) {
    return getPeriod(new Date());
  }

  const periodCounts = new Map<string, number>();

  for (const doc of documents) {
    // Extract YYYY-MM from fecha (which is ISO format YYYY-MM-DD)
    const period = doc.fecha.substring(0, 7);
    periodCounts.set(period, (periodCounts.get(period) ?? 0) + 1);
  }

  // Find the most common period
  let maxCount = 0;
  let inferredPeriod = "";

  for (const [period, count] of periodCounts) {
    if (count > maxCount) {
      maxCount = count;
      inferredPeriod = period;
    }
  }

  return inferredPeriod;
}

// =====================================================
// COMPRAS AGGREGATION
// =====================================================

/**
 * Aggregates compras rows by provider
 */
function aggregateComprasByProveedor(
  rows: ATSComprasRow[]
): ATSProveedorAgregado[] {
  const proveedorMap = new Map<string, ATSProveedorAgregado>();

  for (const row of rows) {
    const key = row.identificacion;
    let agregado = proveedorMap.get(key);

    if (!agregado) {
      agregado = {
        proveedor: {
          tipoIdentificacion: row.tipoIdentificacion,
          identificacion: row.identificacion,
          razonSocial: row.razonSocial,
        },
        numeroComprobantes: 0,
        totales: createEmptyTotals(),
        comprobantes: [],
      };

      proveedorMap.set(key, agregado);
    }

    agregado.numeroComprobantes++;
    addComprasRowToTotals(agregado.totales, row);
    agregado.comprobantes.push(row);
  }

  // Sort by razonSocial
  return Array.from(proveedorMap.values()).sort((a, b) =>
    a.proveedor.razonSocial.localeCompare(b.proveedor.razonSocial)
  );
}

/**
 * Creates compras resumen from rows
 */
function createComprasResumen(rows: ATSComprasRow[]): ATSResumen {
  const totals = createEmptyTotals();
  const porTipo: Partial<Record<DocumentType, number>> = {};

  for (const row of rows) {
    addComprasRowToTotals(totals, row);
    porTipo[row.tipoComprobante] = (porTipo[row.tipoComprobante] ?? 0) + 1;
  }

  return {
    totalComprobantes: rows.length,
    porTipo,
    totales: totals,
  };
}

/**
 * Creates the compras section of the report
 */
function createComprasSection(
  documents: ParsedDocument[]
): ATSComprasSection | undefined {
  if (documents.length === 0) {
    return undefined;
  }

  const filas = documents.map(mapToComprasRow);

  return {
    resumen: createComprasResumen(filas),
    porProveedor: aggregateComprasByProveedor(filas),
    filas,
  };
}

// =====================================================
// VENTAS AGGREGATION
// =====================================================

/**
 * Aggregates ventas rows by client
 */
function aggregateVentasByCliente(rows: ATSVentasRow[]): ATSClienteAgregado[] {
  const clienteMap = new Map<string, ATSClienteAgregado>();

  for (const row of rows) {
    const key = row.identificacion;
    let agregado = clienteMap.get(key);

    if (!agregado) {
      agregado = {
        cliente: {
          tipoIdentificacion: row.tipoIdentificacion,
          identificacion: row.identificacion,
          razonSocial: row.razonSocial,
        },
        numeroComprobantes: 0,
        totales: createEmptyVentasTotals(),
        comprobantes: [],
      };

      clienteMap.set(key, agregado);
    }

    agregado.numeroComprobantes++;
    addVentasRowToTotals(agregado.totales, row);
    agregado.comprobantes.push(row);
  }

  // Sort by razonSocial
  return Array.from(clienteMap.values()).sort((a, b) =>
    a.cliente.razonSocial.localeCompare(b.cliente.razonSocial)
  );
}

/**
 * Creates ventas resumen from rows
 */
function createVentasResumen(
  rows: ATSVentasRow[]
): ATSVentasSection["resumen"] {
  const totals = createEmptyVentasTotals();

  const porTipo: Partial<Record<DocumentType, number>> = {};

  for (const row of rows) {
    addVentasRowToTotals(totals, row);
    porTipo[row.tipoComprobante] = (porTipo[row.tipoComprobante] ?? 0) + 1;
  }

  return {
    totalComprobantes: rows.length,
    porTipo,
    totales: totals,
  };
}

/**
 * Creates the ventas section of the report
 */
function createVentasSection(
  documents: ParsedDocument[]
): ATSVentasSection | undefined {
  if (documents.length === 0) {
    return undefined;
  }

  const filas = documents.map(mapToVentasRow);

  return {
    resumen: createVentasResumen(filas),
    porCliente: aggregateVentasByCliente(filas),
    filas,
  };
}

// =====================================================
// MAIN AGGREGATOR
// =====================================================

/**
 * Creates an ATS report from parsed documents
 *
 * @param documents - Array of parsed documents
 * @param options - Generator options
 * @returns Complete ATS report
 */
export function createATSReport(
  documents: ParsedDocument[],
  options: ATSGeneratorOptions = {}
): ATSReport {
  // Determine RUC (provided or inferred)
  const contribuyenteRuc =
    options.contribuyenteRuc ?? inferContribuyenteRuc(documents);

  // Classify and separate documents
  const classified = classifyDocuments(documents, contribuyenteRuc);
  const { compras, ventas } = separateByTransactionType(classified);

  // Create sections
  const comprasSection = createComprasSection(compras);
  const ventasSection = createVentasSection(ventas);

  // Determine report type
  let tipo: ATSReport["tipo"] = ATS_REPORT_TYPES.COMPLETO;

  if (comprasSection && !ventasSection) {
    tipo = ATS_REPORT_TYPES.COMPRAS;
  } else if (!comprasSection && ventasSection) {
    tipo = ATS_REPORT_TYPES.VENTAS;
  }

  // Determine period
  const periodo = options.periodo ?? inferPeriodo(documents);

  return {
    periodo,
    generadoEn: new Date().toISOString(),
    tipo,
    compras: comprasSection,
    ventas: ventasSection,
  };
}
