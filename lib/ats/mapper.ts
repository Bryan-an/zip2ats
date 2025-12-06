/**
 * Document mapper
 * Converts ParsedDocument to ATS row formats
 */

import type { ParsedDocument } from "@/types/sri-xml";
import type { DocumentType } from "@/constants/document-types";
import { SRI_DOC_TYPE, SRI_TIPO_IDENTIFICACION } from "@/constants/sri-codes";
import { DEFAULT_DOCUMENTO_PARTS } from "./constants";
import type { ATSComprasRow, ATSVentasRow } from "./types";

// =====================================================
// CLAVE DE ACCESO PARSING
// =====================================================

/**
 * Structure of a parsed clave de acceso
 *
 * Clave de acceso (49 digits):
 * - Positions 1-8: Fecha emisión (DDMMYYYY)
 * - Positions 9-10: Tipo comprobante
 * - Positions 11-23: RUC emisor (13 digits)
 * - Position 24: Ambiente
 * - Positions 25-27: Establecimiento (3 digits)
 * - Positions 28-30: Punto emisión (3 digits)
 * - Positions 31-39: Secuencial (9 digits)
 * - Positions 40-47: Código numérico (8 digits)
 * - Position 48: Tipo emisión
 * - Position 49: Dígito verificador
 */
export interface ClaveAccesoParsed {
  fechaEmision: string;
  tipoComprobante: string;
  rucEmisor: string;
  ambiente: string;
  establecimiento: string;
  puntoEmision: string;
  secuencial: string;
  codigoNumerico: string;
  tipoEmision: string;
  digitoVerificador: string;
}

/**
 * Parses a clave de acceso into its components
 *
 * @param claveAcceso - 49-digit access key
 * @returns Parsed components or undefined if invalid
 */
export function parseClaveAcceso(
  claveAcceso: string
): ClaveAccesoParsed | undefined {
  if (!claveAcceso || claveAcceso.length !== 49) {
    return undefined;
  }

  return {
    fechaEmision: claveAcceso.substring(0, 8),
    tipoComprobante: claveAcceso.substring(8, 10),
    rucEmisor: claveAcceso.substring(10, 23),
    ambiente: claveAcceso.substring(23, 24),
    establecimiento: claveAcceso.substring(24, 27),
    puntoEmision: claveAcceso.substring(27, 30),
    secuencial: claveAcceso.substring(30, 39),
    codigoNumerico: claveAcceso.substring(39, 47),
    tipoEmision: claveAcceso.substring(47, 48),
    digitoVerificador: claveAcceso.substring(48, 49),
  };
}

// =====================================================
// DOCUMENT TYPE MAPPING
// =====================================================

/**
 * Maps internal document type to SRI code
 */
const DOCUMENT_TYPE_TO_SRI_CODE: Record<DocumentType, string> = {
  factura: SRI_DOC_TYPE.FACTURA,
  nota_credito: SRI_DOC_TYPE.NOTA_CREDITO,
  nota_debito: SRI_DOC_TYPE.NOTA_DEBITO,
  guia_remision: SRI_DOC_TYPE.GUIA_REMISION,
  retencion: SRI_DOC_TYPE.RETENCION,
};

/**
 * Gets the SRI code for a document type
 */
export function getCodigoComprobante(tipo: DocumentType): string {
  return DOCUMENT_TYPE_TO_SRI_CODE[tipo] ?? SRI_DOC_TYPE.FACTURA;
}

// =====================================================
// MAPPERS
// =====================================================

/**
 * Maps a ParsedDocument to an ATSComprasRow
 * Used when the document represents a purchase (I received this invoice)
 *
 * @param doc - Parsed document
 * @returns ATS compras row
 */
export function mapToComprasRow(doc: ParsedDocument): ATSComprasRow {
  const parsed = parseClaveAcceso(doc.claveAcceso);

  // Calculate bases - IVA gravada is IVA12 + IVA15 (or any non-zero IVA)
  const baseIvaGravada = doc.valores.iva12 + doc.valores.iva15;
  const baseIva0 = doc.valores.iva0;

  // Calculate no objeto from subtotal minus known bases
  const baseNoObjetoIva = Math.max(
    0,
    doc.valores.subtotal - baseIvaGravada - baseIva0
  );

  return {
    // Provider info (emisor of the invoice I received)
    tipoIdentificacion: SRI_TIPO_IDENTIFICACION.RUC, // emisor is always a company
    identificacion: doc.emisor.ruc,
    razonSocial: doc.emisor.razonSocial,

    // Document info
    tipoComprobante: doc.tipo,
    codigoComprobante: getCodigoComprobante(doc.tipo),
    fechaEmision: doc.fecha,
    establecimiento:
      parsed?.establecimiento ?? DEFAULT_DOCUMENTO_PARTS.ESTABLECIMIENTO,
    puntoEmision: parsed?.puntoEmision ?? DEFAULT_DOCUMENTO_PARTS.PUNTO_EMISION,
    secuencial: parsed?.secuencial ?? DEFAULT_DOCUMENTO_PARTS.SECUENCIAL,
    autorizacion: doc.numeroAutorizacion,
    claveAcceso: doc.claveAcceso,

    // Monetary values (already in cents)
    baseIvaGravada,
    baseIva0,
    baseNoObjetoIva,
    montoIva: doc.valores.iva,
    montoIce: doc.valores.ice,
    total: doc.valores.total,

    // Retenciones
    retencionIva: doc.retenciones?.iva ?? 0,
    retencionRenta: doc.retenciones?.renta ?? 0,

    // Payment
    formaPago: doc.formaPago,
  };
}

/**
 * Maps a ParsedDocument to an ATSVentasRow
 * Used when the document represents a sale (I issued this invoice)
 *
 * @param doc - Parsed document
 * @returns ATS ventas row
 */
export function mapToVentasRow(doc: ParsedDocument): ATSVentasRow {
  const parsed = parseClaveAcceso(doc.claveAcceso);

  // Calculate bases - IVA gravada is IVA12 + IVA15 (or any non-zero IVA)
  const baseIvaGravada = doc.valores.iva12 + doc.valores.iva15;
  const baseIva0 = doc.valores.iva0;

  // Calculate no objeto from subtotal minus known bases
  const baseNoObjetoIva = Math.max(
    0,
    doc.valores.subtotal - baseIvaGravada - baseIva0
  );

  return {
    // Client info (receptor of the invoice I issued)
    tipoIdentificacion: doc.receptor.tipoIdentificacion,
    identificacion: doc.receptor.identificacion,
    razonSocial: doc.receptor.razonSocial,

    // Document info
    tipoComprobante: doc.tipo,
    codigoComprobante: getCodigoComprobante(doc.tipo),
    fechaEmision: doc.fecha,
    establecimiento:
      parsed?.establecimiento ?? DEFAULT_DOCUMENTO_PARTS.ESTABLECIMIENTO,
    puntoEmision: parsed?.puntoEmision ?? DEFAULT_DOCUMENTO_PARTS.PUNTO_EMISION,
    secuencial: parsed?.secuencial ?? DEFAULT_DOCUMENTO_PARTS.SECUENCIAL,
    autorizacion: doc.numeroAutorizacion,
    claveAcceso: doc.claveAcceso,

    // Monetary values (already in cents)
    baseIvaGravada,
    baseIva0,
    baseNoObjetoIva,
    montoIva: doc.valores.iva,
    montoIce: doc.valores.ice,
    total: doc.valores.total,
  };
}

/**
 * Formats a document number from its parts
 * Format: EEE-PPP-SSSSSSSSS
 */
export function formatNumeroDocumento(
  establecimiento: string,
  puntoEmision: string,
  secuencial: string
): string {
  return `${establecimiento}-${puntoEmision}-${secuencial}`;
}

/**
 * Gets the formatted document number from a row
 */
export function getNumeroDocumento(row: ATSComprasRow | ATSVentasRow): string {
  return formatNumeroDocumento(
    row.establecimiento,
    row.puntoEmision,
    row.secuencial
  );
}
