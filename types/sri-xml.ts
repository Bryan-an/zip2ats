// =====================================================
// SRI Ecuador XML Types
// =====================================================

import type {
  SRIAmbiente,
  SRIEstadoAutorizacion,
  SRIObligadoContabilidad,
  SRITaxType,
  SRIRetentionType,
  SRITipoIdentificacion,
  SRIFormaPago,
  SRIDocType,
} from "@/constants/sri-codes";
import type { DocumentType } from "@/constants/document-types";

/**
 * General structure of an SRI authorized XML
 */
export interface SRIAutorizacionXML {
  autorizacion: {
    estado: SRIEstadoAutorizacion;
    numeroAutorizacion: string;
    fechaAutorizacion: string; // ISO datetime
    ambiente: SRIAmbiente;
    comprobante: string; // Inner XML string with CDATA
  };
}

// =====================================================
// InfoTributaria (common to all documents)
// =====================================================

export interface InfoTributaria {
  ambiente: SRIAmbiente;
  tipoEmision: "1"; // 1=Normal
  razonSocial: string;
  nombreComercial?: string;
  ruc: string;
  claveAcceso: string;
  codDoc: string; // 01=Factura, 04=Nota Crédito, 05=Nota Débito, 06=Guía Remisión, 07=Retención
  estab: string; // 3 digits
  ptoEmi: string; // 3 digits
  secuencial: string; // 9 digits
  dirMatriz: string;
}

// =====================================================
// FACTURA
// =====================================================

export interface FacturaXML {
  factura: {
    "@_id": string; // comprobante
    "@_version": string;
    infoTributaria: InfoTributaria;
    infoFactura: InfoFactura;
    detalles: {
      detalle: DetalleFactura | DetalleFactura[];
    };
    infoAdicional?: {
      campoAdicional: CampoAdicional | CampoAdicional[];
    };
  };
}

export interface InfoFactura {
  fechaEmision: string; // DD/MM/YYYY
  dirEstablecimiento?: string;
  contribuyenteEspecial?: string;
  obligadoContabilidad: SRIObligadoContabilidad;
  tipoIdentificacionComprador: SRITipoIdentificacion;
  razonSocialComprador: string;
  identificacionComprador: string;
  direccionComprador?: string;
  totalSinImpuestos: string; // Decimal as string
  totalDescuento: string;
  totalConImpuestos: {
    totalImpuesto: TotalImpuesto | TotalImpuesto[];
  };
  propina?: string;
  importeTotal: string;
  moneda: "DOLAR" | string;
  pagos?: {
    pago: Pago | Pago[];
  };
}

export interface DetalleFactura {
  codigoPrincipal: string;
  codigoAuxiliar?: string;
  descripcion: string;
  cantidad: string;
  precioUnitario: string;
  descuento: string;
  precioTotalSinImpuesto: string;
  impuestos: {
    impuesto: ImpuestoDetalle | ImpuestoDetalle[];
  };
}

export interface TotalImpuesto {
  codigo: SRITaxType; // 2=IVA, 3=ICE, 5=IRBPNR
  codigoPorcentaje: string;
  baseImponible: string;
  valor: string;
  tarifa?: string;
}

export interface ImpuestoDetalle {
  codigo: SRITaxType;
  codigoPorcentaje: string;
  tarifa: string;
  baseImponible: string;
  valor: string;
}

export interface Pago {
  formaPago: SRIFormaPago;
  total: string;
  plazo?: string;
  unidadTiempo?: string;
}

export interface CampoAdicional {
  "@_nombre": string;
  "#text": string;
}

// =====================================================
// RETENCIÓN
// =====================================================

export interface RetencionXML {
  comprobanteRetencion: {
    "@_id": string;
    "@_version": string;
    infoTributaria: InfoTributaria;
    infoCompRetencion: InfoCompRetencion;
    impuestos: {
      impuesto: ImpuestoRetencion | ImpuestoRetencion[];
    };
    infoAdicional?: {
      campoAdicional: CampoAdicional | CampoAdicional[];
    };
  };
}

export interface InfoCompRetencion {
  fechaEmision: string;
  dirEstablecimiento?: string;
  contribuyenteEspecial?: string;
  obligadoContabilidad: SRIObligadoContabilidad;
  tipoIdentificacionSujetoRetenido: SRITipoIdentificacion;
  razonSocialSujetoRetenido: string;
  identificacionSujetoRetenido: string;
  periodoFiscal: string; // Format: MM/YYYY
}

export interface ImpuestoRetencion {
  codigo: SRIRetentionType; // 1=Renta, 2=IVA
  codigoRetencion: string;
  baseImponible: string;
  porcentajeRetener: string;
  valorRetenido: string;
  codDocSustento: string;
  numDocSustento: string;
  fechaEmisionDocSustento: string;
}

// =====================================================
// NOTA DE CRÉDITO
// =====================================================

export interface NotaCreditoXML {
  notaCredito: {
    "@_id": string;
    "@_version": string;
    infoTributaria: InfoTributaria;
    infoNotaCredito: InfoNotaCredito;
    detalles: {
      detalle: DetalleNotaCredito | DetalleNotaCredito[];
    };
    infoAdicional?: {
      campoAdicional: CampoAdicional | CampoAdicional[];
    };
  };
}

export interface InfoNotaCredito {
  fechaEmision: string;
  dirEstablecimiento?: string;
  tipoIdentificacionComprador: SRITipoIdentificacion;
  razonSocialComprador: string;
  identificacionComprador: string;
  contribuyenteEspecial?: string;
  obligadoContabilidad: SRIObligadoContabilidad;
  codDocModificado: SRIDocType; // 01=Factura, 04=Nota Crédito
  numDocModificado: string; // 15 digits
  fechaEmisionDocSustento: string;
  totalSinImpuestos: string;
  valorModificacion: string;
  moneda: "DOLAR" | string;
  totalConImpuestos: {
    totalImpuesto: TotalImpuesto | TotalImpuesto[];
  };
  motivo: string;
}

export interface DetalleNotaCredito {
  codigoInterno?: string;
  codigoAdicional?: string;
  descripcion: string;
  cantidad: string;
  precioUnitario: string;
  descuento: string;
  precioTotalSinImpuesto: string;
  impuestos: {
    impuesto: ImpuestoDetalle | ImpuestoDetalle[];
  };
}

// =====================================================
// NOTA DE DÉBITO
// =====================================================

export interface NotaDebitoXML {
  notaDebito: {
    "@_id": string;
    "@_version": string;
    infoTributaria: InfoTributaria;
    infoNotaDebito: InfoNotaDebito;
    motivos: {
      motivo: MotivoNotaDebito | MotivoNotaDebito[];
    };
    infoAdicional?: {
      campoAdicional: CampoAdicional | CampoAdicional[];
    };
  };
}

export interface InfoNotaDebito {
  fechaEmision: string;
  dirEstablecimiento?: string;
  tipoIdentificacionComprador: SRITipoIdentificacion;
  razonSocialComprador: string;
  identificacionComprador: string;
  contribuyenteEspecial?: string;
  obligadoContabilidad: SRIObligadoContabilidad;
  codDocModificado: SRIDocType; // 01=Factura
  numDocModificado: string;
  fechaEmisionDocSustento: string;
  totalSinImpuestos: string;
  valorTotal: string;
  totalConImpuestos: {
    totalImpuesto: TotalImpuesto | TotalImpuesto[];
  };
}

export interface MotivoNotaDebito {
  razon: string;
  valor: string;
}

// =====================================================
// GUÍA DE REMISIÓN
// =====================================================

export interface GuiaRemisionXML {
  guiaRemision: {
    "@_id": string;
    "@_version": string;
    infoTributaria: InfoTributaria;
    infoGuiaRemision: InfoGuiaRemision;
    destinatarios: {
      destinatario: Destinatario | Destinatario[];
    };
    infoAdicional?: {
      campoAdicional: CampoAdicional | CampoAdicional[];
    };
  };
}

export interface InfoGuiaRemision {
  dirEstablecimiento: string;
  dirPartida: string;
  razonSocialTransportista: string;
  tipoIdentificacionTransportista: SRITipoIdentificacion;
  rucTransportista: string;
  obligadoContabilidad: SRIObligadoContabilidad;
  contribuyenteEspecial?: string;
  fechaIniTransporte: string;
  fechaFinTransporte: string;
  placa: string;
}

export interface Destinatario {
  identificacionDestinatario: string;
  razonSocialDestinatario: string;
  dirDestinatario: string;
  motivoTraslado: string;
  docAduaneroUnico?: string;
  codEstabDestino?: string;
  ruta?: string;
  codDocSustento: string;
  numDocSustento: string;
  numAutDocSustento: string;
  fechaEmisionDocSustento: string;
  detalles: {
    detalle: DetalleGuiaRemision | DetalleGuiaRemision[];
  };
}

export interface DetalleGuiaRemision {
  codigoInterno?: string;
  codigoAdicional?: string;
  descripcion: string;
  cantidad: string;
}

// =====================================================
// Parser Result (Normalized document)
// =====================================================

export interface ParsedDocument {
  tipo: DocumentType;
  claveAcceso: string;
  numeroAutorizacion: string;
  fechaAutorizacion: string;
  ambiente: SRIAmbiente;

  // Normalized data
  emisor: {
    ruc: string;
    razonSocial: string;
    nombreComercial?: string;
  };

  receptor: {
    tipoIdentificacion: SRITipoIdentificacion;
    identificacion: string;
    razonSocial: string;
  };

  fecha: string; // ISO date

  valores: {
    subtotal: number; // In cents
    iva0: number;
    iva12: number;
    iva15: number;
    iva: number;
    ice: number;
    irbpnr: number;
    propina: number;
    total: number;
  };

  retenciones?: {
    iva: number;
    renta: number;
  };

  formaPago?: SRIFormaPago;

  // Original XML for audit
  xmlHash: string;
}

// =====================================================
// Parser Options
// =====================================================

export interface ParserOptions {
  /**
   * Validate XML structure before parsing
   */
  validate?: boolean;

  /**
   * Include warnings in the result
   */
  includeWarnings?: boolean;

  /**
   * Strict mode (fail if data is missing)
   */
  strict?: boolean;
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  line?: number;
  col?: number;
}

export interface ParserResult {
  success: boolean;
  document?: ParsedDocument;
  errors?: ValidationError[];
  warnings?: ValidationError[];
}
