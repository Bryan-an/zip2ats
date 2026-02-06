"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface DropzoneProps {
  /** Callback when file is selected */
  onFileSelect: (file: File) => void;
  /** Accepted file types (e.g., ".zip,.xml" or "image/*") */
  accept?: string;
  /** Maximum file size in bytes (for display only, validation should be done by consumer) */
  maxSize?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Current file name for loading state */
  fileName?: string;
  /** Custom idle icon */
  icon?: React.ReactNode;
  /** Custom drag over icon */
  dragIcon?: React.ReactNode;
  /** Custom loading icon */
  loadingIcon?: React.ReactNode;
  /** Idle title text */
  title?: string;
  /** Drag over title text */
  dragTitle?: string;
  /** Idle subtitle text */
  subtitle?: string;
  /** Loading title text */
  loadingTitle?: string;
  /** Show max size hint */
  showMaxSize?: boolean;
  /** Custom class */
  className?: string;
}

/**
 * Generic drag & drop file upload zone
 *
 * @example
 * ```tsx
 * <Dropzone
 *   onFileSelect={handleFile}
 *   accept=".zip"
 *   maxSize={50 * 1024 * 1024}
 *   title="Arrastra un archivo ZIP aquí"
 * />
 * ```
 */
export function Dropzone({
  onFileSelect,
  accept,
  maxSize,
  disabled = false,
  isLoading = false,
  fileName,
  icon,
  dragIcon,
  loadingIcon,
  title = "Arrastra un archivo aquí",
  dragTitle = "Suelta el archivo aquí",
  subtitle = "o haz clic para seleccionar",
  loadingTitle = "Procesando archivo...",
  showMaxSize = true,
  className,
}: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDisabled = disabled || isLoading;

  /**
   * Handle file selection from input or drop
   */
  const handleFile = useCallback(
    (file: File) => {
      if (isDisabled) return;
      onFileSelect(file);
    },
    [isDisabled, onFileSelect]
  );

  /**
   * Handle drag events
   */
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isDisabled) {
        setIsDragOver(true);
      }
    },
    [isDisabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (isDisabled) return;

      const file = e.dataTransfer.files[0];

      if (file) {
        handleFile(file);
      }
    },
    [isDisabled, handleFile]
  );

  /**
   * Handle click to open file dialog
   */
  const handleClick = useCallback(() => {
    if (!isDisabled && inputRef.current) {
      inputRef.current.click();
    }
  }, [isDisabled]);

  /**
   * Handle file input change
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (file) {
        handleFile(file);
      }

      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [handleFile]
  );

  /**
   * Format bytes to human readable size
   */
  const formatSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(0)}GB`;
    }

    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
    }

    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(0)}KB`;
    }

    return `${bytes}B`;
  };

  // Default icons
  const defaultIcon = <Upload className="h-10 w-10 text-muted-foreground" />;
  const defaultDragIcon = <Upload className="h-10 w-10 text-primary" />;

  const defaultLoadingIcon = (
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
  );

  /**
   * Handle keyboard events for accessibility
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isDisabled) return;

      if (e.key === "Enter") {
        handleClick();
      } else if (e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [isDisabled, handleClick]
  );

  return (
    <Card
      className={cn(
        "relative cursor-pointer border-2 border-dashed transition-all duration-200",
        "hover:border-primary/50 hover:bg-muted/50",
        isDragOver && "border-primary bg-primary/5",
        isDisabled && "cursor-not-allowed opacity-60",
        className
      )}
      tabIndex={isDisabled ? -1 : 0}
      role="button"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={isDisabled}
        className="hidden"
        aria-label="Seleccionar archivo"
      />

      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center sm:p-12">
        {isLoading ? (
          <>
            <div className="rounded-full bg-primary/10 p-3 sm:p-4">
              {loadingIcon || defaultLoadingIcon}
            </div>

            <div className="space-y-1 break-words">
              <p className="text-base font-medium sm:text-lg">{loadingTitle}</p>

              {fileName && (
                <p className="break-all text-sm text-muted-foreground">
                  {fileName}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <div
              className={cn(
                "rounded-full p-3 transition-colors sm:p-4",
                isDragOver ? "bg-primary/20" : "bg-muted"
              )}
            >
              {isDragOver ? dragIcon || defaultDragIcon : icon || defaultIcon}
            </div>

            <div className="space-y-1">
              <p className="text-base font-medium sm:text-lg">
                {isDragOver ? dragTitle : title}
              </p>

              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>

            {showMaxSize && maxSize && (
              <p className="text-xs text-muted-foreground">
                Tamaño máximo: {formatSize(maxSize)}
              </p>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
