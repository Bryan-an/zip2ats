import { FileArchive } from "lucide-react";
import { UploadSection } from "@/components/upload/upload-section";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-4 sm:h-16 sm:px-6">
          <div className="flex items-center gap-2">
            <FileArchive className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              zip2ats
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
          {/* Title Section */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Convierte tus XMLs del SRI a formato ATS
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Sube un archivo ZIP con documentos electrónicos y obtén el resumen
              para tu anexo transaccional
            </p>
          </div>

          {/* Upload Section - Client Component */}
          <UploadSection />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex min-h-14 max-w-4xl items-center justify-center px-4 py-3 text-center sm:px-6">
          <p className="text-xs text-muted-foreground sm:text-sm">
            Procesa documentos electrónicos del SRI Ecuador
          </p>
        </div>
      </footer>
    </div>
  );
}
