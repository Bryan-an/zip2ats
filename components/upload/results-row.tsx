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

          <TooltipContent className="max-w-[320px] wrap-break-word">
            {doc.emisor.razonSocial}
          </TooltipContent>
        </Tooltip>

        <div className="text-xs text-muted-foreground">{doc.emisor.ruc}</div>
      </TableCell>

      <TableCell>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="max-w-[200px] truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:rounded-xs"
              tabIndex={0}
              aria-label={doc.receptor.razonSocial}
            >
              {doc.receptor.razonSocial}
            </div>
          </TooltipTrigger>

          <TooltipContent className="max-w-[320px] wrap-break-word">
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
