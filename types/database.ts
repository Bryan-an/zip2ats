import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  organizations,
  users,
  uploadBatches,
  documents,
  atsReports,
  auditLogs,
  organizationSettings,
  sriCatalogs,
} from "@/db/schema";

// =====================================================
// BASE TYPES
// =====================================================

export type UUID = string;
export type UnixTimestamp = number;
export type RUC = string;

// =====================================================
// TABLE SELECT TYPES (for reading from DB)
// =====================================================

export type Organization = InferSelectModel<typeof organizations>;
export type User = InferSelectModel<typeof users>;
export type UploadBatch = InferSelectModel<typeof uploadBatches>;
export type Document = InferSelectModel<typeof documents>;
export type ATSReport = InferSelectModel<typeof atsReports>;
export type AuditLog = InferSelectModel<typeof auditLogs>;
export type OrganizationSettings = InferSelectModel<
  typeof organizationSettings
>;
export type SRICatalog = InferSelectModel<typeof sriCatalogs>;

// =====================================================
// TABLE INSERT TYPES (for creating records)
// =====================================================

export type NewOrganization = InferInsertModel<typeof organizations>;
export type NewUser = InferInsertModel<typeof users>;
export type NewUploadBatch = InferInsertModel<typeof uploadBatches>;
export type NewDocument = InferInsertModel<typeof documents>;
export type NewATSReport = InferInsertModel<typeof atsReports>;
export type NewAuditLog = InferInsertModel<typeof auditLogs>;
export type NewOrganizationSettings = InferInsertModel<
  typeof organizationSettings
>;
export type NewSRICatalog = InferInsertModel<typeof sriCatalogs>;

// =====================================================
// ENUM TYPES
// =====================================================

export type OrganizationPlan = "free" | "starter" | "pro" | "enterprise";
export type OrganizationStatus = "active" | "suspended" | "cancelled";
export type UserRole = "owner" | "admin" | "member";
export type UploadBatchStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";
export type TipoDocumento =
  | "factura"
  | "retencion"
  | "nota_credito"
  | "nota_debito"
  | "guia_remision";
export type TipoIdentificacion = "04" | "05" | "06" | "07" | "08";
export type DocumentProcessingStatus = "success" | "warning" | "error";
export type TipoReporte = "compras" | "ventas" | "completo";
export type FormatoReporte = "xlsx" | "csv";
export type AuditAction =
  | "upload"
  | "process"
  | "generate_report"
  | "delete"
  | "update_settings"
  | "user_login"
  | "user_logout";
export type EntityType =
  | "batch"
  | "document"
  | "report"
  | "user"
  | "organization";
export type CatalogType =
  | "forma_pago"
  | "tipo_identificacion"
  | "tipo_documento"
  | "sustento_tributario"
  | "codigo_retencion_iva"
  | "codigo_retencion_renta";

// =====================================================
// UTILITY TYPES
// =====================================================

/**
 * Organization with related settings
 */
export interface OrganizationWithSettings extends Organization {
  settings?: OrganizationSettings;
}

/**
 * User with organization details
 */
export interface UserWithOrganization extends User {
  organization: Organization;
}

/**
 * Upload batch with processing stats
 */
export interface UploadBatchWithStats extends UploadBatch {
  successRate: number; // 0-100
  isComplete: boolean;
}

/**
 * Document with monetary values in dollars (for display)
 */
export interface DocumentWithDollars
  extends Omit<
    Document,
    | "subtotalSinImpuestos"
    | "subtotalIva0"
    | "subtotalIva12"
    | "subtotalIva15"
    | "iva"
    | "ice"
    | "irbpnr"
    | "propina"
    | "total"
    | "retencionIva"
    | "retencionRenta"
  > {
  subtotalSinImpuestos: number;
  subtotalIva0: number;
  subtotalIva12: number;
  subtotalIva15: number;
  iva: number;
  ice: number;
  irbpnr: number;
  propina: number;
  total: number;
  retencionIva: number;
  retencionRenta: number;
}

/**
 * Monthly summary for an organization
 */
export interface MonthlyDocumentsSummary {
  organizationId: UUID;
  periodo: string; // YYYY-MM
  tipoDocumento: TipoDocumento;
  totalDocumentos: number;
  montoTotal: number; // in cents
}

/**
 * Organization usage statistics
 */
export interface OrganizationUsage {
  organizationId: UUID;
  name: string;
  plan: OrganizationPlan;
  periodo: string; // YYYY-MM
  totalBatches: number;
  totalDocuments: number;
  totalStorageBytes: number;
}

/**
 * Processing error details
 */
export interface ProcessingError {
  code: string;
  message: string;
  field?: string;
  severity: "error" | "warning";
}

/**
 * Audit log metadata types
 */
export interface UploadAuditMetadata {
  filename: string;
  fileSize: number;
  totalFiles: number;
}

export interface ProcessAuditMetadata {
  batchId: UUID;
  successCount: number;
  failedCount: number;
  duration: number; // milliseconds
}

export interface ReportGenerationMetadata {
  periodo: string;
  tipoReporte: TipoReporte;
  documentCount: number;
  formato: FormatoReporte;
  fileSize: number;
}
