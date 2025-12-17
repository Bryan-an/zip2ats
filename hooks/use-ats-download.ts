"use client";

import { useCallback, useState } from "react";
import type { ParsedDocument } from "@/types/sri-xml";
import type { ApiErrorResponse } from "@/types/api";
import {
  GenerateATSRequestSchema,
  type GenerateATSOptions,
} from "@/lib/schemas/ats";

export const ATS_DOWNLOAD_STATES = {
  IDLE: "idle",
  GENERATING: "generating",
  SUCCESS: "success",
  ERROR: "error",
} as const;

export type ATSDownloadState =
  (typeof ATS_DOWNLOAD_STATES)[keyof typeof ATS_DOWNLOAD_STATES];

export interface ATSDownloadError {
  message: string;
}

export interface DownloadATSArgs {
  documents: ParsedDocument[];
  options?: GenerateATSOptions;
}

export interface UseATSDownloadReturn {
  state: ATSDownloadState;
  error: ATSDownloadError | null;
  download: (args: DownloadATSArgs) => Promise<void>;
  reset: () => void;
}

function getFilenameFromContentDisposition(
  headerValue: string | null
): string | null {
  if (!headerValue) return null;

  // RFC 5987 (best-effort): filename*=UTF-8''...
  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(headerValue);

  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      // ignore decode failures
    }
  }

  const simpleMatch = /filename="([^"]+)"/i.exec(headerValue);

  if (simpleMatch?.[1]) return simpleMatch[1];

  return null;
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noreferrer";
  document.body.appendChild(anchor);

  try {
    anchor.click();
  } finally {
    // Defer revocation so the download has time to start (Safari can abort if
    // the ObjectURL is revoked immediately after click()).
    window.setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } finally {
        anchor.remove();
      }
    }, 1000);
  }
}

export function useATSDownload(): UseATSDownloadReturn {
  const [state, setState] = useState<ATSDownloadState>(
    ATS_DOWNLOAD_STATES.IDLE
  );

  const [error, setError] = useState<ATSDownloadError | null>(null);

  const reset = useCallback(() => {
    setState(ATS_DOWNLOAD_STATES.IDLE);
    setError(null);
  }, []);

  const download = useCallback(
    async ({ documents, options }: DownloadATSArgs) => {
      setState(ATS_DOWNLOAD_STATES.GENERATING);
      setError(null);

      const payload = {
        documents,
        ...(options ? { options } : {}),
      };

      const validation = GenerateATSRequestSchema.safeParse(payload);

      if (!validation.success) {
        const message =
          validation.error.issues[0]?.message || "Solicitud inválida";

        setError({ message });
        setState(ATS_DOWNLOAD_STATES.ERROR);
        return;
      }

      try {
        const response = await fetch("/api/ats/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validation.data),
        });

        if (!response.ok) {
          const contentType = response.headers.get("content-type") ?? "";

          if (contentType.includes("application/json")) {
            const data = (await response.json()) as ApiErrorResponse;
            const message = data.error?.message || "Error al generar el ATS";
            setError({ message });
          } else {
            setError({ message: "Error al generar el ATS" });
          }

          setState(ATS_DOWNLOAD_STATES.ERROR);
          return;
        }

        const blob = await response.blob();

        const filename =
          getFilenameFromContentDisposition(
            response.headers.get("content-disposition")
          ) ?? "ATS_reporte";

        triggerBrowserDownload(blob, filename);
        setState(ATS_DOWNLOAD_STATES.SUCCESS);
      } catch (err) {
        setError({
          message:
            err instanceof Error ? err.message : "Error al generar el ATS",
        });

        setState(ATS_DOWNLOAD_STATES.ERROR);
      }
    },
    []
  );

  return {
    state,
    error,
    download,
    reset,
  };
}
