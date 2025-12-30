-- Seeds SRI catalogs into Cloudflare D1 (SQLite).
-- Intentionally destructive (delete + re-insert) to keep local dev consistent.
-- NOTE: Avoid explicit SQL transactions here (BEGIN/COMMIT/SAVEPOINT).
-- Source data: official SRI catalogs (Ecuador).

DELETE FROM sri_catalogs;

INSERT INTO sri_catalogs (id, catalog_type, code, description, active) VALUES
-- =====================================================
-- FORMAS DE PAGO
-- =====================================================
('forma_pago:01', 'forma_pago', '01', 'Sin utilización del sistema financiero', 1),
('forma_pago:15', 'forma_pago', '15', 'Compensación de deudas', 1),
('forma_pago:16', 'forma_pago', '16', 'Tarjeta de débito', 1),
('forma_pago:17', 'forma_pago', '17', 'Dinero electrónico', 1),
('forma_pago:18', 'forma_pago', '18', 'Tarjeta prepago', 1),
('forma_pago:19', 'forma_pago', '19', 'Tarjeta de crédito', 1),
('forma_pago:20', 'forma_pago', '20', 'Otros con utilización del sistema financiero', 1),
('forma_pago:21', 'forma_pago', '21', 'Endoso de títulos', 1),

-- =====================================================
-- TIPOS DE IDENTIFICACIÓN
-- =====================================================
('tipo_identificacion:04', 'tipo_identificacion', '04', 'RUC', 1),
('tipo_identificacion:05', 'tipo_identificacion', '05', 'Cédula', 1),
('tipo_identificacion:06', 'tipo_identificacion', '06', 'Pasaporte', 1),
('tipo_identificacion:07', 'tipo_identificacion', '07', 'Consumidor final', 1),
('tipo_identificacion:08', 'tipo_identificacion', '08', 'Identificación del exterior', 1),

-- =====================================================
-- TIPOS DE DOCUMENTO
-- =====================================================
('tipo_documento:01', 'tipo_documento', '01', 'Factura', 1),
('tipo_documento:03', 'tipo_documento', '03', 'Liquidación de compra de bienes y prestación de servicios', 1),
('tipo_documento:04', 'tipo_documento', '04', 'Nota de crédito', 1),
('tipo_documento:05', 'tipo_documento', '05', 'Nota de débito', 1),
('tipo_documento:06', 'tipo_documento', '06', 'Guía de remisión', 1),
('tipo_documento:07', 'tipo_documento', '07', 'Comprobante de retención', 1),

-- =====================================================
-- SUSTENTOS TRIBUTARIOS
-- =====================================================
('sustento_tributario:01', 'sustento_tributario', '01', 'Crédito tributario para declaración de IVA (servicios y bienes distintos de inventarios y activos fijos)', 1),
('sustento_tributario:02', 'sustento_tributario', '02', 'Costo o gasto para declaración de impuesto a la renta (servicios y bienes distintos de inventarios y activos fijos)', 1),
('sustento_tributario:03', 'sustento_tributario', '03', 'Activo fijo - crédito tributario para declaración de IVA', 1),
('sustento_tributario:04', 'sustento_tributario', '04', 'Activo fijo - costo o gasto para declaración de impuesto a la renta', 1),
('sustento_tributario:05', 'sustento_tributario', '05', 'Liquidación gastos de viaje, hospedaje y alimentación Gastos IR (a nombre de empleados y no de la empresa)', 1),
('sustento_tributario:06', 'sustento_tributario', '06', 'Inventario - crédito tributario para declaración de IVA', 1),
('sustento_tributario:07', 'sustento_tributario', '07', 'Inventario - costo o gasto para declaración de impuesto a la renta', 1),
('sustento_tributario:08', 'sustento_tributario', '08', 'Valor pagado para solicitar reembolso de gasto (intermediario)', 1),
('sustento_tributario:09', 'sustento_tributario', '09', 'Reembolso por siniestros', 1),
('sustento_tributario:10', 'sustento_tributario', '10', 'Distribución de dividendos, beneficios o utilidades', 1),
('sustento_tributario:11', 'sustento_tributario', '11', 'Convenios de débito o recaudación para IFIs', 1),
('sustento_tributario:12', 'sustento_tributario', '12', 'Impuestos y retenciones presuntivos', 1),
('sustento_tributario:13', 'sustento_tributario', '13', 'Valores reconocidos por entidades del sector público a favor de sujetos pasivos', 1),
('sustento_tributario:14', 'sustento_tributario', '14', 'Caso Fortuito o Fuerza Mayor (Valores no reembolsados)', 1),
('sustento_tributario:15', 'sustento_tributario', '15', 'Valores no reembolsados', 1),
('sustento_tributario:00', 'sustento_tributario', '00', 'Sin sustento tributario', 1),

-- =====================================================
-- CÓDIGOS DE RETENCIÓN DE IVA
-- =====================================================
('codigo_retencion_iva:1', 'codigo_retencion_iva', '1', 'Retención 10%', 1),
('codigo_retencion_iva:2', 'codigo_retencion_iva', '2', 'Retención 20%', 1),
('codigo_retencion_iva:3', 'codigo_retencion_iva', '3', 'Retención 30%', 1),
('codigo_retencion_iva:4', 'codigo_retencion_iva', '4', 'Retención 50%', 1),
('codigo_retencion_iva:5', 'codigo_retencion_iva', '5', 'Retención 70%', 1),
('codigo_retencion_iva:6', 'codigo_retencion_iva', '6', 'Retención 100%', 1),
('codigo_retencion_iva:7', 'codigo_retencion_iva', '7', 'No procede retención', 1),
('codigo_retencion_iva:8', 'codigo_retencion_iva', '8', 'Retención 12%', 1),
('codigo_retencion_iva:9', 'codigo_retencion_iva', '9', 'Retención 14%', 1),
('codigo_retencion_iva:10', 'codigo_retencion_iva', '10', 'Retención 15%', 1),

-- =====================================================
-- CÓDIGOS DE RETENCIÓN DE RENTA (Principales)
-- =====================================================
('codigo_retencion_renta:303', 'codigo_retencion_renta', '303', 'Honorarios profesionales y demás pagos por servicios relacionados con el título profesional - 10%', 1),
('codigo_retencion_renta:304', 'codigo_retencion_renta', '304', 'Servicios predomina el intelecto no relacionados con el título profesional - 8%', 1),
('codigo_retencion_renta:307', 'codigo_retencion_renta', '307', 'Servicios predomina la mano de obra - 2%', 1),
('codigo_retencion_renta:308', 'codigo_retencion_renta', '308', 'Utilización o aprovechamiento de la imagen o renombre - 10%', 1),
('codigo_retencion_renta:309', 'codigo_retencion_renta', '309', 'Servicios prestados por medios de comunicación - 1%', 1),
('codigo_retencion_renta:310', 'codigo_retencion_renta', '310', 'Servicio de transporte privado de pasajeros o transporte público o privado de carga - 1%', 1),
('codigo_retencion_renta:311', 'codigo_retencion_renta', '311', 'Pagos a través de liquidación de compra (nivel cultural o rusticidad) - 2%', 1),
('codigo_retencion_renta:312', 'codigo_retencion_renta', '312', 'Transferencia de bienes muebles de naturaleza corporal - 1%', 1),
('codigo_retencion_renta:319', 'codigo_retencion_renta', '319', 'Pagos y créditos en cuenta que constituyen ingresos sujetos al Impuesto único sobre ingresos de actividades agropecuarias - 1.75%', 1),
('codigo_retencion_renta:320', 'codigo_retencion_renta', '320', 'Arrendamiento bienes inmuebles - 8%', 1),
('codigo_retencion_renta:322', 'codigo_retencion_renta', '322', 'Seguros y reaseguros (primas y cesiones) - 1%', 1),
('codigo_retencion_renta:323', 'codigo_retencion_renta', '323', 'Rendimientos financieros pagados a naturales y sociedades (No IFIs) - 2%', 1),
('codigo_retencion_renta:324', 'codigo_retencion_renta', '324', 'Rendimientos financieros depósitos Cta. Corriente - 2%', 1),
('codigo_retencion_renta:325', 'codigo_retencion_renta', '325', 'Rendimientos financieros pagados a IFIs - 0%', 1),
('codigo_retencion_renta:332', 'codigo_retencion_renta', '332', 'Dividendos distribuidos por sociedades residentes o establecidas en Ecuador a favor de personas naturales residentes - 0%', 1),
('codigo_retencion_renta:336', 'codigo_retencion_renta', '336', 'Dividendos distribuidos por sociedades residentes o establecidas en Ecuador a favor de sociedades residentes o establecidas en Ecuador - 0%', 1),
('codigo_retencion_renta:340', 'codigo_retencion_renta', '340', 'Otras retenciones aplicables el 1%', 1),
('codigo_retencion_renta:341', 'codigo_retencion_renta', '341', 'Otras retenciones aplicables el 2%', 1),
('codigo_retencion_renta:342', 'codigo_retencion_renta', '342', 'Otras retenciones aplicables el 8%', 1),
('codigo_retencion_renta:343', 'codigo_retencion_renta', '343', 'Otras retenciones aplicables el 10%', 1),
('codigo_retencion_renta:344', 'codigo_retencion_renta', '344', 'Compra de bienes de origen agrícola, avícola, pecuario, apícola, cunícula, bioacuático, forestal y carnes en estado natural - 1.75%', 1),

-- =====================================================
-- ATS (PDF SRI) - DISTRITO ADUANERO (Tabla 6)
-- =====================================================
('distrito_aduanero:019', 'distrito_aduanero', '019', 'Gquil-Aéreo', 1),
('distrito_aduanero:028', 'distrito_aduanero', '028', 'Gquil-Marítimo', 1),
('distrito_aduanero:037', 'distrito_aduanero', '037', 'Manta', 1),
('distrito_aduanero:046', 'distrito_aduanero', '046', 'Esmeraldas', 1),
('distrito_aduanero:055', 'distrito_aduanero', '055', 'Quito', 1),
('distrito_aduanero:064', 'distrito_aduanero', '064', 'Pto-Bolívar', 1),
('distrito_aduanero:073', 'distrito_aduanero', '073', 'Tulcán', 1),
('distrito_aduanero:082', 'distrito_aduanero', '082', 'Huaquillas', 1),
('distrito_aduanero:091', 'distrito_aduanero', '091', 'Cuenca', 1),
('distrito_aduanero:109', 'distrito_aduanero', '109', 'Loja-Macara', 1),
('distrito_aduanero:118', 'distrito_aduanero', '118', 'Sta. Elena', 1),
('distrito_aduanero:127', 'distrito_aduanero', '127', 'Latacunga', 1),
('distrito_aduanero:136', 'distrito_aduanero', '136', 'Gerencia General', 1),
('distrito_aduanero:145', 'distrito_aduanero', '145', 'CEBAF – San Miguel', 1),

-- =====================================================
-- ATS (PDF SRI) - CÓDIGO RÉGIMEN (Tabla 7.1)
-- =====================================================
('codigo_regimen:40', 'codigo_regimen', '40', 'Exportación definitiva', 1),
('codigo_regimen:50', 'codigo_regimen', '50', 'Exportación temporal para reimportación en el mismo estado', 1),
('codigo_regimen:51', 'codigo_regimen', '51', 'Exportación temporal para perfeccionamiento pasivo', 1),
('codigo_regimen:60', 'codigo_regimen', '60', 'Reexp. de mercancías en el mismo estado', 1),
('codigo_regimen:61', 'codigo_regimen', '61', 'Reexportación de mercancías que fueron importadas para perfeccionamiento activo', 1),
('codigo_regimen:79', 'codigo_regimen', '79', 'Exportación a consumo desde Zona Franca', 1),
('codigo_regimen:83', 'codigo_regimen', '83', 'Reembarque', 1),
('codigo_regimen:94', 'codigo_regimen', '94', 'Courier exportación', 1),
('codigo_regimen:95', 'codigo_regimen', '95', 'Exportaciones Correos del Ecuador', 1),

-- =====================================================
-- ATS (PDF SRI) - TARJETAS DE CRÉDITO (Tabla 8)
-- =====================================================
('tarjeta_credito:01', 'tarjeta_credito', '01', 'AMERICAN EXPRESS', 1),
('tarjeta_credito:02', 'tarjeta_credito', '02', 'DINERS CLUB', 1),
('tarjeta_credito:04', 'tarjeta_credito', '04', 'MASTERCARD', 1),
('tarjeta_credito:05', 'tarjeta_credito', '05', 'VISA', 1),
('tarjeta_credito:07', 'tarjeta_credito', '07', 'OTRA TARJETA', 1),

-- =====================================================
-- ATS (PDF SRI) - TIPO IDENTIFICACIÓN DEL PROVEEDOR (Tabla 14)
-- =====================================================
('tipo_id_proveedor:01', 'tipo_id_proveedor', '01', 'Persona natural', 1),
('tipo_id_proveedor:02', 'tipo_id_proveedor', '02', 'Sociedad', 1),

-- =====================================================
-- ATS (PDF SRI) - TIPO DE PAGO (Tabla 15)
-- =====================================================
('tipo_pago_ats:01', 'tipo_pago_ats', '01', 'Pago a residente / Establecimiento permanente', 1),
('tipo_pago_ats:0282', 'tipo_pago_ats', '0282', 'Pago a no residente', 1),

-- =====================================================
-- ATS (PDF SRI) - TIPOS DE INGRESOS DEL EXTERIOR (Tabla 18)
-- =====================================================
('tipo_ingreso_exterior:401', 'tipo_ingreso_exterior', '401', 'Rentas Inmobiliarias', 1),
('tipo_ingreso_exterior:402', 'tipo_ingreso_exterior', '402', 'Beneficios y servicios Empresariales / Asistencia técnica', 1),
('tipo_ingreso_exterior:403', 'tipo_ingreso_exterior', '403', 'Beneficios y servicios Empresariales / Comisiones', 1),
('tipo_ingreso_exterior:404', 'tipo_ingreso_exterior', '404', 'Beneficios y servicios Empresariales / Comisiones sobre préstamos', 1),
('tipo_ingreso_exterior:405', 'tipo_ingreso_exterior', '405', 'Beneficios y servicios Empresariales/Honorarios', 1),
('tipo_ingreso_exterior:406', 'tipo_ingreso_exterior', '406', 'Beneficios y servicios Empresariales / Publicidad', 1),
('tipo_ingreso_exterior:407', 'tipo_ingreso_exterior', '407', 'Beneficios y servicios Empresariales / Servicios administrativos', 1),
('tipo_ingreso_exterior:408', 'tipo_ingreso_exterior', '408', 'Beneficios y servicios Empresariales / Servicios financieros', 1),
('tipo_ingreso_exterior:409', 'tipo_ingreso_exterior', '409', 'Beneficios y servicios Empresariales / Servicios intermedios de la producción (maquila)', 1),
('tipo_ingreso_exterior:410', 'tipo_ingreso_exterior', '410', 'Beneficios y servicios Empresariales / Servicios técnicos', 1),
('tipo_ingreso_exterior:411', 'tipo_ingreso_exterior', '411', 'Navegación Marítima y/o aérea', 1),
('tipo_ingreso_exterior:412', 'tipo_ingreso_exterior', '412', 'Dividendos', 1),
('tipo_ingreso_exterior:413', 'tipo_ingreso_exterior', '413', 'Rendimientos financieros / Comisiones sobre préstamos', 1),
('tipo_ingreso_exterior:414', 'tipo_ingreso_exterior', '414', 'Rendimientos financieros / Otras inversiones', 1),
('tipo_ingreso_exterior:415', 'tipo_ingreso_exterior', '415', 'Garantías', 1),
('tipo_ingreso_exterior:416', 'tipo_ingreso_exterior', '416', 'Servicios profesionales independientes / dependientes', 1),
('tipo_ingreso_exterior:417', 'tipo_ingreso_exterior', '417', 'Intereses sobre préstamos', 1),
('tipo_ingreso_exterior:418', 'tipo_ingreso_exterior', '418', 'Intereses créditos en ventas', 1),
('tipo_ingreso_exterior:419', 'tipo_ingreso_exterior', '419', 'Regalías / Cánones, derechos de autor, marcas, patentes y similares', 1),
('tipo_ingreso_exterior:420', 'tipo_ingreso_exterior', '420', 'Regalías / Por concepto de franquicias', 1),
('tipo_ingreso_exterior:421', 'tipo_ingreso_exterior', '421', 'Seguros y reaseguros (primas y cesiones)', 1),
('tipo_ingreso_exterior:422', 'tipo_ingreso_exterior', '422', 'Utilidad o pérdida por derivados financieros', 1),
('tipo_ingreso_exterior:423', 'tipo_ingreso_exterior', '423', 'Utilidad por operaciones de futuros distintas de las del sector financiero', 1),
('tipo_ingreso_exterior:424', 'tipo_ingreso_exterior', '424', 'Venta de bienes intangibles', 1),
('tipo_ingreso_exterior:425', 'tipo_ingreso_exterior', '425', 'Enajenación de derechos representativos de capital', 1),
('tipo_ingreso_exterior:426', 'tipo_ingreso_exterior', '426', 'Enajenación de obligaciones', 1),
('tipo_ingreso_exterior:427', 'tipo_ingreso_exterior', '427', 'Artistas', 1),
('tipo_ingreso_exterior:428', 'tipo_ingreso_exterior', '428', 'Deportistas', 1),
('tipo_ingreso_exterior:429', 'tipo_ingreso_exterior', '429', 'Participación de consejeros', 1),
('tipo_ingreso_exterior:430', 'tipo_ingreso_exterior', '430', 'Entretenimiento Público', 1),
('tipo_ingreso_exterior:431', 'tipo_ingreso_exterior', '431', 'Pensiones', 1),
('tipo_ingreso_exterior:432', 'tipo_ingreso_exterior', '432', 'Reembolso de Gastos', 1),
('tipo_ingreso_exterior:433', 'tipo_ingreso_exterior', '433', 'Funciones Públicas', 1),
('tipo_ingreso_exterior:434', 'tipo_ingreso_exterior', '434', 'Estudiantes', 1),
('tipo_ingreso_exterior:435', 'tipo_ingreso_exterior', '435', 'Arrendamiento mercantil internacional', 1),
('tipo_ingreso_exterior:436', 'tipo_ingreso_exterior', '436', 'Contratos de fletamento de naves para empresas de transporte aéreo o marítimo internacional', 1),
('tipo_ingreso_exterior:437', 'tipo_ingreso_exterior', '437', 'Seguros y reaseguros (primas y cesiones)', 1),
('tipo_ingreso_exterior:438', 'tipo_ingreso_exterior', '438', 'Otros ingresos', 1),

-- =====================================================
-- ATS (PDF SRI) - TIPOS DE RÉGIMEN FISCAL DEL EXTERIOR (Tabla 19)
-- =====================================================
('regimen_fiscal_exterior:01', 'regimen_fiscal_exterior', '01', 'Régimen general', 1),
('regimen_fiscal_exterior:02', 'regimen_fiscal_exterior', '02', 'Paraíso fiscal', 1),
('regimen_fiscal_exterior:03', 'regimen_fiscal_exterior', '03', 'Régimen fiscal preferente o jurisdicción de menor imposición', 1),

-- =====================================================
-- ATS (PDF SRI) - TIPO DE EMISIÓN FACTURACIÓN (Tabla 20)
-- =====================================================
('tipo_emision_facturacion:F', 'tipo_emision_facturacion', 'F', 'Facturación Física', 1),
('tipo_emision_facturacion:E', 'tipo_emision_facturacion', 'E', 'Facturación Electrónica', 1),

-- =====================================================
-- ATS (PDF SRI) - TIPO DE COMPENSACIONES (Tabla 21)
-- =====================================================
('tipo_compensacion:01', 'tipo_compensacion', '01', 'Ley Solidaridad - Zonas Afectadas', 1),
('tipo_compensacion:02', 'tipo_compensacion', '02', 'Medios Electrónicos', 1);
