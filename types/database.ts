import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  users,
  uploadBatches,
  documents,
  atsReports,
  auditLogs,
  userSettings,
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

export type User = InferSelectModel<typeof users>;
export type UploadBatch = InferSelectModel<typeof uploadBatches>;
export type Document = InferSelectModel<typeof documents>;
export type ATSReport = InferSelectModel<typeof atsReports>;
export type AuditLog = InferSelectModel<typeof auditLogs>;
export type UserSettings = InferSelectModel<typeof userSettings>;
export type SRICatalog = InferSelectModel<typeof sriCatalogs>;

// =====================================================
// TABLE INSERT TYPES (for creating records)
// =====================================================

export type NewUser = InferInsertModel<typeof users>;
export type NewUploadBatch = InferInsertModel<typeof uploadBatches>;
export type NewDocument = InferInsertModel<typeof documents>;
export type NewATSReport = InferInsertModel<typeof atsReports>;
export type NewAuditLog = InferInsertModel<typeof auditLogs>;
export type NewUserSettings = InferInsertModel<typeof userSettings>;
export type NewSRICatalog = InferInsertModel<typeof sriCatalogs>;

// =====================================================
// ENUM TYPES
// =====================================================

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
export type EntityType = "batch" | "document" | "report" | "user";
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
 * User settings
 */
export interface UserWithSettings extends User {
  settings?: UserSettings;
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
 * Monthly summary for a user
 */
export interface MonthlyDocumentsSummary {
  userId: UUID;
  periodo: string; // YYYY-MM
  tipoDocumento: TipoDocumento;
  totalDocumentos: number;
  montoTotal: number; // in cents
}

/**
 * User usage statistics
 */
export interface UserUsage {
  userId: UUID;
  periodo: string; // YYYY-MM
  totalBatches: number;
  totalDocuments: number;
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
