/**
 * ATS Generation API Route
 * Generates ATS reports from parsed documents in XLSX, CSV, or ZIP format.
 *
 * Response format depends on `options`:
 * - `options.formato === "xlsx"`: returns a single Excel (`.xlsx`) file.
 * - `options.formato === "csv"` + `options.csvSection` provided: returns a single CSV (`.csv`) for that section.
 * - `options.formato === "csv"` + no `options.csvSection`: returns a ZIP (`.zip`) bundle containing
 *   one CSV per section with data (e.g., `ATS_<periodo>_compras.csv`, `ATS_<periodo>_ventas.csv`).
 */

import { NextRequest, NextResponse } from "next/server";
import { createATSReport } from "@/lib/ats/aggregator";
import { generateExcel } from "@/lib/ats/excel-generator";
import { generateCSV } from "@/lib/ats/csv-generator";
import { generateZippedCSVs } from "@/lib/ats/zip-generator";
import { ATS_FILE_FORMATS } from "@/lib/ats/constants";
import type { ATSGeneratorOptions } from "@/lib/ats/types";
import { jsonError, HttpStatus } from "@/lib/api/response";
import { logger } from "@/lib/logger";
import { GenerateATSRequestSchema } from "@/lib/schemas/ats";
import type { GenerateATSRequest } from "@/lib/schemas/ats";
import { ATS_ERRORS } from "@/constants/ats";

// =====================================================
// VALIDATION
// =====================================================

/**
 * Validation error details
 */
interface ValidationError {
  code: string;
  message: string;
  status: number;
}

/**
 * Result of request validation
 */
interface ValidationResult {
  valid: boolean;
  error?: ValidationError;
  data?: GenerateATSRequest;
}

/**
 * Maps Zod validation error paths to ATS error codes
 *
 * @param path - Zod error path (e.g., ['documents'], ['options', 'formato'])
 * @returns Appropriate ATS error code
 */
function getErrorCodeFromPath(path: Array<string | number | symbol>): string {
  const pathStr = path.map(String).join(".");

  if (pathStr.startsWith("documents")) {
    return ATS_ERRORS.INVALID_DOCUMENTS;
  }

  if (pathStr.includes("formato")) {
    return ATS_ERRORS.INVALID_FORMAT;
  }

  if (pathStr.includes("periodo")) {
    return ATS_ERRORS.INVALID_PERIODO;
  }

  if (pathStr.includes("contribuyenteRuc")) {
    return ATS_ERRORS.INVALID_RUC;
  }

  if (pathStr.includes("csvSection")) {
    return ATS_ERRORS.INVALID_CSV_SECTION;
  }

  return ATS_ERRORS.INVALID_REQUEST;
}

/**
 * Validates the request body using Zod schema
 *
 * @param body - Request body to validate
 * @returns ValidationResult with either validated data or error
 */
function validateRequest(body: unknown): ValidationResult {
  const result = GenerateATSRequestSchema.safeParse(body);

  if (!result.success) {
    // Get first error for simplicity
    const firstError = result.error.issues[0];
    const errorCode = getErrorCodeFromPath(firstError.path);

    return {
      valid: false,
      error: {
        code: errorCode,
        message: firstError.message,
        status: HttpStatus.BAD_REQUEST,
      },
    };
  }

  return {
    valid: true,
    data: result.data,
  };
}

// =====================================================
// MAIN HANDLER
// =====================================================

/**
 * POST /api/ats/generate
 *
 * Generate an ATS report from parsed documents
 *
 * @param request - Request with JSON body containing documents and options
 * @returns Binary file (XLSX, CSV, or ZIP)
 *
 * Response selection:
 * - `options.formato === "xlsx"`: returns a single `.xlsx` file.
 * - `options.formato === "csv"` and `options.csvSection` is provided: returns a single `.csv` file
 *   for the requested section.
 * - `options.formato === "csv"` and `options.csvSection` is not provided: returns a `.zip` bundle
 *   containing one CSV per section that has data:
 *   - `ATS_<periodo>_compras.csv` (included only if compras has rows)
 *   - `ATS_<periodo>_ventas.csv` (included only if ventas has rows)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request
    const validation = validateRequest(body);

    if (!validation.valid || !validation.data) {
      return jsonError(
        validation.error!.code,
        validation.error!.message,
        validation.error!.status
      );
    }

    const { documents, options = {} } = validation.data;
    const formato = options.formato ?? ATS_FILE_FORMATS.XLSX;

    logger.info("Generating ATS report", {
      documentCount: documents.length,
      formato,
      periodo: options.periodo,
      contribuyenteRuc: options.contribuyenteRuc,
    });

    // Prepare options for ATS generator
    const generatorOptions: ATSGeneratorOptions = {};

    if (options.periodo) {
      generatorOptions.periodo = options.periodo;
    }

    if (options.contribuyenteRuc) {
      generatorOptions.contribuyenteRuc = options.contribuyenteRuc;
    }

    // Generate ATS report
    const report = createATSReport(documents, generatorOptions);

    // Generate file based on format
    if (formato === ATS_FILE_FORMATS.XLSX) {
      const fileResult = await generateExcel(report);

      logger.info("Excel file generated", {
        filename: fileResult.filename,
        size: fileResult.buffer.length,
      });

      // Return Excel file
      return new NextResponse(Buffer.from(fileResult.buffer), {
        status: HttpStatus.OK,
        headers: {
          "Content-Type": fileResult.mimeType,
          "Content-Disposition": `attachment; filename="${fileResult.filename}"`,
          "Content-Length": fileResult.buffer.length.toString(),
        },
      });
    } else {
      // CSV format
      if (options.csvSection) {
        // Single CSV file for specific section
        const fileResult = generateCSV(report, options.csvSection);

        logger.info("CSV file generated", {
          filename: fileResult.filename,
          section: options.csvSection,
          size: fileResult.buffer.length,
        });

        // Return CSV file
        return new NextResponse(Buffer.from(fileResult.buffer), {
          status: HttpStatus.OK,
          headers: {
            "Content-Type": fileResult.mimeType,
            "Content-Disposition": `attachment; filename="${fileResult.filename}"`,
            "Content-Length": fileResult.buffer.length.toString(),
          },
        });
      } else {
        // CSV bundle: when no `csvSection` is provided we return a ZIP archive
        // containing one CSV per section that has data (compras and/or ventas).
        const fileResult = await generateZippedCSVs(report);

        logger.info("CSV ZIP file generated", {
          filename: fileResult.filename,
          size: fileResult.buffer.length,
        });

        // Return ZIP file
        return new NextResponse(Buffer.from(fileResult.buffer), {
          status: HttpStatus.OK,
          headers: {
            "Content-Type": fileResult.mimeType,
            "Content-Disposition": `attachment; filename="${fileResult.filename}"`,
            "Content-Length": fileResult.buffer.length.toString(),
          },
        });
      }
    }
  } catch (error) {
    logger.error("ATS generation error", error);

    return jsonError(
      ATS_ERRORS.GENERATION_FAILED,
      "Error al generar el reporte ATS",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
