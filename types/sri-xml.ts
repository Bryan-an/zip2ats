// =====================================================
// TIPOS PARA XML DEL SRI DE ECUADOR
// =====================================================

/**
 * Estructura general de un XML autorizado del SRI
 */
export interface SRIAutorizacionXML {
  autorizacion: {
    estado: "AUTORIZADO" | "NO AUTORIZADO";
    numeroAutorizacion: string;
    fechaAutorizacion: string; // ISO datetime
    ambiente: "1" | "2"; // 1=Pruebas, 2=Producción
    comprobante: string; // XML string interno con CDATA
  };
}

// =====================================================
// INFORMACIÓN TRIBUTARIA (común a todos los documentos)
// =====================================================

export interface InfoTributaria {
  ambiente: "1" | "2";
  tipoEmision: "1"; // 1=Normal
  razonSocial: string;
  nombreComercial?: string;
  ruc: string;
  claveAcceso: string;
  codDoc: string; // 01=Factura, 04=Nota Crédito, 05=Nota Débito, 06=Guía Remisión, 07=Retención
  estab: string; // 3 dígitos
  ptoEmi: string; // 3 dígitos
  secuencial: string; // 9 dígitos
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
  obligadoContabilidad: "SI" | "NO";
  tipoIdentificacionComprador: TipoIdentificacionCode;
  razonSocialComprador: string;
  identificacionComprador: string;
  direccionComprador?: string;
  totalSinImpuestos: string; // decimal as string
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
  codigo: "2" | "3" | "5"; // 2=IVA, 3=ICE, 5=IRBPNR
  codigoPorcentaje: string;
  baseImponible: string;
  valor: string;
  tarifa?: string;
}

export interface ImpuestoDetalle {
  codigo: "2" | "3" | "5";
  codigoPorcentaje: string;
  tarifa: string;
  baseImponible: string;
  valor: string;
}

export interface Pago {
  formaPago: FormaPagoCode;
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
  obligadoContabilidad: "SI" | "NO";
  tipoIdentificacionSujetoRetenido: TipoIdentificacionCode;
  razonSocialSujetoRetenido: string;
  identificacionSujetoRetenido: string;
  periodoFiscal: string; // MM/YYYY
}

export interface ImpuestoRetencion {
  codigo: "1" | "2"; // 1=Renta, 2=IVA
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
  tipoIdentificacionComprador: TipoIdentificacionCode;
  razonSocialComprador: string;
  identificacionComprador: string;
  contribuyenteEspecial?: string;
  obligadoContabilidad: "SI" | "NO";
  codDocModificado: "01" | "04"; // 01=Factura, 04=Nota Crédito
  numDocModificado: string; // 15 dígitos
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
  tipoIdentificacionComprador: TipoIdentificacionCode;
  razonSocialComprador: string;
  identificacionComprador: string;
  contribuyenteEspecial?: string;
  obligadoContabilidad: "SI" | "NO";
  codDocModificado: "01"; // 01=Factura
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
  tipoIdentificacionTransportista: TipoIdentificacionCode;
  rucTransportista: string;
  obligadoContabilidad: "SI" | "NO";
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
// CÓDIGOS DEL SRI
// =====================================================

export type TipoIdentificacionCode =
  | "04" // RUC
  | "05" // CEDULA
  | "06" // PASAPORTE
  | "07" // CONSUMIDOR FINAL
  | "08"; // IDENTIFICACION EXTERIOR

export type FormaPagoCode =
  | "01" // SIN UTILIZACION DEL SISTEMA FINANCIERO
  | "15" // COMPENSACIÓN DE DEUDAS
  | "16" // TARJETA DE DÉBITO
  | "17" // DINERO ELECTRÓNICO
  | "18" // TARJETA PREPAGO
  | "19" // TARJETA DE CRÉDITO
  | "20" // OTROS CON UTILIZACION DEL SISTEMA FINANCIERO
  | "21"; // ENDOSO DE TITULOS

export type CodigoPorcentajeIVA =
  | "0" // 0%
  | "2" // 12%
  | "3" // 14%
  | "4" // 15%
  | "6" // No Objeto de Impuesto
  | "7"; // Exento de IVA

export type CodigoDocumento =
  | "01" // FACTURA
  | "03" // LIQUIDACION DE COMPRA
  | "04" // NOTA DE CREDITO
  | "05" // NOTA DE DEBITO
  | "06" // GUIA DE REMISION
  | "07"; // COMPROBANTE DE RETENCION

// =====================================================
// PARSER RESULT (Documento normalizado)
// =====================================================

export interface ParsedDocument {
  tipo:
    | "factura"
    | "retencion"
    | "nota_credito"
    | "nota_debito"
    | "guia_remision";
  claveAcceso: string;
  numeroAutorizacion: string;
  fechaAutorizacion: string;
  ambiente: "1" | "2";

  // Datos normalizados
  emisor: {
    ruc: string;
    razonSocial: string;
    nombreComercial?: string;
  };

  receptor: {
    tipoIdentificacion: TipoIdentificacionCode;
    identificacion: string;
    razonSocial: string;
  };

  fecha: string; // ISO date

  valores: {
    subtotal: number; // en centavos
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

  formaPago?: FormaPagoCode;

  // XML original para auditoría
  xmlHash: string;
}

// =====================================================
// PARSER OPTIONS
// =====================================================

export interface ParserOptions {
  /**
   * Validar estructura del XML antes de parsear
   */
  validate?: boolean;

  /**
   * Incluir warnings en el resultado
   */
  includeWarnings?: boolean;

  /**
   * Modo estricto (fallar si hay datos faltantes)
   */
  strict?: boolean;
}

export interface ParserResult {
  success: boolean;
  document?: ParsedDocument;
  errors?: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
  warnings?: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
}
