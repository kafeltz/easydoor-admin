import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateEnvText } from "@/engine/export-env";
import type { PipelineParams } from "@/engine/types";

interface ExportPanelProps {
  params: PipelineParams;
}

export function ExportPanel({ params }: ExportPanelProps) {
  const [copied, setCopied] = useState(false);
  const envText = generateEnvText(params);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(envText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([envText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "calibrador.env";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Exportar .env</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1 text-accent" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Copiar
              </>
            )}
          </Button>
        </div>
      </div>
      <ScrollArea className="h-32 rounded-md border border-border bg-background">
        <pre className="p-3 text-[11px] font-mono text-muted-foreground whitespace-pre">{envText}</pre>
      </ScrollArea>
    </div>
  );
}
