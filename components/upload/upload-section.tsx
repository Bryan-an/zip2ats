"use client";

import { AlertCircle, FileArchive } from "lucide-react";
import { useFileUpload, UPLOAD_STATES } from "@/hooks/use-file-upload";
import { Dropzone } from "@/components/ui/dropzone";
import { UploadResults } from "@/components/upload/results";
import { Card, CardContent } from "@/components/ui/card";
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
        <Card className="border-destructive/50">
          <CardContent className="flex items-start gap-4 p-6">
            <AlertCircle className="h-6 w-6 shrink-0 text-destructive" />

            <div className="space-y-1">
              <p className="font-medium text-destructive">
                Error al procesar el archivo
              </p>

              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button variant="outline" onClick={reset}>
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
