-- Seeds SRI catalogs into Cloudflare D1 (SQLite).
-- This is intentionally destructive (delete + re-insert) to keep local dev consistent.
-- Source data: official SRI catalogs (Ecuador).
--
-- NOTE: Avoid explicit SQL transactions here (BEGIN/COMMIT/SAVEPOINT).
-- Cloudflare D1 remote execution via `wrangler d1 execute --remote` rejects them.

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
('codigo_retencion_renta:344', 'codigo_retencion_renta', '344', 'Compra de bienes de origen agrícola, avícola, pecuario, apícola, cunícula, bioacuático, forestal y carnes en estado natural - 1.75%', 1);
