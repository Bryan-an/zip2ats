"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  RotateCcw,
} from "lucide-react";
import { clampNumber, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ATSDownload } from "@/components/upload/ats-download";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BatchProcessResult, FileProcessResult } from "@/lib/zip/types";
import { DOCUMENT_TYPE_LABELS } from "@/constants/document-types";
import { formatCurrency } from "@/lib/db-utils";

interface UploadResultsProps {
  /** Processing result from API */
  result: BatchProcessResult;
  /** File name that was uploaded */
  fileName?: string;
  /** Called when user wants to upload another file */
  onReset: () => void;
  /** Custom class name */
  className?: string;
}

/**
 * Display results after processing a ZIP file
 */
export function UploadResults({
  result,
  fileName,
  onReset,
  className,
}: UploadResultsProps) {
  const hasErrors = result.failed > 0 || result.errors.length > 0;
  const allFailed = result.processed === 0 && hasErrors;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const total = result.results.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = clampNumber(page, 1, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);

  const paginatedResults = useMemo(() => {
    return result.results.slice(startIndex, endIndex);
  }, [endIndex, result.results, startIndex]);

  const onPageSizeChange = (value: string) => {
    const nextSize = Number(value);

    if (!Number.isFinite(nextSize) || nextSize <= 0) return;

    setPageSize(nextSize);
    setPage(1);
  };

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
          <CardTitle className="flex items-center gap-2 text-lg">
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

        <CardContent>
          <div className="flex flex-wrap gap-6 text-sm">
            {fileName && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{fileName}</span>
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
      {result.results.length > 0 && (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Archivo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Emisor</TableHead>
                  <TableHead>Receptor</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedResults.map((fileResult) => (
                  <ResultRow
                    key={fileResult.filename}
                    fileResult={fileResult}
                  />
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex flex-col gap-3 border-t pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="text-muted-foreground">
                Mostrando{" "}
                <span className="font-medium text-foreground">
                  {startIndex + 1}
                </span>
                –<span className="font-medium text-foreground">{endIndex}</span>{" "}
                de <span className="font-medium text-foreground">{total}</span>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    Filas por página
                  </span>

                  <Select
                    value={String(pageSize)}
                    onValueChange={onPageSizeChange}
                  >
                    <SelectTrigger className="h-8 w-[88px]">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-muted-foreground tabular-nums">
                  Página{" "}
                  <span className="font-medium text-foreground">
                    {currentPage}
                  </span>{" "}
                  de{" "}
                  <span className="font-medium text-foreground">
                    {totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((current) =>
                      Math.max(1, clampNumber(current, 1, totalPages) - 1)
                    )
                  }
                  disabled={currentPage <= 1}
                  aria-label="Página anterior"
                >
                  Anterior
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        totalPages,
                        clampNumber(current, 1, totalPages) + 1
                      )
                    )
                  }
                  disabled={currentPage >= totalPages}
                  aria-label="Página siguiente"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

          <CardContent>
            <ul className="space-y-2 text-sm">
              {result.errors.map((error, index) => (
                <li key={index} className="flex gap-2 items-center">
                  <span className="font-mono text-xs text-muted-foreground">
                    {error.filename || "—"}
                  </span>

                  <span className="text-destructive">{error.message}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Reset Button */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Subir otro archivo
        </Button>
      </div>
    </div>
  );
}

/**
 * Single result row component
 */
function ResultRow({ fileResult }: { fileResult: FileProcessResult }) {
  const { filename, result } = fileResult;
  const doc = result.document;

  if (!result.success || !doc) {
    return (
      <TableRow>
        <TableCell className="font-mono text-xs">{filename}</TableCell>

        <TableCell colSpan={4} className="text-muted-foreground">
          {result.errors?.[0]?.message || "Error al procesar"}
        </TableCell>

        <TableCell className="text-center">
          <Badge
            variant="outline"
            className="border-destructive text-destructive"
          >
            <XCircle aria-hidden="true" />
            Error
          </Badge>
        </TableCell>
      </TableRow>
    );
  }

  const hasWarnings = result.warnings && result.warnings.length > 0;

  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{filename}</TableCell>

      <TableCell>
        <Badge variant="secondary">
          {DOCUMENT_TYPE_LABELS[doc.tipo] || doc.tipo}
        </Badge>
      </TableCell>

      <TableCell>
        <div className="max-w-[200px] truncate" title={doc.emisor.razonSocial}>
          {doc.emisor.razonSocial}
        </div>

        <div className="text-xs text-muted-foreground">{doc.emisor.ruc}</div>
      </TableCell>

      <TableCell>
        <div
          className="max-w-[200px] truncate"
          title={doc.receptor.razonSocial}
        >
          {doc.receptor.razonSocial}
        </div>

        <div className="text-xs text-muted-foreground">
          {doc.receptor.identificacion}
        </div>
      </TableCell>

      <TableCell className="text-right font-medium">
        {formatCurrency(doc.valores.total)}
      </TableCell>

      <TableCell className="text-center">
        {hasWarnings ? (
          <Badge
            variant="outline"
            className="border-amber-500 text-amber-600 dark:text-amber-400"
          >
            <AlertCircle aria-hidden="true" />
            Advertencia
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-emerald-500 text-emerald-600 dark:text-emerald-400"
          >
            <CheckCircle2 aria-hidden="true" />
            OK
          </Badge>
        )}
      </TableCell>
    </TableRow>
  );
}
