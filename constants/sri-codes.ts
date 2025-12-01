/**
 * SRI official codes
 * Source: SRI Ecuador electronic invoicing documentation
 */

// Códigos de tipo de documento
export const SRI_DOC_TYPE = {
  FACTURA: "01",
  LIQUIDACION: "03",
  NOTA_CREDITO: "04",
  NOTA_DEBITO: "05",
  GUIA_REMISION: "06",
  RETENCION: "07",
} as const;

// Códigos de tipo de impuesto (totalConImpuestos)
export const SRI_TAX_TYPE = {
  IVA: "2",
  ICE: "3",
  IRBPNR: "5",
} as const;

// Códigos de tipo de retención (comprobanteRetencion)
export const SRI_RETENTION_TYPE = {
  RENTA: "1",
  IVA: "2",
} as const;

// Códigos de ambiente
export const SRI_AMBIENTE = {
  PRUEBAS: "1",
  PRODUCCION: "2",
} as const;

// Códigos de porcentaje IVA
export const SRI_IVA_RATE = {
  ZERO: "0",
  TWELVE: "2",
  FOURTEEN: "3",
  FIFTEEN: "4",
  NO_OBJETO: "6",
  EXENTO: "7",
} as const;

// Tipos de identificación
export const SRI_TIPO_IDENTIFICACION = {
  RUC: "04",
  CEDULA: "05",
  PASAPORTE: "06",
  CONSUMIDOR_FINAL: "07",
  EXTERIOR: "08",
} as const;

// Formas de pago
export const SRI_FORMA_PAGO = {
  SIN_SISTEMA_FINANCIERO: "01",
  COMPENSACION_DEUDAS: "15",
  TARJETA_DEBITO: "16",
  DINERO_ELECTRONICO: "17",
  TARJETA_PREPAGO: "18",
  TARJETA_CREDITO: "19",
  OTROS_SISTEMA_FINANCIERO: "20",
  ENDOSO_TITULOS: "21",
} as const;

// Estado de autorización
export const SRI_ESTADO_AUTORIZACION = {
  AUTORIZADO: "AUTORIZADO",
  NO_AUTORIZADO: "NO AUTORIZADO",
} as const;

// Obligado a llevar contabilidad
export const SRI_OBLIGADO_CONTABILIDAD = {
  SI: "SI",
  NO: "NO",
} as const;

// Types
export type SRIDocType = (typeof SRI_DOC_TYPE)[keyof typeof SRI_DOC_TYPE];
export type SRITaxType = (typeof SRI_TAX_TYPE)[keyof typeof SRI_TAX_TYPE];

export type SRIRetentionType =
  (typeof SRI_RETENTION_TYPE)[keyof typeof SRI_RETENTION_TYPE];

export type SRIAmbiente = (typeof SRI_AMBIENTE)[keyof typeof SRI_AMBIENTE];
export type SRIIvaRate = (typeof SRI_IVA_RATE)[keyof typeof SRI_IVA_RATE];

export type SRITipoIdentificacion =
  (typeof SRI_TIPO_IDENTIFICACION)[keyof typeof SRI_TIPO_IDENTIFICACION];

export type SRIFormaPago = (typeof SRI_FORMA_PAGO)[keyof typeof SRI_FORMA_PAGO];

export type SRIEstadoAutorizacion =
  (typeof SRI_ESTADO_AUTORIZACION)[keyof typeof SRI_ESTADO_AUTORIZACION];

export type SRIObligadoContabilidad =
  (typeof SRI_OBLIGADO_CONTABILIDAD)[keyof typeof SRI_OBLIGADO_CONTABILIDAD];
