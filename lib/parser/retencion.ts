/**
 * Retención (Withholding) parser
 */

import type {
  RetencionXML,
  ParsedDocument,
  ValidationError,
} from "@/types/sri-xml";
import {
  parseSRIDate,
  parseMoneyToCents,
  ensureArray,
  normalizeString,
} from "@/lib/parser/normalizers";
import { DOCUMENT_TYPES } from "@/constants/document-types";
import type { AutorizacionInfo } from "@/lib/parser/types";
import { PARSER_ERRORS } from "@/lib/parser/errors";
import { SRI_RETENTION_TYPE } from "@/constants/sri-codes";

interface RetencionParseResult {
  success: boolean;
  document?: ParsedDocument;
  errors?: ValidationError[];
  warnings?: ValidationError[];
}

interface RetentionTotals {
  retencionIva: number;
  retencionRenta: number;
  baseImponibleTotal: number;
}

/**
 * Parse a Retención XML document into normalized format
 */
export function parseRetencion(
  xml: RetencionXML,
  autorizacion: AutorizacionInfo,
  xmlHash: string
): RetencionParseResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  try {
    const { comprobanteRetencion } = xml;

    const { infoTributaria, infoCompRetencion, impuestos } =
      comprobanteRetencion;

    // Extract retention totals
    const impuestosArray = ensureArray(impuestos.impuesto);

    const { retencionIva, retencionRenta, baseImponibleTotal } =
      extractRetentionTotals(impuestosArray);

    // Build normalized document
    const document: ParsedDocument = {
      tipo: DOCUMENT_TYPES.RETENCION,
      claveAcceso: normalizeString(infoTributaria.claveAcceso),
      numeroAutorizacion: autorizacion.numeroAutorizacion,
      fechaAutorizacion: autorizacion.fechaAutorizacion,
      ambiente: autorizacion.ambiente,

      // In retention, the emitter is who retains (the buyer)
      emisor: {
        ruc: normalizeString(infoTributaria.ruc),
        razonSocial: normalizeString(infoTributaria.razonSocial),
        nombreComercial: infoTributaria.nombreComercial
          ? normalizeString(infoTributaria.nombreComercial)
          : undefined,
      },

      // The receptor is the subject retained (the seller)
      receptor: {
        tipoIdentificacion: infoCompRetencion.tipoIdentificacionSujetoRetenido,
        identificacion: normalizeString(
          infoCompRetencion.identificacionSujetoRetenido
        ),
        razonSocial: normalizeString(
          infoCompRetencion.razonSocialSujetoRetenido
        ),
      },

      fecha: parseSRIDate(infoCompRetencion.fechaEmision),

      valores: {
        subtotal: baseImponibleTotal,
        iva0: 0,
        iva12: 0,
        iva15: 0,
        iva: 0,
        ice: 0,
        irbpnr: 0,
        propina: 0,
        total: retencionIva + retencionRenta, // Total retained
      },

      retenciones: {
        iva: retencionIva,
        renta: retencionRenta,
      },

      xmlHash,
    };

    // Validations
    if (!document.claveAcceso) {
      errors.push({
        code: PARSER_ERRORS.MISSING_CLAVE_ACCESO,
        message: "Clave de acceso no encontrada",
        field: "claveAcceso",
      });
    }

    if (!document.emisor.ruc) {
      errors.push({
        code: PARSER_ERRORS.MISSING_EMISOR_RUC,
        message: "RUC del emisor no encontrado",
        field: "emisor.ruc",
      });
    }

    if (impuestosArray.length === 0) {
      warnings.push({
        code: PARSER_ERRORS.NO_RETENTIONS,
        message: "No se encontraron impuestos retenidos",
        field: "impuestos",
      });
    }

    return {
      success: errors.length === 0,
      document: errors.length === 0 ? document : undefined,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          code: PARSER_ERRORS.PARSE_ERROR,
          message: `Error al parsear retención: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

/**
 * Extract retention totals from impuestos
 * Codes: 1=Renta, 2=IVA
 */
function extractRetentionTotals(
  impuestos: RetencionXML["comprobanteRetencion"]["impuestos"]["impuesto"][]
): RetentionTotals {
  let retencionIva = 0;
  let retencionRenta = 0;
  let baseImponibleTotal = 0;

  const flatImpuestos = impuestos.flat();

  for (const impuesto of flatImpuestos) {
    const valorRetenido = parseMoneyToCents(impuesto.valorRetenido);
    const baseImponible = parseMoneyToCents(impuesto.baseImponible);

    baseImponibleTotal += baseImponible;

    switch (impuesto.codigo) {
      case SRI_RETENTION_TYPE.RENTA:
        retencionRenta += valorRetenido;
        break;
      case SRI_RETENTION_TYPE.IVA:
        retencionIva += valorRetenido;
        break;
    }
  }

  return { retencionIva, retencionRenta, baseImponibleTotal };
}
