/**
 * ZIP Upload API Route
 * Receives a ZIP file, processes it, and returns parsed documents
 */

import { NextRequest } from "next/server";
import { processZipFile } from "@/lib/zip/processor";
import {
  ZIP_FILE_FIELD_NAME,
  MAX_ZIP_FILE_SIZE,
  ALLOWED_ZIP_MIME_TYPES,
  UPLOAD_ERRORS,
} from "@/constants/upload";
import { logger } from "@/lib/logger";
import { jsonSuccess, jsonError, HttpStatus } from "@/lib/api/response";

/**
 * POST /api/upload
 *
 * Upload and process a ZIP file containing SRI XML documents
 *
 * @param request - Request with multipart/form-data containing "file" field
 * @returns Processed documents or error
 */
export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get(ZIP_FILE_FIELD_NAME);

    // Validate file exists
    if (!file || !(file instanceof File)) {
      return jsonError(
        UPLOAD_ERRORS.NO_FILE,
        "No se proporcionó ningún archivo",
        HttpStatus.BAD_REQUEST
      );
    }

    // Validate file size
    if (file.size > MAX_ZIP_FILE_SIZE) {
      return jsonError(
        UPLOAD_ERRORS.FILE_TOO_LARGE,
        `El archivo excede el tamaño máximo de ${MAX_ZIP_FILE_SIZE / 1024 / 1024}MB`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Validate file type (check MIME type or extension)
    const isValidMimeType = (
      ALLOWED_ZIP_MIME_TYPES as readonly string[]
    ).includes(file.type);

    const hasZipExtension = file.name.toLowerCase().endsWith(".zip");

    if (!isValidMimeType && !hasZipExtension) {
      return jsonError(
        UPLOAD_ERRORS.INVALID_FILE_TYPE,
        "El archivo debe ser un ZIP válido",
        HttpStatus.BAD_REQUEST
      );
    }

    // Convert file to ArrayBuffer
    const buffer = await file.arrayBuffer();

    // Process the ZIP file
    const result = await processZipFile(buffer);

    // Check if processing failed (all XMLs failed parsing)
    if (result.processed === 0 && result.failed > 0) {
      return jsonError(
        UPLOAD_ERRORS.PROCESSING_FAILED,
        result.errors[0]?.message || "Error al procesar el archivo ZIP",
        HttpStatus.UNPROCESSABLE_ENTITY,
        result
      );
    }

    return jsonSuccess(result);
  } catch (error) {
    logger.error("Upload error", error);

    return jsonError(
      UPLOAD_ERRORS.INTERNAL_ERROR,
      "Error interno del servidor",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
