"use client";

import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DOCUMENT_TYPE_LABELS } from "@/constants/document-types";
import { formatCurrency } from "@/lib/db-utils";
import type { FileProcessResult } from "@/lib/zip/types";

/**
 * Props for {@link ResultRow}.
 */
interface ResultRowProps {
  /**
   * Processing result for a single file inside the uploaded ZIP.
   */
  fileResult: FileProcessResult;
}

function ResultStatusBadge({ fileResult }: ResultRowProps) {
  const { result } = fileResult;
  const doc = result.document;
  const hasWarnings = (result.warnings?.length ?? 0) > 0;

  if (!result.success || !doc) {
    return (
      <Badge variant="outline" className="border-destructive text-destructive">
        <XCircle aria-hidden="true" />
        Error
      </Badge>
    );
  }

  if (hasWarnings) {
    return (
      <Badge
        variant="outline"
        className="border-amber-500 text-amber-600 dark:text-amber-400"
      >
        <AlertCircle aria-hidden="true" />
        Advertencia
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-emerald-500 text-emerald-600 dark:text-emerald-400"
    >
      <CheckCircle2 aria-hidden="true" />
      OK
    </Badge>
  );
}

export function ResultCard({ fileResult }: ResultRowProps) {
  const { filename, result } = fileResult;
  const doc = result.document;

  return (
    <article className="space-y-3 rounded-lg border p-3">
      <div className="space-y-2">
        <p className="break-all font-mono text-xs">{filename}</p>

        <div className="flex flex-wrap items-center gap-2">
          {result.success && doc ? (
            <Badge variant="secondary">
              {DOCUMENT_TYPE_LABELS[doc.tipo] || doc.tipo}
            </Badge>
          ) : null}

          <ResultStatusBadge fileResult={fileResult} />
        </div>
      </div>

      {!result.success || !doc ? (
        <p className="break-words text-sm text-destructive">
          {result.errors?.[0]?.message || "Error al procesar"}
        </p>
      ) : (
        <>
          <div className="space-y-2 rounded-md bg-muted/40 p-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Emisor</p>
              <p className="break-words font-medium">
                {doc.emisor.razonSocial}
              </p>
              <p className="text-xs text-muted-foreground">{doc.emisor.ruc}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Receptor</p>
              <p className="break-words font-medium">
                {doc.receptor.razonSocial}
              </p>

              <p className="text-xs text-muted-foreground">
                {doc.receptor.identificacion}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-2 text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-medium">
              {formatCurrency(doc.valores.total)}
            </span>
          </div>
        </>
      )}
    </article>
  );
}

/**
 * Renders a single table row for a processed file.
 *
 * @param props - Component props {@link ResultRowProps}.
 */
export function ResultRow({ fileResult }: ResultRowProps) {
  const { filename, result } = fileResult;
  const doc = result.document;

  if (!result.success || !doc) {
    return (
      <TableRow>
        <TableCell className="max-w-[220px] break-all font-mono text-xs whitespace-normal">
          {filename}
        </TableCell>

        <TableCell colSpan={4} className="break-words text-muted-foreground">
          {result.errors?.[0]?.message || "Error al procesar"}
        </TableCell>

        <TableCell className="text-center">
          <ResultStatusBadge fileResult={fileResult} />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell className="max-w-[220px] break-all font-mono text-xs whitespace-normal">
        {filename}
      </TableCell>

      <TableCell>
        <Badge variant="secondary">
          {DOCUMENT_TYPE_LABELS[doc.tipo] || doc.tipo}
        </Badge>
      </TableCell>

      <TableCell>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="max-w-[200px] truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:rounded-xs"
              tabIndex={0}
              aria-label={doc.emisor.razonSocial}
            >
              {doc.emisor.razonSocial}
            </div>
          </TooltipTrigger>

          <TooltipContent className="max-w-[320px] break-words">
            {doc.emisor.razonSocial}
          </TooltipContent>
        </Tooltip>

        <div className="text-xs text-muted-foreground">{doc.emisor.ruc}</div>
      </TableCell>

      <TableCell>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="max-w-[200px] truncate focus-visible:rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2"
              tabIndex={0}
              aria-label={doc.receptor.razonSocial}
            >
              {doc.receptor.razonSocial}
            </div>
          </TooltipTrigger>

          <TooltipContent className="max-w-[320px] break-words">
            {doc.receptor.razonSocial}
          </TooltipContent>
        </Tooltip>

        <div className="text-xs text-muted-foreground">
          {doc.receptor.identificacion}
        </div>
      </TableCell>

      <TableCell className="text-right font-medium">
        {formatCurrency(doc.valores.total)}
      </TableCell>

      <TableCell className="text-center">
        <ResultStatusBadge fileResult={fileResult} />
      </TableCell>
    </TableRow>
  );
}
