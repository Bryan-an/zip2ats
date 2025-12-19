"use client";

import { useDeferredValue, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
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
import {
  DOCUMENT_TYPE_LABELS,
  type DocumentType,
} from "@/constants/document-types";
import { formatCurrency } from "@/lib/db-utils";

const STATUS_FILTERS = {
  ALL: "all",
  OK: "ok",
  WARNING: "warning",
  ERROR: "error",
} as const;

type StatusFilter = (typeof STATUS_FILTERS)[keyof typeof STATUS_FILTERS];

const TYPE_FILTER_ALL = "all" as const;
type TypeFilter = typeof TYPE_FILTER_ALL | DocumentType;

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function getRowStatus(
  fileResult: FileProcessResult
): Exclude<StatusFilter, typeof STATUS_FILTERS.ALL> {
  const { result } = fileResult;

  if (!result.success || !result.document) return STATUS_FILTERS.ERROR;

  const warningsCount = result.warnings?.length ?? 0;
  return warningsCount > 0 ? STATUS_FILTERS.WARNING : STATUS_FILTERS.OK;
}

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

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    STATUS_FILTERS.ALL
  );

  const [typeFilter, setTypeFilter] = useState<TypeFilter>(TYPE_FILTER_ALL);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    statusFilter !== STATUS_FILTERS.ALL ||
    typeFilter !== TYPE_FILTER_ALL;

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const normalizedSearchQuery = useMemo(
    () => normalizeSearchText(deferredSearchQuery),
    [deferredSearchQuery]
  );

  const documentTypeOptions = useMemo(() => {
    const types = new Set<DocumentType>();

    for (const fileResult of result.results) {
      const doc = fileResult.result.document;
      if (!fileResult.result.success || !doc) continue;
      types.add(doc.tipo);
    }

    return Array.from(types).sort((a, b) =>
      (DOCUMENT_TYPE_LABELS[a] || a).localeCompare(DOCUMENT_TYPE_LABELS[b] || b)
    );
  }, [result.results]);

  const filteredResults = useMemo(() => {
    const results: FileProcessResult[] = [];

    for (const fileResult of result.results) {
      const { filename, result: parseResult } = fileResult;
      const doc = parseResult.document;

      if (statusFilter !== STATUS_FILTERS.ALL) {
        const rowStatus = getRowStatus(fileResult);
        if (rowStatus !== statusFilter) continue;
      }

      if (typeFilter !== TYPE_FILTER_ALL) {
        if (!doc || !parseResult.success) continue;
        if (doc.tipo !== typeFilter) continue;
      }

      if (normalizedSearchQuery) {
        const errorMessage = parseResult.errors?.[0]?.message || "";

        const docTypeLabel = doc
          ? DOCUMENT_TYPE_LABELS[doc.tipo] || doc.tipo
          : "";

        const haystack = normalizeSearchText(
          [
            filename,
            docTypeLabel,
            doc?.emisor.razonSocial,
            doc?.emisor.ruc,
            doc?.receptor.razonSocial,
            doc?.receptor.identificacion,
            errorMessage,
          ]
            .filter(Boolean)
            .join(" ")
        );

        if (!haystack.includes(normalizedSearchQuery)) continue;
      }

      results.push(fileResult);
    }

    return results;
  }, [normalizedSearchQuery, result.results, statusFilter, typeFilter]);

  const total = filteredResults.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = clampNumber(page, 1, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);

  const paginatedResults = useMemo(() => {
    return filteredResults.slice(startIndex, endIndex);
  }, [endIndex, filteredResults, startIndex]);

  const onPageSizeChange = (value: string) => {
    const nextSize = Number(value);

    if (!Number.isFinite(nextSize) || nextSize <= 0) return;

    setPageSize(nextSize);
    setPage(1);
  };

  const onSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const onStatusFilterChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  const onTypeFilterChange = (value: TypeFilter) => {
    setTypeFilter(value);
    setPage(1);
  };

  const onClearFilters = () => {
    setSearchQuery("");
    setStatusFilter(STATUS_FILTERS.ALL);
    setTypeFilter(TYPE_FILTER_ALL);
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
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Input
                aria-label="Buscar resultados"
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                placeholder="Buscar por archivo, emisor, receptor…"
                className="sm:max-w-md"
              />

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    onStatusFilterChange(value as StatusFilter)
                  }
                >
                  <SelectTrigger className="h-9 w-full sm:w-[170px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value={STATUS_FILTERS.ALL}>Todos</SelectItem>
                    <SelectItem value={STATUS_FILTERS.OK}>OK</SelectItem>

                    <SelectItem value={STATUS_FILTERS.WARNING}>
                      Advertencia
                    </SelectItem>

                    <SelectItem value={STATUS_FILTERS.ERROR}>Error</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={typeFilter}
                  onValueChange={(value) =>
                    onTypeFilterChange(value as TypeFilter)
                  }
                >
                  <SelectTrigger className="h-9 w-full sm:w-[200px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value={TYPE_FILTER_ALL}>Todos</SelectItem>

                    {documentTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {DOCUMENT_TYPE_LABELS[type] || type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearFilters}
                  disabled={!hasActiveFilters}
                >
                  Limpiar
                </Button>
              </div>
            </div>

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
                {paginatedResults.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground text-center"
                    >
                      No se encontraron resultados con los filtros actuales.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedResults.map((fileResult) => (
                    <ResultRow
                      key={fileResult.filename}
                      fileResult={fileResult}
                    />
                  ))
                )}
              </TableBody>
            </Table>

            <div className="mt-4 flex flex-col gap-3 border-t pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="text-muted-foreground">
                Mostrando{" "}
                <span className="font-medium text-foreground">
                  {total === 0 ? 0 : startIndex + 1}
                </span>
                –
                <span className="font-medium text-foreground">
                  {total === 0 ? 0 : endIndex}
                </span>{" "}
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
