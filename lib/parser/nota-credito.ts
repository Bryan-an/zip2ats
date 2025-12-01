/**
 * Nota de Crédito (Credit Note) parser
 */

import type {
  NotaCreditoXML,
  ParsedDocument,
  ValidationError,
} from "@/types/sri-xml";
import {
  parseSRIDate,
  parseMoneyToCents,
  ensureArray,
  normalizeString,
} from "@/lib/parser/normalizers";
import { extractTaxTotals } from "@/lib/parser/tax-utils";
import { DOCUMENT_TYPES } from "@/constants/document-types";
import type { AutorizacionInfo } from "@/lib/parser/types";
import { PARSER_ERRORS } from "@/lib/parser/errors";

interface NotaCreditoParseResult {
  success: boolean;
  document?: ParsedDocument;
  errors?: ValidationError[];
  warnings?: ValidationError[];
}

/**
 * Parse a Nota de Crédito XML document into normalized format
 */
export function parseNotaCredito(
  xml: NotaCreditoXML,
  autorizacion: AutorizacionInfo,
  xmlHash: string
): NotaCreditoParseResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  try {
    const { notaCredito } = xml;
    const { infoTributaria, infoNotaCredito } = notaCredito;

    // Extract tax totals
    const totalesImpuesto = ensureArray(
      infoNotaCredito.totalConImpuestos.totalImpuesto
    );

    const { iva0, iva12, iva15, ivaTotal, iceTotal, irbpnrTotal } =
      extractTaxTotals(totalesImpuesto);

    // Build normalized document
    const document: ParsedDocument = {
      tipo: DOCUMENT_TYPES.NOTA_CREDITO,
      claveAcceso: normalizeString(infoTributaria.claveAcceso),
      numeroAutorizacion: autorizacion.numeroAutorizacion,
      fechaAutorizacion: autorizacion.fechaAutorizacion,
      ambiente: autorizacion.ambiente,

      emisor: {
        ruc: normalizeString(infoTributaria.ruc),
        razonSocial: normalizeString(infoTributaria.razonSocial),
        nombreComercial: infoTributaria.nombreComercial
          ? normalizeString(infoTributaria.nombreComercial)
          : undefined,
      },

      receptor: {
        tipoIdentificacion: infoNotaCredito.tipoIdentificacionComprador,
        identificacion: normalizeString(
          infoNotaCredito.identificacionComprador
        ),
        razonSocial: normalizeString(infoNotaCredito.razonSocialComprador),
      },

      fecha: parseSRIDate(infoNotaCredito.fechaEmision),

      valores: {
        subtotal: parseMoneyToCents(infoNotaCredito.totalSinImpuestos),
        iva0,
        iva12,
        iva15,
        iva: ivaTotal,
        ice: iceTotal,
        irbpnr: irbpnrTotal,
        propina: 0,
        total: parseMoneyToCents(infoNotaCredito.valorModificacion),
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

    // Check for modified document reference
    if (!infoNotaCredito.numDocModificado) {
      warnings.push({
        code: PARSER_ERRORS.MISSING_DOC_MODIFICADO,
        message: "Número de documento modificado no encontrado",
        field: "numDocModificado",
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
          message: `Error al parsear nota de crédito: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}
