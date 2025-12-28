import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

// =====================================================
// ORGANIZATIONS (Multi-tenant clients)
// =====================================================

export const organizations = sqliteTable(
  "organizations",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    ruc: text("ruc").notNull().unique(),
    email: text("email").notNull(),
    plan: text("plan", {
      enum: ["free", "starter", "pro", "enterprise"],
    })
      .notNull()
      .default("free"),
    status: text("status", { enum: ["active", "suspended", "cancelled"] })
      .notNull()
      .default("active"),
    maxMonthlyDocuments: integer("max_monthly_documents")
      .notNull()
      .default(100),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("idx_organizations_ruc").on(table.ruc),
    index("idx_organizations_status").on(table.status),
  ]
);

// =====================================================
// USERS (Users within organizations)
// =====================================================

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    role: text("role", { enum: ["owner", "admin", "member"] })
      .notNull()
      .default("member"),
    authProviderId: text("auth_provider_id"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("idx_users_organization").on(table.organizationId),
    index("idx_users_email").on(table.email),
  ]
);

// =====================================================
// UPLOAD BATCHES (ZIP file uploads)
// =====================================================

export const uploadBatches = sqliteTable(
  "upload_batches",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    originalFilename: text("original_filename").notNull(),
    fileSize: integer("file_size").notNull(),
    status: text("status", {
      enum: ["pending", "processing", "completed", "failed"],
    })
      .notNull()
      .default("pending"),
    totalFiles: integer("total_files").notNull().default(0),
    processedFiles: integer("processed_files").notNull().default(0),
    failedFiles: integer("failed_files").notNull().default(0),
    errorMessage: text("error_message"),
    uploadedAt: integer("uploaded_at", { mode: "timestamp" }).notNull(),
    processedAt: integer("processed_at", { mode: "timestamp" }),
  },
  (table) => [
    index("idx_batches_organization").on(table.organizationId),
    index("idx_batches_status").on(table.status),
    index("idx_batches_uploaded_at").on(table.uploadedAt),
    index("idx_batches_org_status_date").on(
      table.organizationId,
      table.status,
      table.uploadedAt
    ),
  ]
);

// =====================================================
// DOCUMENTS (Individual processed XMLs - CORE TABLE)
// =====================================================

export const documents = sqliteTable(
  "documents",
  {
    id: text("id").primaryKey(),
    batchId: text("batch_id")
      .notNull()
      .references(() => uploadBatches.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Identificación del documento
    tipoDocumento: text("tipo_documento", {
      enum: [
        "factura",
        "retencion",
        "nota_credito",
        "nota_debito",
        "guia_remision",
      ],
    }).notNull(),
    numeroAutorizacion: text("numero_autorizacion"),
    claveAcceso: text("clave_acceso"),

    // Emisor
    emisorRuc: text("emisor_ruc").notNull(),
    emisorRazonSocial: text("emisor_razon_social"),

    // Receptor
    receptorIdentificacion: text("receptor_identificacion"),
    receptorTipoIdentificacion: text("receptor_tipo_identificacion", {
      enum: ["04", "05", "06", "07", "08"],
    }),
    receptorRazonSocial: text("receptor_razon_social"),

    // Fechas
    fechaEmision: text("fecha_emision").notNull(), // ISO 8601 date
    fechaAutorizacion: text("fecha_autorizacion"), // ISO 8601 datetime

    // Valores monetarios (en centavos)
    subtotalSinImpuestos: integer("subtotal_sin_impuestos").notNull(),
    subtotalIva0: integer("subtotal_iva_0").notNull().default(0),
    subtotalIva12: integer("subtotal_iva_12").notNull().default(0),
    subtotalIva15: integer("subtotal_iva_15").notNull().default(0),
    iva: integer("iva").notNull().default(0),
    ice: integer("ice").notNull().default(0),
    irbpnr: integer("irbpnr").notNull().default(0),
    propina: integer("propina").notNull().default(0),
    total: integer("total").notNull(),

    // Retenciones
    retencionIva: integer("retencion_iva").notNull().default(0),
    retencionRenta: integer("retencion_renta").notNull().default(0),

    // Forma de pago
    formaPago: text("forma_pago"),

    // Metadatos
    xmlHash: text("xml_hash"),
    procesamientoStatus: text("procesamiento_status", {
      enum: ["success", "warning", "error"],
    })
      .notNull()
      .default("success"),
    procesamientoErrores: text("procesamiento_errores"), // JSON

    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("idx_documents_batch").on(table.batchId),
    index("idx_documents_organization").on(table.organizationId),
    index("idx_documents_tipo").on(table.tipoDocumento),
    index("idx_documents_fecha_emision").on(table.fechaEmision),
    index("idx_documents_clave_acceso").on(table.claveAcceso),
    index("idx_documents_hash").on(table.xmlHash),
    index("idx_documents_emisor_ruc").on(table.emisorRuc),
    // Compound index for common queries
    index("idx_documents_org_fecha").on(
      table.organizationId,
      table.fechaEmision
    ),
  ]
);

// =====================================================
// ATS REPORTS (Generated reports)
// =====================================================

export const atsReports = sqliteTable(
  "ats_reports",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),

    // Parámetros del reporte
    periodo: text("periodo").notNull(), // YYYY-MM
    tipoReporte: text("tipo_reporte", {
      enum: ["compras", "ventas", "completo"],
    }).notNull(),
    documentIds: text("document_ids").notNull(), // JSON array
    totalDocuments: integer("total_documents").notNull(),

    // Archivo generado
    formato: text("formato", { enum: ["xlsx", "csv"] }).notNull(),
    fileSize: integer("file_size").notNull(),

    // Metadata
    generatedAt: integer("generated_at", { mode: "timestamp" }).notNull(),
    downloadedAt: integer("downloaded_at", { mode: "timestamp" }),
    expiresAt: integer("expires_at", { mode: "timestamp" }),
  },
  (table) => [
    index("idx_reports_organization").on(table.organizationId),
    index("idx_reports_periodo").on(table.periodo),
    index("idx_reports_generated_at").on(table.generatedAt),
    index("idx_reports_org_periodo").on(table.organizationId, table.periodo),
  ]
);

// =====================================================
// AUDIT LOGS (Complete audit trail)
// =====================================================

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: text("action", {
      enum: [
        "upload",
        "process",
        "generate_report",
        "delete",
        "update_settings",
        "user_login",
        "user_logout",
      ],
    }).notNull(),
    entityType: text("entity_type", {
      enum: ["batch", "document", "report", "user", "organization"],
    }),
    entityId: text("entity_id"),
    metadata: text("metadata"), // JSON
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("idx_audit_organization").on(table.organizationId),
    index("idx_audit_user").on(table.userId),
    index("idx_audit_created_at").on(table.createdAt),
  ]
);

// =====================================================
// ORGANIZATION SETTINGS (Per-org configuration)
// =====================================================

export const organizationSettings = sqliteTable("organization_settings", {
  organizationId: text("organization_id")
    .primaryKey()
    .references(() => organizations.id, { onDelete: "cascade" }),

  // Configuración de procesamiento
  autoProcessUploads: integer("auto_process_uploads", { mode: "boolean" })
    .notNull()
    .default(true),
  duplicateDetection: integer("duplicate_detection", { mode: "boolean" })
    .notNull()
    .default(true),

  // Configuración de reportes
  defaultReportFormat: text("default_report_format", {
    enum: ["xlsx", "csv"],
  })
    .notNull()
    .default("xlsx"),
  includeNotesInAts: integer("include_notes_in_ats", { mode: "boolean" })
    .notNull()
    .default(true),

  // Notificaciones
  emailOnProcessComplete: integer("email_on_process_complete", {
    mode: "boolean",
  })
    .notNull()
    .default(true),
  emailOnProcessError: integer("email_on_process_error", { mode: "boolean" })
    .notNull()
    .default(true),
  notificationEmail: text("notification_email"),

  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// =====================================================
// SRI CATALOGS (Códigos del SRI)
// =====================================================

export const sriCatalogs = sqliteTable(
  "sri_catalogs",
  {
    id: text("id").primaryKey(),
    catalogType: text("catalog_type", {
      enum: [
        "forma_pago",
        "tipo_identificacion",
        "tipo_documento",
        "sustento_tributario",
        "codigo_retencion_iva",
        "codigo_retencion_renta",
      ],
    }).notNull(),
    code: text("code").notNull(),
    description: text("description").notNull(),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
  },
  (table) => [
    index("idx_catalogs_type").on(table.catalogType),
    index("idx_catalogs_type_code").on(table.catalogType, table.code),
  ]
);
