"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { DOCUMENT_TYPE_LABELS } from "@/constants/document-types";
import type { FileProcessResult } from "@/lib/zip/types";
import {
  STATUS_FILTERS,
  TYPE_FILTER_ALL,
  type StatusFilter,
  type TypeFilter,
  useUploadResultsTable,
} from "@/hooks/use-upload-results-table";
import { ResultCard, ResultRow } from "@/components/upload/results-row";

/**
 * Props for {@link UploadResultsTableCard}.
 */
interface UploadResultsTableCardProps {
  /**
   * All file results produced by the ZIP processing pipeline.
   */
  results: FileProcessResult[];
}

/**
 * Renders the results table card: search, filters, table rows, and pagination.
 *
 * This component is intentionally UI-focused; state and derived data are handled
 * by {@link useUploadResultsTable}.
 *
 * @param props - Component props {@link UploadResultsTableCardProps}.
 */
export function UploadResultsTableCard({
  results,
}: UploadResultsTableCardProps) {
  const {
    pageSize,
    searchQuery,
    statusFilter,
    typeFilter,
    hasActiveFilters,
    documentTypeOptions,
    paginatedResults,
    total,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    setPage,
    onPageSizeChange,
    onSearchQueryChange,
    onStatusFilterChange,
    onTypeFilterChange,
    onClearFilters,
  } = useUploadResultsTable({ results });

  if (results.length === 0) return null;

  return (
    <Card>
      <CardContent className="px-4 sm:px-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            aria-label="Buscar resultados"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Buscar por archivo, emisor, receptor…"
            className="w-full sm:max-w-md"
          />

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
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
              onValueChange={(value) => onTypeFilterChange(value as TypeFilter)}
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
              className="w-full sm:w-auto"
            >
              Limpiar
            </Button>
          </div>
        </div>

        <div className="space-y-3 md:hidden">
          {paginatedResults.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              No se encontraron resultados con los filtros actuales.
            </div>
          ) : (
            paginatedResults.map((fileResult) => (
              <ResultCard key={fileResult.filename} fileResult={fileResult} />
            ))
          )}
        </div>

        <div className="hidden md:block">
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
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t pt-4 text-sm lg:flex-row lg:items-center lg:justify-between">
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

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <div className="flex items-center justify-between gap-2 sm:justify-start">
              <span className="text-muted-foreground">Filas por página</span>

              <Select value={String(pageSize)} onValueChange={onPageSizeChange}>
                <SelectTrigger className="h-8 w-[96px]">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-muted-foreground tabular-nums sm:text-center">
              Página{" "}
              <span className="font-medium text-foreground">{currentPage}</span>{" "}
              de{" "}
              <span className="font-medium text-foreground">{totalPages}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={currentPage <= 1}
                aria-label="Página anterior"
                className="w-full sm:w-auto"
              >
                Anterior
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={currentPage >= totalPages}
                aria-label="Página siguiente"
                className="w-full sm:w-auto"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
