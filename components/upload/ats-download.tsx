"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { AlertCircle, Download, FileSpreadsheet, FileText } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ParsedDocument } from "@/types/sri-xml";
import {
  ATS_FILE_FORMATS,
  CSV_EXPORT_MODES,
  CSV_SECTIONS,
} from "@/lib/ats/constants";
import type { ATSFileFormat, CSVExportMode } from "@/lib/ats/constants";
import type { GenerateATSOptions } from "@/lib/schemas/ats";
import { useATSDownload, ATS_DOWNLOAD_STATES } from "@/hooks/use-ats-download";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { PERIODO_REGEX, RUC_REGEX } from "@/constants/ats";

interface ATSDownloadProps {
  documents: ParsedDocument[];
  className?: string;
}

const ATSDownloadFormSchema = z.object({
  format: z.enum([ATS_FILE_FORMATS.XLSX, ATS_FILE_FORMATS.CSV]),
  csvExport: z.enum([
    CSV_EXPORT_MODES.ZIP,
    CSV_SECTIONS.COMPRAS,
    CSV_SECTIONS.VENTAS,
  ]),
  periodo: z
    .string()
    .trim()
    .refine((value) => !value || PERIODO_REGEX.test(value), {
      error: "El período debe tener el formato YYYY-MM.",
    }),
  contribuyenteRuc: z
    .string()
    .trim()
    .refine((value) => !value || RUC_REGEX.test(value), {
      error: "El RUC debe tener 13 dígitos.",
    }),
});

type ATSDownloadFormValues = z.infer<typeof ATSDownloadFormSchema>;

export function ATSDownload({ documents, className }: ATSDownloadProps) {
  const { state, error, download, reset: resetDownload } = useATSDownload();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ATSDownloadFormValues>({
    resolver: zodResolver(ATSDownloadFormSchema),
    mode: "onChange",
    defaultValues: {
      format: ATS_FILE_FORMATS.XLSX,
      csvExport: CSV_EXPORT_MODES.ZIP,
      periodo: "",
      contribuyenteRuc: "",
    },
  });

  const [format, csvExport, periodo, contribuyenteRuc] = useWatch({
    control,
    name: ["format", "csvExport", "periodo", "contribuyenteRuc"],
  });

  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    resetDownload();
  }, [contribuyenteRuc, csvExport, format, periodo, resetDownload]);

  const ids = {
    format: useId(),
    csvExport: useId(),
    periodo: useId(),
    ruc: useId(),
  };

  const canDownload =
    documents.length > 0 && state !== ATS_DOWNLOAD_STATES.GENERATING && isValid;

  const fileTypeLabel = useMemo(() => {
    if (format === ATS_FILE_FORMATS.XLSX) return "Excel (.xlsx)";
    if (csvExport === CSV_EXPORT_MODES.ZIP) return "ZIP con CSVs (.zip)";
    return `CSV (${csvExport}) (.csv)`;
  }, [csvExport, format]);

  const helperText = useMemo(() => {
    if (documents.length === 0) {
      return "No hay documentos válidos para incluir en el ATS.";
    }

    return `${documents.length} documento(s) se incluirán en el reporte.`;
  }, [documents.length]);

  const statusText =
    state === ATS_DOWNLOAD_STATES.GENERATING
      ? "Generando reporte…"
      : state === ATS_DOWNLOAD_STATES.SUCCESS
        ? "Descarga iniciada."
        : null;

  const onSubmit = async (values: ATSDownloadFormValues) => {
    const options: GenerateATSOptions = { formato: values.format };

    const periodoTrimmed = values.periodo.trim();

    if (periodoTrimmed) {
      options.periodo = periodoTrimmed;
    }

    const rucTrimmed = values.contribuyenteRuc.trim();

    if (rucTrimmed) {
      options.contribuyenteRuc = rucTrimmed;
    }

    if (
      values.format === ATS_FILE_FORMATS.CSV &&
      values.csvExport !== CSV_EXPORT_MODES.ZIP
    ) {
      options.csvSection = values.csvExport;
    }

    await download({ documents, options });
  };

  const periodoErrorMessage = errors.periodo?.message;
  const rucErrorMessage = errors.contribuyenteRuc?.message;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="h-5 w-5" />
          Descargar ATS
        </CardTitle>

        <CardDescription>
          Genera el archivo ATS a partir de los documentos procesados.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground">{helperText}</div>

        <Separator />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={ids.format}>Formato</Label>

              <Controller
                control={control}
                name="format"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(value as ATSFileFormat)
                    }
                  >
                    <SelectTrigger id={ids.format} className="w-full">
                      <SelectValue placeholder="Selecciona el formato" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value={ATS_FILE_FORMATS.XLSX}>
                        <span className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          Excel (.xlsx)
                        </span>
                      </SelectItem>

                      <SelectItem value={ATS_FILE_FORMATS.CSV}>
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          CSV / ZIP
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {format === ATS_FILE_FORMATS.CSV ? (
              <div className="space-y-2">
                <Label htmlFor={ids.csvExport}>Exportar</Label>

                <Controller
                  control={control}
                  name="csvExport"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value as CSVExportMode)
                      }
                    >
                      <SelectTrigger id={ids.csvExport} className="w-full">
                        <SelectValue placeholder="Selecciona la exportación" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value={CSV_EXPORT_MODES.ZIP}>
                          ZIP con compras y ventas
                        </SelectItem>

                        <SelectItem value={CSV_SECTIONS.COMPRAS}>
                          Solo compras (CSV)
                        </SelectItem>

                        <SelectItem value={CSV_SECTIONS.VENTAS}>
                          Solo ventas (CSV)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Tipo de archivo</Label>

                <div className="h-9 rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                  {fileTypeLabel}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor={ids.periodo}>Período (opcional)</Label>

              <Input
                id={ids.periodo}
                inputMode="numeric"
                placeholder="YYYY-MM"
                aria-invalid={Boolean(periodoErrorMessage)}
                aria-describedby={[
                  `${ids.periodo}-help`,
                  periodoErrorMessage ? `${ids.periodo}-error` : null,
                ]
                  .filter(Boolean)
                  .join(" ")}
                {...register("periodo")}
              />

              <p
                id={`${ids.periodo}-help`}
                className="text-xs text-muted-foreground"
              >
                Déjalo vacío para inferirlo de los documentos.
              </p>

              {periodoErrorMessage ? (
                <p
                  id={`${ids.periodo}-error`}
                  className="text-xs text-destructive"
                >
                  {periodoErrorMessage}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor={ids.ruc}>RUC del contribuyente (opcional)</Label>

              <Input
                id={ids.ruc}
                inputMode="numeric"
                placeholder="13 dígitos"
                aria-invalid={Boolean(rucErrorMessage)}
                aria-describedby={[
                  `${ids.ruc}-help`,
                  rucErrorMessage ? `${ids.ruc}-error` : null,
                ]
                  .filter(Boolean)
                  .join(" ")}
                {...register("contribuyenteRuc")}
              />

              <p
                id={`${ids.ruc}-help`}
                className="text-xs text-muted-foreground"
              >
                Déjalo vacío para inferirlo de los documentos.
              </p>

              {rucErrorMessage ? (
                <p id={`${ids.ruc}-error`} className="text-xs text-destructive">
                  {rucErrorMessage}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div
              role="status"
              aria-live="polite"
              className="text-sm text-muted-foreground"
            >
              {statusText || `Se descargará: ${fileTypeLabel}`}
            </div>

            <Button
              type="submit"
              disabled={!canDownload}
              className="sm:self-end"
            >
              <span className="relative inline-flex items-center justify-center">
                <span
                  className={`inline-flex items-center gap-2 ${
                    state === ATS_DOWNLOAD_STATES.GENERATING ? "opacity-0" : ""
                  }`}
                >
                  <Download className="h-4 w-4" />
                  Descargar ATS
                </span>

                {state === ATS_DOWNLOAD_STATES.GENERATING ? (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Spinner />
                    <span className="sr-only">Generando…</span>
                  </span>
                ) : null}
              </span>
            </Button>
          </div>
        </form>

        {state === ATS_DOWNLOAD_STATES.ERROR && error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No se pudo generar el ATS</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
