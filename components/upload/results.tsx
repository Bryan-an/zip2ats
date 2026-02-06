"use client";

import { useMemo } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ATSDownload } from "@/components/upload/ats-download";
import { UploadResultsTableCard } from "@/components/upload/results-table-card";
import type { BatchProcessResult } from "@/lib/zip/types";

/**
 * Props for {@link UploadResults}.
 */
interface UploadResultsProps {
  /**
   * ZIP processing result returned by the upload API.
   */
  result: BatchProcessResult;
  /**
   * Original filename as selected by the user (optional).
   */
  fileName?: string;
  /**
   * Called when the user wants to upload another file.
   */
  onReset: () => void;
  /**
   * Optional wrapper class name.
   */
  className?: string;
}

/**
 * Displays the ZIP upload processing results.
 *
 * This component renders:
 * - A high-level summary (processed/failed/skipped)
 * - A searchable/filterable/paginated results table
 * - ATS download actions for successfully parsed documents
 * - ZIP-level error list and a reset action
 *
 * @param props - Component props {@link UploadResultsProps}.
 */
export function UploadResults({
  result,
  fileName,
  onReset,
  className,
}: UploadResultsProps) {
  const hasErrors = result.failed > 0 || result.errors.length > 0;
  const allFailed = result.processed === 0 && hasErrors;

  const successfulDocuments = useMemo(() => {
    return result.results.flatMap((fileResult) => {
      const doc = fileResult.result.document;
      return fileResult.result.success && doc ? [doc] : [];
    });
  }, [result.results]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            {allFailed ? (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                Error al procesar
              </>
            ) : hasErrors ? (
              <>
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Procesado con advertencias
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Procesado correctamente
              </>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          <div className="grid gap-3 text-sm sm:flex sm:flex-wrap sm:gap-6">
            {fileName && (
              <div className="flex min-w-0 items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />

                <span className="break-all text-muted-foreground">
                  {fileName}
                </span>
              </div>
            )}

            <div>
              <span className="font-medium text-emerald-600">
                {result.processed}
              </span>{" "}
              <span className="text-muted-foreground">procesados</span>
            </div>

            {result.failed > 0 && (
              <div>
                <span className="font-medium text-destructive">
                  {result.failed}
                </span>{" "}
                <span className="text-muted-foreground">fallidos</span>
              </div>
            )}

            {result.skipped.length > 0 && (
              <div>
                <span className="font-medium text-muted-foreground">
                  {result.skipped.length}
                </span>{" "}
                <span className="text-muted-foreground">omitidos</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <UploadResultsTableCard results={result.results} />

      {/* ATS Download */}
      <ATSDownload documents={successfulDocuments} />

      {/* Errors List */}
      {result.errors.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <XCircle className="h-4 w-4" />
              Errores ({result.errors.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="px-4 sm:px-6">
            <ul className="space-y-2 text-sm">
              {result.errors.map((error, index) => (
                <li
                  key={index}
                  className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2"
                >
                  <span className="break-all font-mono text-xs text-muted-foreground">
                    {error.filename || "—"}
                  </span>

                  <span className="break-words text-destructive">
                    {error.message}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Reset Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={onReset}
          className="w-full gap-2 sm:w-auto"
        >
          <RotateCcw className="h-4 w-4" />
          Subir otro archivo
        </Button>
      </div>
    </div>
  );
}
