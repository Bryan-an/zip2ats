/**
 * ZIP generator for ATS CSV reports
 * Creates ZIP archives containing multiple CSV files
 */

import { zipAsync } from "@/lib/zip/utils";
import { generateSeparateCSVs } from "./csv-generator";
import type { ATSReport, ATSFileResult } from "./types";

/**
 * Generates a ZIP file containing separate CSV files for compras and ventas
 * Only includes sections that have data (non-empty rows)
 *
 * @param report - ATS report data
 * @returns ZIP file as ATSFileResult
 * @throws Error if no sections have data
 */
export async function generateZippedCSVs(
  report: ATSReport
): Promise<ATSFileResult> {
  // Generate separate CSV files (only for sections with data)
  const csvFiles = generateSeparateCSVs(report);

  if (csvFiles.length === 0) {
    throw new Error("No hay datos para generar archivos CSV");
  }

  // Prepare files object for fflate
  const files: Record<string, Uint8Array> = {};

  for (const csvFile of csvFiles) {
    files[csvFile.filename] = csvFile.buffer;
  }

  // Generate ZIP asynchronously
  const zippedBuffer = await zipAsync(files);

  const baseFilename = `ATS_${report.periodo}`;

  return {
    buffer: zippedBuffer,
    filename: `${baseFilename}.zip`,
    mimeType: "application/zip",
  };
}
