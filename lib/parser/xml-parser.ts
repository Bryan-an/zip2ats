/**
 * Main XML Parser entry point
 * Handles the complete pipeline: validate → parse → detect → normalize
 */

import type {
  ParserOptions,
  ParserResult,
  FacturaXML,
  RetencionXML,
  NotaCreditoXML,
  NotaDebitoXML,
  GuiaRemisionXML,
} from "@/types/sri-xml";
import { createSRIParser } from "@/lib/parser/config";
import { validateXML, computeXMLHash } from "@/lib/parser/validators";
import { parseSRIDateTime } from "@/lib/parser/normalizers";
import {
  detectDocumentType,
  isAutorizacionEnvelope,
  extractComprobante,
  isFactura,
  isRetencion,
  isNotaCredito,
  isNotaDebito,
  isGuiaRemision,
} from "@/lib/parser/document-detector";
import { DOCUMENT_TYPES } from "@/constants/document-types";
import { parseFactura } from "@/lib/parser/factura";
import { parseRetencion } from "@/lib/parser/retencion";
import { parseNotaCredito } from "@/lib/parser/nota-credito";
import { parseNotaDebito } from "@/lib/parser/nota-debito";
import { parseGuiaRemision } from "@/lib/parser/guia-remision";
import type { AutorizacionInfo } from "@/lib/parser/types";
import { PARSER_ERRORS } from "@/lib/parser/errors";
import {
  SRI_AMBIENTE,
  SRI_ESTADO_AUTORIZACION,
  type SRIAmbiente,
} from "@/constants/sri-codes";

/**
 * Parse an SRI XML document
 *
 * @param xmlString - The raw XML string (can be authorization envelope or direct comprobante)
 * @param options - Parser options
 * @returns ParserResult with success status, parsed document, and any errors/warnings
 */
export async function parseXML(
  xmlString: string,
  options: ParserOptions = {}
): Promise<ParserResult> {
  const { validate = true, includeWarnings = true, strict = false } = options;
  const errors: ParserResult["errors"] = [];
  const warnings: ParserResult["warnings"] = [];

  // Step 1: Validate XML syntax
  if (validate) {
    const validationResult = validateXML(xmlString);

    if (!validationResult.isValid) {
      return {
        success: false,
        errors: validationResult.errors.map((e) => ({
          code: e.code,
          message: e.message,
          field: e.field,
        })),
      };
    }
  }

  // Step 2: Parse XML to object
  const parser = createSRIParser();
  let parsed: unknown;

  try {
    parsed = parser.parse(xmlString);
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          code: PARSER_ERRORS.XML_PARSE_ERROR,
          message: `Error al parsear XML: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }

  // Step 3: Check if it's an authorization envelope and extract comprobante
  let comprobanteXML = xmlString;

  let autorizacion: AutorizacionInfo & { estado: string } = {
    numeroAutorizacion: "",
    fechaAutorizacion: "",
    ambiente: SRI_AMBIENTE.PRODUCCION,
    estado: SRI_ESTADO_AUTORIZACION.AUTORIZADO,
  };

  if (isAutorizacionEnvelope(parsed)) {
    const extracted = extractComprobante(parsed);

    // Validate authorization status
    if (extracted.estado !== SRI_ESTADO_AUTORIZACION.AUTORIZADO) {
      return {
        success: false,
        errors: [
          {
            code: PARSER_ERRORS.NOT_AUTHORIZED,
            message: `El documento no está autorizado. Estado: ${extracted.estado}`,
          },
        ],
      };
    }

    autorizacion = {
      numeroAutorizacion: extracted.numeroAutorizacion,
      fechaAutorizacion: parseSRIDateTime(extracted.fechaAutorizacion),
      ambiente: extracted.ambiente as SRIAmbiente,
      estado: extracted.estado,
    };

    comprobanteXML = extracted.xml;

    // Parse the inner comprobante XML
    try {
      parsed = parser.parse(comprobanteXML);
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            code: PARSER_ERRORS.COMPROBANTE_PARSE_ERROR,
            message: `Error al parsear comprobante interno: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  // Step 4: Detect document type
  const detection = detectDocumentType(parsed);

  if (!detection.detected || !detection.type) {
    return {
      success: false,
      errors: [
        {
          code: PARSER_ERRORS.UNKNOWN_DOCUMENT_TYPE,
          message:
            detection.error || "No se pudo detectar el tipo de documento",
        },
      ],
    };
  }

  // Step 5: Compute XML hash for deduplication
  const xmlHash = await computeXMLHash(comprobanteXML);

  // Step 6: Parse based on document type
  let parseResult: ParserResult;

  switch (detection.type) {
    case DOCUMENT_TYPES.FACTURA:
      if (!isFactura(parsed)) {
        return {
          success: false,
          errors: [
            {
              code: PARSER_ERRORS.INVALID_FACTURA_STRUCTURE,
              message: "Estructura de factura inválida",
            },
          ],
        };
      }

      parseResult = parseFactura(parsed as FacturaXML, autorizacion, xmlHash);
      break;

    case DOCUMENT_TYPES.RETENCION:
      if (!isRetencion(parsed)) {
        return {
          success: false,
          errors: [
            {
              code: PARSER_ERRORS.INVALID_RETENCION_STRUCTURE,
              message: "Estructura de retención inválida",
            },
          ],
        };
      }

      parseResult = parseRetencion(
        parsed as RetencionXML,
        autorizacion,
        xmlHash
      );

      break;

    case DOCUMENT_TYPES.NOTA_CREDITO:
      if (!isNotaCredito(parsed)) {
        return {
          success: false,
          errors: [
            {
              code: PARSER_ERRORS.INVALID_NOTA_CREDITO_STRUCTURE,
              message: "Estructura de nota de crédito inválida",
            },
          ],
        };
      }

      parseResult = parseNotaCredito(
        parsed as NotaCreditoXML,
        autorizacion,
        xmlHash
      );

      break;

    case DOCUMENT_TYPES.NOTA_DEBITO:
      if (!isNotaDebito(parsed)) {
        return {
          success: false,
          errors: [
            {
              code: PARSER_ERRORS.INVALID_NOTA_DEBITO_STRUCTURE,
              message: "Estructura de nota de débito inválida",
            },
          ],
        };
      }

      parseResult = parseNotaDebito(
        parsed as NotaDebitoXML,
        autorizacion,
        xmlHash
      );

      break;

    case DOCUMENT_TYPES.GUIA_REMISION:
      if (!isGuiaRemision(parsed)) {
        return {
          success: false,
          errors: [
            {
              code: PARSER_ERRORS.INVALID_GUIA_REMISION_STRUCTURE,
              message: "Estructura de guía de remisión inválida",
            },
          ],
        };
      }

      parseResult = parseGuiaRemision(
        parsed as GuiaRemisionXML,
        autorizacion,
        xmlHash
      );

      break;

    default:
      return {
        success: false,
        errors: [
          {
            code: PARSER_ERRORS.UNSUPPORTED_DOCUMENT_TYPE,
            message: `Tipo de documento no soportado: ${detection.type}`,
          },
        ],
      };
  }

  // Step 7: Handle strict mode
  if (strict && parseResult.warnings && parseResult.warnings.length > 0) {
    return {
      success: false,
      errors: [
        ...(parseResult.errors || []),
        ...parseResult.warnings.map((w) => ({
          code: w.code,
          message: `[Strict] ${w.message}`,
          field: w.field,
        })),
      ],
    };
  }

  // Step 8: Merge errors and warnings
  if (parseResult.errors) {
    errors.push(...parseResult.errors);
  }

  if (includeWarnings && parseResult.warnings) {
    warnings.push(...parseResult.warnings);
  }

  return {
    success: parseResult.success,
    document: parseResult.document,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Parse multiple XML documents in batch
 *
 * @param xmlStrings - Array of XML strings to parse
 * @param options - Parser options (applied to all documents)
 * @returns Array of ParserResults
 */
export async function parseXMLBatch(
  xmlStrings: string[],
  options: ParserOptions = {}
): Promise<ParserResult[]> {
  return Promise.all(xmlStrings.map((xml) => parseXML(xml, options)));
}

/**
 * Quick check if XML is a valid SRI document without full parsing
 */
export function isValidSRIDocument(xmlString: string): boolean {
  const validationResult = validateXML(xmlString);
  if (!validationResult.isValid) return false;

  const parser = createSRIParser();

  try {
    const parsed = parser.parse(xmlString);

    // Check for authorization envelope
    if (isAutorizacionEnvelope(parsed)) {
      return true;
    }

    // Check for direct document types
    const detection = detectDocumentType(parsed);
    return detection.detected;
  } catch {
    return false;
  }
}
