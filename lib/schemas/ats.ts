/**
 * Zod validation schemas for ATS (Anexo Transaccional Simplificado) API
 * Reusable from both server and client code
 */

import { z } from "zod";
import { ParsedDocumentSchema } from "@/lib/schemas/sri-xml";
import { ATS_FILE_FORMATS, CSV_SECTIONS } from "@/lib/ats/constants";
import type { ATSFileFormat, CSVSection } from "@/lib/ats/constants";
import {
  MAX_DOCUMENTS_PER_REQUEST,
  PERIODO_REGEX,
  RUC_REGEX,
} from "@/constants/ats";

// =====================================================
// OPTIONS SCHEMA
// =====================================================

/**
 * Schema for ATS generation options
 */
export const GenerateATSOptionsSchema = z.strictObject({
  /** Output format: xlsx (Excel) or csv */
  formato: z
    .enum(
      [ATS_FILE_FORMATS.XLSX, ATS_FILE_FORMATS.CSV] as [
        ATSFileFormat,
        ...ATSFileFormat[],
      ],
      {
        error: `Formato inválido. Debe ser '${ATS_FILE_FORMATS.XLSX}' o '${ATS_FILE_FORMATS.CSV}'`,
      }
    )
    .optional(),
  /** Period in YYYY-MM format (inferred if not provided) */
  periodo: z
    .string()
    .regex(PERIODO_REGEX, "Período inválido. Debe estar en formato YYYY-MM")
    .optional(),
  /** RUC of taxpayer (inferred if not provided) */
  contribuyenteRuc: z
    .string()
    .regex(RUC_REGEX, "RUC inválido. Debe tener 13 dígitos")
    .optional(),
  /** CSV section to export. If not provided, returns ZIP with both sections (compras and ventas) */
  csvSection: z
    .enum(
      [CSV_SECTIONS.COMPRAS, CSV_SECTIONS.VENTAS] as [
        CSVSection,
        ...CSVSection[],
      ],
      {
        error: `Sección CSV inválida. Debe ser '${CSV_SECTIONS.COMPRAS}' o '${CSV_SECTIONS.VENTAS}'`,
      }
    )
    .optional(),
});

/**
 * Inferred TypeScript type for ATS generation options
 */
export type GenerateATSOptions = z.infer<typeof GenerateATSOptionsSchema>;

// =====================================================
// REQUEST SCHEMA
// =====================================================

/**
 * Schema for POST /api/ats/generate request body
 */
export const GenerateATSRequestSchema = z.strictObject({
  documents: z
    .array(ParsedDocumentSchema)
    .min(1, "El array de documentos está vacío")
    .max(
      MAX_DOCUMENTS_PER_REQUEST,
      `El número de documentos excede el máximo permitido (${MAX_DOCUMENTS_PER_REQUEST})`
    ),
  options: GenerateATSOptionsSchema.optional(),
});

/**
 * Inferred TypeScript type for ATS generation request
 */
export type GenerateATSRequest = z.infer<typeof GenerateATSRequestSchema>;
