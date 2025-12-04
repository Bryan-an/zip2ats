"use client";

import { useState, useCallback } from "react";
import type { BatchProcessResult } from "@/lib/zip/types";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/types/api";
import { ZIP_FILE_FIELD_NAME, UPLOAD_ERRORS } from "@/constants/upload";

/**
 * Upload state values
 */
export const UPLOAD_STATES = {
  IDLE: "idle",
  UPLOADING: "uploading",
  SUCCESS: "success",
  ERROR: "error",
} as const;

/**
 * Upload state type (derived from UPLOAD_STATES)
 */
export type UploadState = (typeof UPLOAD_STATES)[keyof typeof UPLOAD_STATES];

/**
 * Upload error with code and message
 */
export interface UploadError {
  code: string;
  message: string;
}

/**
 * Hook return type
 */
export interface UseFileUploadReturn {
  /** Current upload state */
  state: UploadState;
  /** Selected file (if any) */
  file: File | null;
  /** Processing result (on success) */
  result: BatchProcessResult | null;
  /** Error (on error state) */
  error: UploadError | null;
  /** Upload a file to the API */
  upload: (file: File) => Promise<void>;
  /** Reset to idle state */
  reset: () => void;
}

/**
 * Hook to handle file upload state and API calls
 */
export function useFileUpload(): UseFileUploadReturn {
  const [state, setState] = useState<UploadState>(UPLOAD_STATES.IDLE);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BatchProcessResult | null>(null);
  const [error, setError] = useState<UploadError | null>(null);

  /**
   * Upload file to API
   */
  const upload = useCallback(async (fileToUpload: File) => {
    // Set uploading state
    setFile(fileToUpload);
    setState(UPLOAD_STATES.UPLOADING);
    setError(null);
    setResult(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append(ZIP_FILE_FIELD_NAME, fileToUpload);

      // Send to API
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as
        | ApiSuccessResponse<BatchProcessResult>
        | ApiErrorResponse;

      if (!data.success) {
        setError({
          code: data.error.code,
          message: data.error.message,
        });

        setState(UPLOAD_STATES.ERROR);
        return;
      }

      // Success
      setResult(data.data);
      setState(UPLOAD_STATES.SUCCESS);
    } catch (err) {
      setError({
        code: UPLOAD_ERRORS.INTERNAL_ERROR,
        message:
          err instanceof Error ? err.message : "Error al subir el archivo",
      });

      setState(UPLOAD_STATES.ERROR);
    }
  }, []);

  /**
   * Reset to idle state
   */
  const reset = useCallback(() => {
    setState(UPLOAD_STATES.IDLE);
    setFile(null);
    setResult(null);
    setError(null);
  }, []);

  return {
    state,
    file,
    result,
    error,
    upload,
    reset,
  };
}
