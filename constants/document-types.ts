/**
 * Internal document type identifiers (not SRI codes)
 * Used for ParsedDocument.tipo and internal classification
 */
export const DOCUMENT_TYPES = {
  FACTURA: "factura",
  RETENCION: "retencion",
  NOTA_CREDITO: "nota_credito",
  NOTA_DEBITO: "nota_debito",
  GUIA_REMISION: "guia_remision",
} as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES];

/**
 * Human-readable labels for document types
 */
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  factura: "Factura",
  retencion: "Retención",
  nota_credito: "Nota de Crédito",
  nota_debito: "Nota de Débito",
  guia_remision: "Guía de Remisión",
};
