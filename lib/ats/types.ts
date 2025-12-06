/**
 * ATS (Anexo Transaccional Simplificado) types
 * Based on SRI Ecuador specifications
 */

import type {
  SRITipoIdentificacion,
  SRIFormaPago,
} from "@/constants/sri-codes";
import type { DocumentType } from "@/constants/document-types";
import type { ParsedDocument } from "@/types/sri-xml";
import type {
  ATSReportType,
  ATSFileFormat,
  TransactionType,
} from "./constants";

// =====================================================
// ATS ROW TYPES (Individual transaction records)
// =====================================================

/**
 * Base fields common to both purchases and sales
 */
export interface ATSRowBase {
  /** Tipo de identificación del sujeto */
  tipoIdentificacion: SRITipoIdentificacion;
  /** Número de identificación (RUC/Cédula/Pasaporte) */
  identificacion: string;
  /** Razón social o nombre */
  razonSocial: string;
  /** Tipo de comprobante interno */
  tipoComprobante: DocumentType;
  /** Código de comprobante SRI (01, 04, 05, 07) */
  codigoComprobante: string;
  /** Fecha de emisión (YYYY-MM-DD) */
  fechaEmision: string;
  /** Establecimiento (3 dígitos) */
  establecimiento: string;
  /** Punto de emisión (3 dígitos) */
  puntoEmision: string;
  /** Secuencial (9 dígitos) */
  secuencial: string;
  /** Número de autorización SRI */
  autorizacion: string;
  /** Clave de acceso (49 dígitos) */
  claveAcceso: string;
}

/**
 * Row for ATS Purchases section (compras)
 * Represents purchases made by the taxpayer (invoices received from suppliers)
 */
export interface ATSComprasRow extends ATSRowBase {
  /** Base imponible gravada con IVA diferente de 0% (en centavos) */
  baseIvaGravada: number;
  /** Base imponible con tarifa 0% (en centavos) */
  baseIva0: number;
  /** Base no objeto de IVA (en centavos) */
  baseNoObjetoIva: number;
  /** Monto IVA (en centavos) */
  montoIva: number;
  /** Monto ICE (en centavos) */
  montoIce: number;
  /** Total del comprobante (en centavos) */
  total: number;
  /** Retención IVA aplicada (en centavos) */
  retencionIva: number;
  /** Retención Renta aplicada (en centavos) */
  retencionRenta: number;
  /** Forma de pago */
  formaPago?: SRIFormaPago;
}

/**
 * Row for ATS Sales section (ventas)
 * Represents sales made by the taxpayer (invoices issued to clients)
 */
export interface ATSVentasRow extends ATSRowBase {
  /** Base imponible gravada con IVA diferente de 0% (en centavos) */
  baseIvaGravada: number;
  /** Base imponible con tarifa 0% (en centavos) */
  baseIva0: number;
  /** Base no objeto de IVA (en centavos) */
  baseNoObjetoIva: number;
  /** Monto IVA (en centavos) */
  montoIva: number;
  /** Monto ICE (en centavos) */
  montoIce: number;
  /** Total del comprobante (en centavos) */
  total: number;
}

// =====================================================
// AGGREGATED DATA (Grouped by provider/client)
// =====================================================

/**
 * Aggregated totals structure
 */
export interface ATSTotals {
  baseIvaGravada: number;
  baseIva0: number;
  baseNoObjetoIva: number;
  montoIva: number;
  montoIce: number;
  total: number;
  retencionIva: number;
  retencionRenta: number;
}

/**
 * Totals structure for sales (without retention fields)
 * Retenciones only apply to purchases, not sales
 */
export type ATSVentasTotals = Omit<
  ATSTotals,
  "retencionIva" | "retencionRenta"
>;

/**
 * Aggregated purchase data by provider
 * Groups multiple invoices from the same provider
 */
export interface ATSProveedorAgregado {
  /** Datos del proveedor */
  proveedor: {
    tipoIdentificacion: SRITipoIdentificacion;
    identificacion: string;
    razonSocial: string;
  };
  /** Número de comprobantes */
  numeroComprobantes: number;
  /** Totales agregados (en centavos) */
  totales: ATSTotals;
  /** Detalle de comprobantes individuales */
  comprobantes: ATSComprasRow[];
}

/**
 * Aggregated sales data by client
 */
export interface ATSClienteAgregado {
  /** Datos del cliente */
  cliente: {
    tipoIdentificacion: SRITipoIdentificacion;
    identificacion: string;
    razonSocial: string;
  };
  /** Número de comprobantes */
  numeroComprobantes: number;
  /** Totales agregados (en centavos) */
  totales: ATSVentasTotals;
  /** Detalle de comprobantes individuales */
  comprobantes: ATSVentasRow[];
}

// =====================================================
// REPORT TYPES
// =====================================================

/**
 * Summary totals for the entire report
 */
export interface ATSResumen {
  /** Total de comprobantes procesados */
  totalComprobantes: number;
  /** Comprobantes por tipo */
  porTipo: Partial<Record<DocumentType, number>>;
  /** Totales monetarios (en centavos) */
  totales: ATSTotals;
}

/**
 * Compras section of the report
 */
export interface ATSComprasSection {
  resumen: ATSResumen;
  /** Datos agregados por proveedor */
  porProveedor: ATSProveedorAgregado[];
  /** Todas las filas individuales */
  filas: ATSComprasRow[];
}

/**
 * Ventas section of the report
 */
export interface ATSVentasSection {
  resumen: Omit<ATSResumen, "totales"> & {
    totales: ATSVentasTotals;
  };
  /** Datos agregados por cliente */
  porCliente: ATSClienteAgregado[];
  /** Todas las filas individuales */
  filas: ATSVentasRow[];
}

/**
 * Complete ATS Report
 */
export interface ATSReport {
  /** Período del reporte (YYYY-MM) */
  periodo: string;
  /** Fecha de generación (ISO datetime) */
  generadoEn: string;
  /** Tipo de reporte generado */
  tipo: ATSReportType;
  /** Sección de compras (si hay documentos de compra) */
  compras?: ATSComprasSection;
  /** Sección de ventas (si hay documentos de venta) */
  ventas?: ATSVentasSection;
}

// =====================================================
// CLASSIFIED DOCUMENT
// =====================================================

/**
 * Document with its transaction classification
 */
export interface ClassifiedDocument {
  /** Original parsed document */
  document: ParsedDocument;
  /** Transaction type (compra or venta) */
  transactionType: TransactionType;
}

// =====================================================
// GENERATOR OPTIONS
// =====================================================

/**
 * Options for ATS report generation
 */
export interface ATSGeneratorOptions {
  /**
   * RUC of the taxpayer generating the report.
   * Used to determine if documents are purchases or sales.
   * If not provided, will be inferred from the first document.
   */
  contribuyenteRuc?: string;
  /**
   * Period for the report (YYYY-MM).
   * If not provided, will be inferred from documents.
   */
  periodo?: string;
}

/**
 * Options for file generation
 */
export interface ATSFileOptions {
  /** Output format */
  formato: ATSFileFormat;
  /** Include individual rows or only aggregated data */
  incluirDetalle?: boolean;
}

/**
 * Result of file generation
 */
export interface ATSFileResult {
  /** File content as buffer */
  buffer: Uint8Array;
  /** Suggested filename */
  filename: string;
  /** MIME type */
  mimeType: string;
}
