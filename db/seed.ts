import type { DbClient } from "./client";
import { sriCatalogs } from "./schema";
import { generateUUID } from "@/lib/db-utils";

/**
 * SRI Catalog Seed Data
 * Official codes from Ecuador's Servicio de Rentas Internas (SRI)
 */

// =====================================================
// FORMAS DE PAGO
// =====================================================

const formasPago = [
  { code: "01", description: "Sin utilización del sistema financiero" },
  { code: "15", description: "Compensación de deudas" },
  { code: "16", description: "Tarjeta de débito" },
  { code: "17", description: "Dinero electrónico" },
  { code: "18", description: "Tarjeta prepago" },
  { code: "19", description: "Tarjeta de crédito" },
  { code: "20", description: "Otros con utilización del sistema financiero" },
  { code: "21", description: "Endoso de títulos" },
];

// =====================================================
// TIPOS DE IDENTIFICACIÓN
// =====================================================

const tiposIdentificacion = [
  { code: "04", description: "RUC" },
  { code: "05", description: "Cédula" },
  { code: "06", description: "Pasaporte" },
  { code: "07", description: "Consumidor final" },
  { code: "08", description: "Identificación del exterior" },
];

// =====================================================
// TIPOS DE DOCUMENTO
// =====================================================

const tiposDocumento = [
  { code: "01", description: "Factura" },
  {
    code: "03",
    description: "Liquidación de compra de bienes y prestación de servicios",
  },
  { code: "04", description: "Nota de crédito" },
  { code: "05", description: "Nota de débito" },
  { code: "06", description: "Guía de remisión" },
  { code: "07", description: "Comprobante de retención" },
];

// =====================================================
// SUSTENTOS TRIBUTARIOS
// =====================================================

const sustentosTributarios = [
  {
    code: "01",
    description:
      "Crédito tributario para declaración de IVA (servicios y bienes distintos de inventarios y activos fijos)",
  },
  {
    code: "02",
    description:
      "Costo o gasto para declaración de impuesto a la renta (servicios y bienes distintos de inventarios y activos fijos)",
  },
  {
    code: "03",
    description: "Activo fijo - crédito tributario para declaración de IVA",
  },
  {
    code: "04",
    description:
      "Activo fijo - costo o gasto para declaración de impuesto a la renta",
  },
  {
    code: "05",
    description:
      "Liquidación gastos de viaje, hospedaje y alimentación Gastos IR (a nombre de empleados y no de la empresa)",
  },
  {
    code: "06",
    description: "Inventario - crédito tributario para declaración de IVA",
  },
  {
    code: "07",
    description:
      "Inventario - costo o gasto para declaración de impuesto a la renta",
  },
  {
    code: "08",
    description:
      "Valor pagado para solicitar reembolso de gasto (intermediario)",
  },
  { code: "09", description: "Reembolso por siniestros" },
  {
    code: "10",
    description: "Distribución de dividendos, beneficios o utilidades",
  },
  { code: "11", description: "Convenios de débito o recaudación para IFIs" },
  { code: "12", description: "Impuestos y retenciones presuntivos" },
  {
    code: "13",
    description:
      "Valores reconocidos por entidades del sector público a favor de sujetos pasivos",
  },
  {
    code: "14",
    description: "Caso Fortuito o Fuerza Mayor (Valores no reembolsados)",
  },
  { code: "15", description: "Valores no reembolsados" },
  { code: "00", description: "Sin sustento tributario" },
];

// =====================================================
// CÓDIGOS DE RETENCIÓN DE IVA
// =====================================================

const codigosRetencionIva = [
  { code: "1", description: "Retención 10%" },
  { code: "2", description: "Retención 20%" },
  { code: "3", description: "Retención 30%" },
  { code: "4", description: "Retención 50%" },
  { code: "5", description: "Retención 70%" },
  { code: "6", description: "Retención 100%" },
  { code: "7", description: "No procede retención" },
  { code: "8", description: "Retención 12%" },
  { code: "9", description: "Retención 14%" },
  { code: "10", description: "Retención 15%" },
];

// =====================================================
// CÓDIGOS DE RETENCIÓN DE RENTA (Principales)
// =====================================================

const codigosRetencionRenta = [
  // Honorarios profesionales
  {
    code: "303",
    description:
      "Honorarios profesionales y demás pagos por servicios relacionados con el título profesional - 10%",
  },
  {
    code: "304",
    description:
      "Servicios predomina el intelecto no relacionados con el título profesional - 8%",
  },

  // Servicios
  { code: "307", description: "Servicios predomina la mano de obra - 2%" },
  {
    code: "308",
    description: "Utilización o aprovechamiento de la imagen o renombre - 10%",
  },
  {
    code: "309",
    description: "Servicios prestados por medios de comunicación - 1%",
  },
  {
    code: "310",
    description:
      "Servicio de transporte privado de pasajeros o transporte público o privado de carga - 1%",
  },
  {
    code: "311",
    description:
      "Pagos a través de liquidación de compra (nivel cultural o rusticidad) - 2%",
  },
  {
    code: "312",
    description: "Transferencia de bienes muebles de naturaleza corporal - 1%",
  },
  {
    code: "319",
    description:
      "Pagos y créditos en cuenta que constituyen ingresos sujetos al Impuesto único sobre ingresos de actividades agropecuarias - 1.75%",
  },

  // Arrendamiento
  { code: "320", description: "Arrendamiento bienes inmuebles - 8%" },
  { code: "322", description: "Seguros y reaseguros (primas y cesiones) - 1%" },

  // Rendimientos financieros
  {
    code: "323",
    description:
      "Rendimientos financieros pagados a naturales y sociedades (No IFIs) - 2%",
  },
  {
    code: "324",
    description: "Rendimientos financieros depósitos Cta. Corriente - 2%",
  },
  { code: "325", description: "Rendimientos financieros pagados a IFIs - 0%" },

  // Dividendos
  {
    code: "332",
    description:
      "Dividendos distribuidos por sociedades residentes o establecidas en Ecuador a favor de personas naturales residentes - 0%",
  },
  {
    code: "336",
    description:
      "Dividendos distribuidos por sociedades residentes o establecidas en Ecuador a favor de sociedades residentes o establecidas en Ecuador - 0%",
  },

  // Otros
  { code: "340", description: "Otras retenciones aplicables el 1%" },
  { code: "341", description: "Otras retenciones aplicables el 2%" },
  { code: "342", description: "Otras retenciones aplicables el 8%" },
  { code: "343", description: "Otras retenciones aplicables el 10%" },
  {
    code: "344",
    description:
      "Compra de bienes de origen agrícola, avícola, pecuario, apícola, cunícula, bioacuático, forestal y carnes en estado natural - 1.75%",
  },
];

// =====================================================
// SEED FUNCTION
// =====================================================

/**
 * Seeds the SRI catalogs table with official codes
 * @param db - Drizzle database client
 */
export async function seedSRICatalogs(db: DbClient) {
  console.log("🌱 Seeding SRI catalogs...");

  const catalogs = [
    ...formasPago.map((item) => ({
      id: generateUUID(),
      catalogType: "forma_pago" as const,
      code: item.code,
      description: item.description,
      active: true,
    })),
    ...tiposIdentificacion.map((item) => ({
      id: generateUUID(),
      catalogType: "tipo_identificacion" as const,
      code: item.code,
      description: item.description,
      active: true,
    })),
    ...tiposDocumento.map((item) => ({
      id: generateUUID(),
      catalogType: "tipo_documento" as const,
      code: item.code,
      description: item.description,
      active: true,
    })),
    ...sustentosTributarios.map((item) => ({
      id: generateUUID(),
      catalogType: "sustento_tributario" as const,
      code: item.code,
      description: item.description,
      active: true,
    })),
    ...codigosRetencionIva.map((item) => ({
      id: generateUUID(),
      catalogType: "codigo_retencion_iva" as const,
      code: item.code,
      description: item.description,
      active: true,
    })),
    ...codigosRetencionRenta.map((item) => ({
      id: generateUUID(),
      catalogType: "codigo_retencion_renta" as const,
      code: item.code,
      description: item.description,
      active: true,
    })),
  ];

  // Insert in batches to avoid hitting limits
  const batchSize = 50;

  for (let i = 0; i < catalogs.length; i += batchSize) {
    const batch = catalogs.slice(i, i + batchSize);
    await db.insert(sriCatalogs).values(batch);

    console.log(
      `  ✓ Inserted ${Math.min(i + batchSize, catalogs.length)}/${catalogs.length} catalogs`
    );
  }

  console.log("✅ SRI catalogs seeded successfully!");
  console.log(`   Total: ${catalogs.length} records`);
}

/**
 * Example usage:
 *
 * @example
 * // In a script or migration
 * import { createDbClient } from './client';
 * import { seedSRICatalogs } from './seed';
 *
 * const db = createDbClient(env.DB);
 * await seedSRICatalogs(db);
 */
