/**
 * Extract XML files from ZIP archive
 */

import { unzipAsync } from "./utils";
import type { ExtractedFile, ZipExtractionResult, ZipError } from "./types";
import { ZIP_ERRORS } from "./errors";

/**
 * Extract XML files from a ZIP buffer
 *
 * @param buffer - ZIP file as ArrayBuffer or Uint8Array
 * @returns Result with extracted XML files and skipped files
 */
export async function extractXMLsFromZip(
  buffer: ArrayBuffer | Uint8Array
): Promise<ZipExtractionResult> {
  const uint8Array =
    buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;

  // Validate ZIP file
  if (uint8Array.length === 0) {
    return {
      success: false,
      files: [],
      skipped: [],
      errors: [
        {
          code: ZIP_ERRORS.EMPTY_ZIP,
          message: "El archivo ZIP está vacío",
        },
      ],
    };
  }

  // Check ZIP signature (PK header)
  if (
    uint8Array.length < 4 ||
    uint8Array[0] !== 0x50 ||
    uint8Array[1] !== 0x4b
  ) {
    return {
      success: false,
      files: [],
      skipped: [],
      errors: [
        {
          code: ZIP_ERRORS.INVALID_ZIP,
          message: "El archivo no es un ZIP válido",
        },
      ],
    };
  }

  let unzipped: Record<string, Uint8Array>;

  try {
    unzipped = await unzipAsync(uint8Array);
  } catch (error) {
    return {
      success: false,
      files: [],
      skipped: [],
      errors: [
        {
          code: ZIP_ERRORS.INVALID_ZIP,
          message: `Error al descomprimir ZIP: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }

  const files: ExtractedFile[] = [];
  const skipped: string[] = [];
  const errors: ZipError[] = [];

  // Process each file in the ZIP
  for (const [filename, fileData] of Object.entries(unzipped)) {
    // Skip directories (end with /)
    if (filename.endsWith("/")) {
      skipped.push(filename);
      continue;
    }

    // Filter only XML files (case-insensitive)
    const lowerFilename = filename.toLowerCase();

    if (!lowerFilename.endsWith(".xml")) {
      skipped.push(filename);
      continue;
    }

    // Decode UTF-8 content
    try {
      const decoder = new TextDecoder("utf-8", { fatal: true });
      const content = decoder.decode(fileData);

      files.push({
        filename,
        content,
        size: fileData.length,
      });
    } catch (error) {
      errors.push({
        code: ZIP_ERRORS.EXTRACTION_FAILED,
        message: `Error al decodificar archivo ${filename}: ${error instanceof Error ? error.message : String(error)}`,
        filename,
      });
    }
  }

  // Check if we found any XML files
  if (files.length === 0 && errors.length === 0) {
    return {
      success: false,
      files: [],
      skipped,
      errors: [
        {
          code: ZIP_ERRORS.NO_XML_FILES,
          message: "El ZIP no contiene archivos XML",
        },
      ],
    };
  }

  return {
    success: true,
    files,
    skipped,
    errors: errors.length > 0 ? errors : undefined,
  };
}
