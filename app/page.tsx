import { FileArchive } from "lucide-react";
import { UploadSection } from "@/components/upload/upload-section";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-6">
          <div className="flex items-center gap-2">
            <FileArchive className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold tracking-tight">zip2ats</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-12">
          {/* Title Section */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Convierte tus XMLs del SRI a formato ATS
            </h2>

            <p className="mt-2 text-muted-foreground">
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
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-center px-6">
          <p className="text-sm text-muted-foreground">
            Procesa documentos electrónicos del SRI Ecuador
          </p>
        </div>
      </footer>
    </div>
  );
}
