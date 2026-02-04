import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

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
