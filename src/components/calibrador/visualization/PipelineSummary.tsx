import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { PipelineResult } from "@/engine/types";

interface PipelineSummaryProps {
  result: PipelineResult;
}

export function PipelineSummary({ result }: PipelineSummaryProps) {
  const cards = [
    {
      label: "Válidos",
      value: result.validos.length,
      total: result.comparaveis.length,
      icon: CheckCircle2,
      color: "text-accent",
    },
    {
      label: "Outliers",
      value: result.outliers.length,
      total: result.comparaveis.length,
      icon: AlertTriangle,
      color: "text-accent-warning",
    },
    {
      label: "Score Baixo",
      value: result.filtradosPorScore.length,
      total: result.comparaveis.length,
      icon: XCircle,
      color: "text-destructive",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <c.icon className={`w-4 h-4 ${c.color}`} />
              <span className="text-xs text-muted-foreground">{c.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold metric-value ${c.color}`}>{c.value}</span>
              <span className="text-xs text-muted-foreground">/ {c.total}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
