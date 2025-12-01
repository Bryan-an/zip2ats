/**
 * Guía de Remisión (Delivery Note) parser
 */

import type {
  GuiaRemisionXML,
  ParsedDocument,
  ValidationError,
} from "@/types/sri-xml";
import {
  parseSRIDate,
  normalizeString,
  ensureArray,
} from "@/lib/parser/normalizers";
import { DOCUMENT_TYPES } from "@/constants/document-types";
import type { AutorizacionInfo } from "@/lib/parser/types";
import { PARSER_ERRORS } from "@/lib/parser/errors";

interface GuiaRemisionParseResult {
  success: boolean;
  document?: ParsedDocument;
  errors?: ValidationError[];
  warnings?: ValidationError[];
}

/**
 * Parse a Guía de Remisión XML document into normalized format
 * Note: Guía de Remisión doesn't have monetary values, it's a transport document
 */
export function parseGuiaRemision(
  xml: GuiaRemisionXML,
  autorizacion: AutorizacionInfo,
  xmlHash: string
): GuiaRemisionParseResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  try {
    const { guiaRemision } = xml;
    const { infoTributaria, infoGuiaRemision, destinatarios } = guiaRemision;

    // Get first destinatario for receptor info
    const destinatariosArray = ensureArray(destinatarios.destinatario);
    const primerDestinatario = destinatariosArray[0];

    // Build normalized document
    const document: ParsedDocument = {
      tipo: DOCUMENT_TYPES.GUIA_REMISION,
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

      // Receptor is the transporter
      receptor: {
        tipoIdentificacion: infoGuiaRemision.tipoIdentificacionTransportista,
        identificacion: normalizeString(infoGuiaRemision.rucTransportista),
        razonSocial: normalizeString(infoGuiaRemision.razonSocialTransportista),
      },

      fecha: parseSRIDate(infoGuiaRemision.fechaIniTransporte),

      // Guía de Remisión has no monetary values
      valores: {
        subtotal: 0,
        iva0: 0,
        iva12: 0,
        iva15: 0,
        iva: 0,
        ice: 0,
        irbpnr: 0,
        propina: 0,
        total: 0,
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

    // Warnings
    if (!primerDestinatario) {
      warnings.push({
        code: PARSER_ERRORS.NO_DESTINATARIOS,
        message: "No se encontraron destinatarios en la guía",
        field: "destinatarios",
      });
    }

    if (!infoGuiaRemision.placa) {
      warnings.push({
        code: PARSER_ERRORS.MISSING_PLACA,
        message: "Placa del vehículo no encontrada",
        field: "placa",
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
          message: `Error al parsear guía de remisión: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}
