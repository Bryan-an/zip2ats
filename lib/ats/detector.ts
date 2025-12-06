/**
 * Transaction type detector
 * Classifies documents as purchases (compras) or sales (ventas)
 */

import type { ParsedDocument } from "@/types/sri-xml";
import { TRANSACTION_TYPES, TransactionType } from "./constants";
import type { ClassifiedDocument } from "./types";

/**
 * Detects if a document is a purchase or sale based on the taxpayer's RUC
 *
 * Logic:
 * - If emisor.ruc === contribuyenteRuc → VENTA (I issued this document)
 * - If receptor.identificacion === contribuyenteRuc → COMPRA (I received this document)
 *
 * @param document - Parsed document to classify
 * @param contribuyenteRuc - RUC of the taxpayer generating the report
 * @returns Transaction type (compra or venta)
 */
export function detectTransactionType(
  document: ParsedDocument,
  contribuyenteRuc: string
): TransactionType {
  // If I am the emisor, it's a sale
  if (document.emisor.ruc === contribuyenteRuc) {
    return TRANSACTION_TYPES.VENTA;
  }

  // If I am the receptor, it's a purchase
  if (document.receptor.identificacion === contribuyenteRuc) {
    return TRANSACTION_TYPES.COMPRA;
  }

  // Default to compra (most common use case: processing supplier invoices)
  return TRANSACTION_TYPES.COMPRA;
}

/**
 * Infers the taxpayer RUC from a batch of documents
 *
 * Strategy:
 * 1. Find the most common receptor identification (assuming most docs are purchases)
 * 2. If all documents have the same emisor, use that (assuming all are sales)
 *
 * @param documents - Array of parsed documents
 * @returns Inferred RUC or undefined if cannot determine
 */
export function inferContribuyenteRuc(
  documents: ParsedDocument[]
): string | undefined {
  if (documents.length === 0) {
    return undefined;
  }

  // Count occurrences of receptor identifications
  const receptorCounts = new Map<string, number>();

  // Count occurrences of emisor RUCs
  const emisorCounts = new Map<string, number>();

  for (const doc of documents) {
    const receptorId = doc.receptor.identificacion;
    const emisorRuc = doc.emisor.ruc;

    receptorCounts.set(receptorId, (receptorCounts.get(receptorId) ?? 0) + 1);
    emisorCounts.set(emisorRuc, (emisorCounts.get(emisorRuc) ?? 0) + 1);
  }

  // If all documents have the same emisor, it's likely all sales
  if (emisorCounts.size === 1) {
    const [emisorRuc] = emisorCounts.keys();
    return emisorRuc;
  }

  // Otherwise, find the most common receptor (likely the taxpayer receiving invoices)
  let maxCount = 0;
  let inferredRuc: string | undefined;

  for (const [ruc, count] of receptorCounts) {
    // Only consider valid RUCs (13 digits)
    if (ruc.length === 13 && count > maxCount) {
      maxCount = count;
      inferredRuc = ruc;
    }
  }

  return inferredRuc;
}

/**
 * Classifies a batch of documents into purchases and sales
 *
 * @param documents - Array of parsed documents
 * @param contribuyenteRuc - RUC of the taxpayer (will be inferred if not provided)
 * @returns Array of classified documents with transaction type
 */
export function classifyDocuments(
  documents: ParsedDocument[],
  contribuyenteRuc?: string
): ClassifiedDocument[] {
  // Infer RUC if not provided
  const ruc = contribuyenteRuc ?? inferContribuyenteRuc(documents);

  if (!ruc) {
    // Cannot determine RUC, classify all as purchases (default)
    return documents.map((document) => ({
      document,
      transactionType: TRANSACTION_TYPES.COMPRA,
    }));
  }

  return documents.map((document) => ({
    document,
    transactionType: detectTransactionType(document, ruc),
  }));
}

/**
 * Separates classified documents into compras and ventas arrays
 *
 * @param classified - Array of classified documents
 * @returns Object with compras and ventas arrays
 */
export function separateByTransactionType(classified: ClassifiedDocument[]): {
  compras: ParsedDocument[];
  ventas: ParsedDocument[];
} {
  const compras: ParsedDocument[] = [];
  const ventas: ParsedDocument[] = [];

  for (const { document, transactionType } of classified) {
    if (transactionType === TRANSACTION_TYPES.COMPRA) {
      compras.push(document);
    } else {
      ventas.push(document);
    }
  }

  return { compras, ventas };
}
