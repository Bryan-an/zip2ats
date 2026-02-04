import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { sriCatalogs } from "@/db/schema";

// =====================================================
// BASE TYPES
// =====================================================

export type SRICatalog = InferSelectModel<typeof sriCatalogs>;

// =====================================================
// TABLE INSERT TYPES (for creating records)
// =====================================================

export type NewSRICatalog = InferInsertModel<typeof sriCatalogs>;

// =====================================================
// ENUM TYPES
// =====================================================

export type CatalogType =
  | "forma_pago"
  | "tipo_identificacion"
  | "tipo_documento"
  | "sustento_tributario"
  | "codigo_retencion_iva"
  | "codigo_retencion_renta";
