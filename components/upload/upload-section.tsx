"use client";

import { AlertCircle, FileArchive, RotateCcw } from "lucide-react";
import { useFileUpload, UPLOAD_STATES } from "@/hooks/use-file-upload";
import { Dropzone } from "@/components/ui/dropzone";
import { UploadResults } from "@/components/upload/results";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MAX_ZIP_FILE_SIZE } from "@/constants/upload";

/**
 * Client-side upload section with interactive state management
 */
export function UploadSection() {
  const { state, file, result, error, upload, reset } = useFileUpload();

  // Custom drag icon for ZIP files
  const zipDragIcon = <FileArchive className="h-10 w-10 text-primary" />;

  if (state === UPLOAD_STATES.IDLE) {
    return (
      <Dropzone
        onFileSelect={upload}
        accept=".zip"
        maxSize={MAX_ZIP_FILE_SIZE}
        title="Arrastra un archivo ZIP aquí"
        dragIcon={zipDragIcon}
        className="mx-auto max-w-xl"
      />
    );
  }

  if (state === UPLOAD_STATES.UPLOADING) {
    return (
      <Dropzone
        onFileSelect={upload}
        accept=".zip"
        maxSize={MAX_ZIP_FILE_SIZE}
        isLoading
        fileName={file?.name}
        className="mx-auto max-w-xl"
      />
    );
  }

  if (state === UPLOAD_STATES.ERROR && error) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al procesar el archivo</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={reset}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4" />
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  if (state === UPLOAD_STATES.SUCCESS && result) {
    return (
      <UploadResults result={result} fileName={file?.name} onReset={reset} />
    );
  }

  return null;
}
