/**
 * Zod validation schemas for SRI XML parsed documents
 * Reusable from both server and client code
 */

import { z } from "zod";
import { DOCUMENT_TYPES } from "@/constants/document-types";
import type { DocumentType } from "@/constants/document-types";
import {
  SRI_AMBIENTE,
  SRI_TIPO_IDENTIFICACION,
  SRI_FORMA_PAGO,
} from "@/constants/sri-codes";
import type {
  SRIAmbiente,
  SRITipoIdentificacion,
  SRIFormaPago,
} from "@/constants/sri-codes";

// =====================================================
// ENUM SCHEMAS
// =====================================================

export const DocumentTypeSchema = z.enum(
  Object.values(DOCUMENT_TYPES) as [DocumentType, ...DocumentType[]]
);

export const SRIAmbienteSchema = z.enum(
  Object.values(SRI_AMBIENTE) as [SRIAmbiente, ...SRIAmbiente[]]
);

export const SRITipoIdentificacionSchema = z.enum(
  Object.values(SRI_TIPO_IDENTIFICACION) as [
    SRITipoIdentificacion,
    ...SRITipoIdentificacion[],
  ]
);

export const SRIFormaPagoSchema = z.enum(
  Object.values(SRI_FORMA_PAGO) as [SRIFormaPago, ...SRIFormaPago[]]
);

// =====================================================
// PARSED DOCUMENT SCHEMA
// =====================================================

const CentsSchema = z.number().int();

const ValoresSchema = z.object({
  subtotal: CentsSchema,
  iva0: CentsSchema,
  iva12: CentsSchema,
  iva15: CentsSchema,
  iva: CentsSchema,
  ice: CentsSchema,
  irbpnr: CentsSchema,
  propina: CentsSchema,
  total: CentsSchema,
});

const RetencionesSchema = z.object({
  iva: CentsSchema,
  renta: CentsSchema,
});

/**
 * Zod schema for validating ParsedDocument payloads.
 * Keeps request validation strict and provides TS inference.
 */
export const ParsedDocumentSchema = z.object({
  tipo: DocumentTypeSchema,
  claveAcceso: z
    .string()
    .regex(/^\d{49}$/, "Clave de acceso inválida (49 dígitos)"),
  numeroAutorizacion: z.string().min(1, "Número de autorización requerido"),
  fechaAutorizacion: z.string().min(1, "Fecha de autorización requerida"),
  ambiente: SRIAmbienteSchema,

  emisor: z.object({
    ruc: z.string().regex(/^\d{13}$/, "RUC del emisor inválido (13 dígitos)"),
    razonSocial: z.string().min(1, "Razón social del emisor requerida"),
    nombreComercial: z.string().optional(),
  }),

  receptor: z.object({
    tipoIdentificacion: SRITipoIdentificacionSchema,
    identificacion: z.string().min(1, "Identificación del receptor requerida"),
    razonSocial: z.string().min(1, "Razón social del receptor requerida"),
  }),

  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (ISO date YYYY-MM-DD)")
    .refine(
      (value) => {
        const date = new Date(`${value}T00:00:00.000Z`);

        return (
          !Number.isNaN(date.getTime()) &&
          date.toISOString().slice(0, 10) === value
        );
      },
      { message: "Fecha inválida (fecha no existe)" }
    ),

  valores: ValoresSchema,
  retenciones: RetencionesSchema.optional(),
  formaPago: SRIFormaPagoSchema.optional(),

  xmlHash: z
    .string()
    .regex(/^[a-f0-9]{64}$/i, "xmlHash inválido (SHA-256 hex)"),
});

/**
 * Inferred TypeScript type from ParsedDocumentSchema
 * Use this when you need the type instead of the schema
 */
export type ParsedDocumentInput = z.infer<typeof ParsedDocumentSchema>;
