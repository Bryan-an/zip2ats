/**
 * Detect document type from parsed XML structure
 */

import type {
  FacturaXML,
  RetencionXML,
  NotaCreditoXML,
  NotaDebitoXML,
  GuiaRemisionXML,
  SRIAutorizacionXML,
} from "@/types/sri-xml";
import { SRI_DOC_TYPE, type SRIDocType } from "@/constants/sri-codes";
import { DOCUMENT_TYPES, type DocumentType } from "@/constants/document-types";

interface DetectionResult {
  detected: boolean;
  type?: DocumentType;
  error?: string;
}

/**
 * Check if parsed XML is an SRI authorization envelope
 */
export function isAutorizacionEnvelope(
  parsed: unknown
): parsed is SRIAutorizacionXML {
  if (!parsed || typeof parsed !== "object") return false;

  const obj = parsed as Record<string, unknown>;

  return (
    "autorizacion" in obj &&
    typeof obj.autorizacion === "object" &&
    obj.autorizacion !== null &&
    "comprobante" in (obj.autorizacion as Record<string, unknown>)
  );
}

/**
 * Extract comprobante XML from authorization envelope
 * SRI wraps the actual document in CDATA within autorizacion.comprobante
 */
export function extractComprobante(autorizacion: SRIAutorizacionXML): {
  xml: string;
  numeroAutorizacion: string;
  fechaAutorizacion: string;
  estado: string;
  ambiente: string;
} {
  const { autorizacion: auth } = autorizacion;

  // The comprobante field contains the XML string (may be in CDATA)
  let comprobanteXML = auth.comprobante;

  // If it's wrapped in CDATA object, extract the text
  if (
    typeof comprobanteXML === "object" &&
    comprobanteXML !== null &&
    "__cdata" in (comprobanteXML as Record<string, unknown>)
  ) {
    comprobanteXML = (comprobanteXML as Record<string, string>).__cdata;
  }

  return {
    xml: String(comprobanteXML),
    numeroAutorizacion: auth.numeroAutorizacion,
    fechaAutorizacion: auth.fechaAutorizacion,
    estado: auth.estado,
    ambiente: auth.ambiente,
  };
}

/**
 * Detect document type from parsed comprobante XML
 */
export function detectDocumentType(parsed: unknown): DetectionResult {
  if (!parsed || typeof parsed !== "object") {
    return {
      detected: false,
      error: "XML parseado está vacío o no es un objeto",
    };
  }

  const obj = parsed as Record<string, unknown>;

  // Check for each document type by root element
  if ("factura" in obj) {
    return { detected: true, type: DOCUMENT_TYPES.FACTURA };
  }

  if ("comprobanteRetencion" in obj) {
    return { detected: true, type: DOCUMENT_TYPES.RETENCION };
  }

  if ("notaCredito" in obj) {
    return { detected: true, type: DOCUMENT_TYPES.NOTA_CREDITO };
  }

  if ("notaDebito" in obj) {
    return { detected: true, type: DOCUMENT_TYPES.NOTA_DEBITO };
  }

  if ("guiaRemision" in obj) {
    return { detected: true, type: DOCUMENT_TYPES.GUIA_REMISION };
  }

  // Could not detect type
  const keys = Object.keys(obj).filter((k) => !k.startsWith("?"));

  return {
    detected: false,
    error: `Tipo de documento no reconocido. Elementos raíz: ${keys.join(", ")}`,
  };
}

/**
 * Get document type from codDoc field in infoTributaria
 */
export function getDocumentTypeFromCodDoc(codDoc: string): DocumentType | null {
  const map: Record<SRIDocType, DocumentType> = {
    [SRI_DOC_TYPE.FACTURA]: DOCUMENT_TYPES.FACTURA,
    [SRI_DOC_TYPE.LIQUIDACION]: DOCUMENT_TYPES.FACTURA, // Liquidación treated as factura
    [SRI_DOC_TYPE.NOTA_CREDITO]: DOCUMENT_TYPES.NOTA_CREDITO,
    [SRI_DOC_TYPE.NOTA_DEBITO]: DOCUMENT_TYPES.NOTA_DEBITO,
    [SRI_DOC_TYPE.GUIA_REMISION]: DOCUMENT_TYPES.GUIA_REMISION,
    [SRI_DOC_TYPE.RETENCION]: DOCUMENT_TYPES.RETENCION,
  };

  return map[codDoc as SRIDocType] || null;
}

/**
 * Type guards for specific document types
 */
export function isFactura(parsed: unknown): parsed is FacturaXML {
  return (
    parsed !== null &&
    typeof parsed === "object" &&
    "factura" in (parsed as Record<string, unknown>)
  );
}

export function isRetencion(parsed: unknown): parsed is RetencionXML {
  return (
    parsed !== null &&
    typeof parsed === "object" &&
    "comprobanteRetencion" in (parsed as Record<string, unknown>)
  );
}

export function isNotaCredito(parsed: unknown): parsed is NotaCreditoXML {
  return (
    parsed !== null &&
    typeof parsed === "object" &&
    "notaCredito" in (parsed as Record<string, unknown>)
  );
}

export function isNotaDebito(parsed: unknown): parsed is NotaDebitoXML {
  return (
    parsed !== null &&
    typeof parsed === "object" &&
    "notaDebito" in (parsed as Record<string, unknown>)
  );
}

export function isGuiaRemision(parsed: unknown): parsed is GuiaRemisionXML {
  return (
    parsed !== null &&
    typeof parsed === "object" &&
    "guiaRemision" in (parsed as Record<string, unknown>)
  );
}
