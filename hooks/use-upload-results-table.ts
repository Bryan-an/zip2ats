"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { clampNumber, normalizeSearchText } from "@/lib/utils";
import {
  DOCUMENT_TYPE_LABELS,
  type DocumentType,
} from "@/constants/document-types";
import type { FileProcessResult } from "@/lib/zip/types";

/**
 * Available row status filter values for the results table.
 */
export const STATUS_FILTERS = {
  ALL: "all",
  OK: "ok",
  WARNING: "warning",
  ERROR: "error",
} as const;

/**
 * Union type of {@link STATUS_FILTERS} values.
 */
export type StatusFilter = (typeof STATUS_FILTERS)[keyof typeof STATUS_FILTERS];

/**
 * Special value representing \"all document types\".
 */
export const TYPE_FILTER_ALL = "all" as const;

/**
 * Union type for document type filtering (either a specific document type or
 * {@link TYPE_FILTER_ALL}).
 */
export type TypeFilter = typeof TYPE_FILTER_ALL | DocumentType;

/**
 * Derives the row status for filtering purposes.
 *
 * - `error`: parsing failed or document is missing
 * - `warning`: parsing succeeded but contains warnings
 * - `ok`: parsing succeeded without warnings
 */
function getRowStatus(
  fileResult: FileProcessResult
): Exclude<StatusFilter, typeof STATUS_FILTERS.ALL> {
  const { result } = fileResult;

  if (!result.success || !result.document) return STATUS_FILTERS.ERROR;

  const warningsCount = result.warnings?.length ?? 0;
  return warningsCount > 0 ? STATUS_FILTERS.WARNING : STATUS_FILTERS.OK;
}

/**
 * Input arguments for {@link useUploadResultsTable}.
 */
export interface UseUploadResultsTableArgs {
  /**
   * Full results list (unfiltered, unpaginated).
   */
  results: FileProcessResult[];

  /**
   * Initial page size (defaults to 50).
   */
  initialPageSize?: number;
}

/**
 * Return shape for {@link useUploadResultsTable}.
 */
export interface UseUploadResultsTableReturn {
  /**
   * Current 1-based page.
   */
  page: number;

  /**
   * Current number of rows per page.
   */
  pageSize: number;

  /**
   * Raw search query as typed by the user.
   */
  searchQuery: string;

  /**
   * Current status filter.
   */
  statusFilter: StatusFilter;

  /**
   * Current document type filter.
   */
  typeFilter: TypeFilter;

  /**
   * Whether any filter/search input is currently active.
   */
  hasActiveFilters: boolean;

  /**
   * Available document types derived from successful results, sorted by label.
   */
  documentTypeOptions: DocumentType[];

  /**
   * Results after applying filters and pagination.
   */
  paginatedResults: FileProcessResult[];

  /**
   * Total number of results after filtering (before pagination).
   */
  total: number;

  /**
   * Total number of pages after filtering and applying {@link pageSize}.
   */
  totalPages: number;

  /**
   * Current page clamped to `[1, totalPages]`.
   */
  currentPage: number;

  /**
   * Start index (0-based) of the current page in the filtered results.
   */
  startIndex: number;

  /**
   * End index (exclusive) of the current page in the filtered results.
   */
  endIndex: number;

  /**
   * Sets the current page. Use with functional updates for prev/next controls.
   */
  setPage: (page: number | ((current: number) => number)) => void;

  /**
   * Updates the page size from a `<Select>` value and resets the page to 1.
   */
  onPageSizeChange: (value: string) => void;

  /**
   * Updates the search query and resets the page to 1.
   */
  onSearchQueryChange: (value: string) => void;

  /**
   * Updates the status filter and resets the page to 1.
   */
  onStatusFilterChange: (value: StatusFilter) => void;

  /**
   * Updates the document type filter and resets the page to 1.
   */
  onTypeFilterChange: (value: TypeFilter) => void;

  /**
   * Clears all filters/search and resets the page to 1.
   */
  onClearFilters: () => void;
}

/**
 * Client-side table state and derived data for upload processing results.
 *
 * Encapsulates:
 * - search normalization and filtering
 * - status/type filters
 * - pagination and derived counts
 *
 * @param args - Hook args {@link UseUploadResultsTableArgs}.
 */
export function useUploadResultsTable({
  results,
  initialPageSize = 50,
}: UseUploadResultsTableArgs): UseUploadResultsTableReturn {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
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

    for (const fileResult of results) {
      const doc = fileResult.result.document;
      if (!fileResult.result.success || !doc) continue;
      types.add(doc.tipo);
    }

    return Array.from(types).sort((a, b) =>
      (DOCUMENT_TYPE_LABELS[a] || a).localeCompare(DOCUMENT_TYPE_LABELS[b] || b)
    );
  }, [results]);

  const filteredResults = useMemo(() => {
    const next: FileProcessResult[] = [];

    for (const fileResult of results) {
      const { filename, result: parseResult } = fileResult;
      const doc = parseResult.document;

      if (statusFilter !== STATUS_FILTERS.ALL) {
        const rowStatus = getRowStatus(fileResult);
        if (rowStatus !== statusFilter) continue;
      }

      if (typeFilter !== TYPE_FILTER_ALL) {
        if (!parseResult.success || !doc) continue;
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

      next.push(fileResult);
    }

    return next;
  }, [normalizedSearchQuery, results, statusFilter, typeFilter]);

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

  return {
    page,
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
  };
}
