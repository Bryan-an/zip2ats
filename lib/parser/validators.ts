/**
 * XML validation and hash computation utilities
 */

import type { ValidationError } from "@/types/sri-xml";
import { validateXMLSyntax } from "@/lib/parser/config";
import { PARSER_ERRORS } from "@/lib/parser/errors";

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate XML syntax using fast-xml-parser
 */
export function validateXML(xml: string): ValidationResult {
  if (!xml || typeof xml !== "string") {
    return {
      isValid: false,
      errors: [
        {
          code: PARSER_ERRORS.EMPTY_XML,
          message: "El XML está vacío o no es válido",
        },
      ],
    };
  }

  const result = validateXMLSyntax(xml);

  if (result === true) {
    return { isValid: true, errors: [] };
  }

  return {
    isValid: false,
    errors: [
      {
        code: result.err.code,
        message: result.err.msg,
        line: result.err.line,
        col: result.err.col,
      },
    ],
  };
}

/**
 * Compute SHA-256 hash of XML string
 * Uses Web Crypto API (available in Cloudflare Workers and modern browsers)
 */
export async function computeXMLHash(xml: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(xml);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Validate clave de acceso (49 digits)
 */
export function validateClaveAcceso(clave: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!clave) {
    errors.push({
      code: PARSER_ERRORS.MISSING_CLAVE,
      message: "Clave de acceso no proporcionada",
      field: "claveAcceso",
    });

    return { isValid: false, errors };
  }

  if (!/^\d{49}$/.test(clave)) {
    errors.push({
      code: PARSER_ERRORS.INVALID_CLAVE_FORMAT,
      message: "La clave de acceso debe tener 49 dígitos numéricos",
      field: "claveAcceso",
    });
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate numero de autorización (37 or 49 digits)
 */
export function validateNumeroAutorizacion(numero: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!numero) {
    errors.push({
      code: PARSER_ERRORS.MISSING_AUTORIZACION,
      message: "Número de autorización no proporcionado",
      field: "numeroAutorizacion",
    });

    return { isValid: false, errors };
  }

  // Can be 37 digits (old format) or 49 digits (same as clave acceso)
  if (!/^\d{37}$/.test(numero) && !/^\d{49}$/.test(numero)) {
    errors.push({
      code: PARSER_ERRORS.INVALID_AUTORIZACION_FORMAT,
      message: "El número de autorización debe tener 37 o 49 dígitos",
      field: "numeroAutorizacion",
    });
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate RUC (13 digits with valid province code)
 */
export function validateRUC(ruc: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!ruc) {
    errors.push({
      code: PARSER_ERRORS.MISSING_RUC,
      message: "RUC no proporcionado",
      field: "ruc",
    });

    return { isValid: false, errors };
  }

  if (!/^\d{13}$/.test(ruc)) {
    errors.push({
      code: PARSER_ERRORS.INVALID_RUC_FORMAT,
      message: "El RUC debe tener 13 dígitos numéricos",
      field: "ruc",
    });

    return { isValid: false, errors };
  }

  // Validate province code (first 2 digits: 01-24 or 30)
  const provinceCode = parseInt(ruc.substring(0, 2), 10);

  if ((provinceCode < 1 || provinceCode > 24) && provinceCode !== 30) {
    errors.push({
      code: PARSER_ERRORS.INVALID_PROVINCE_CODE,
      message: "Código de provincia inválido en el RUC",
      field: "ruc",
    });
  }

  // Validate third digit (type of entity)
  const thirdDigit = parseInt(ruc.charAt(2), 10);

  if (thirdDigit < 0 || thirdDigit > 9) {
    errors.push({
      code: PARSER_ERRORS.INVALID_ENTITY_TYPE,
      message: "Tipo de entidad inválido en el RUC",
      field: "ruc",
    });
  }

  // RUC must end in 001 (establishment)
  if (!ruc.endsWith("001")) {
    errors.push({
      code: PARSER_ERRORS.INVALID_RUC_SUFFIX,
      message: "El RUC debe terminar en 001",
      field: "ruc",
    });
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate document date is not in the future
 */
export function validateDocumentDate(
  isoDate: string,
  fieldName = "fechaEmision"
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!isoDate) {
    errors.push({
      code: PARSER_ERRORS.MISSING_DATE,
      message: "Fecha no proporcionada",
      field: fieldName,
    });

    return { isValid: false, errors };
  }

  const docDate = new Date(isoDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (docDate > today) {
    errors.push({
      code: PARSER_ERRORS.FUTURE_DATE,
      message: "La fecha del documento no puede ser futura",
      field: fieldName,
    });
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate monetary values are non-negative
 */
export function validateMonetaryValue(
  value: number,
  fieldName: string
): ValidationResult {
  const errors: ValidationError[] = [];

  if (typeof value !== "number" || isNaN(value)) {
    errors.push({
      code: PARSER_ERRORS.INVALID_MONETARY_VALUE,
      message: `Valor monetario inválido: ${fieldName}`,
      field: fieldName,
    });

    return { isValid: false, errors };
  }

  if (value < 0) {
    errors.push({
      code: PARSER_ERRORS.NEGATIVE_VALUE,
      message: `El valor de ${fieldName} no puede ser negativo`,
      field: fieldName,
    });
  }

  return { isValid: errors.length === 0, errors };
}
