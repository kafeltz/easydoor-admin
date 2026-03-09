import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Imovel } from "@/types/calibrador";
import { ScoreBreakdown } from "./ScoreBreakdown";

interface ComparableTableProps {
  comparaveis: Imovel[];
  scoreMinimo: number;
}

function statusColor(comp: Imovel, scoreMinimo: number): string {
  if (comp.outlier) return "border-l-destructive bg-destructive/5";
  if ((comp.score || 0) < scoreMinimo) return "border-l-accent-warning bg-accent-warning/5";
  return "border-l-accent bg-accent/5";
}

function statusLabel(comp: Imovel, scoreMinimo: number): string {
  if (comp.outlier) return "Outlier";
  if ((comp.score || 0) < scoreMinimo) return "Score baixo";
  return "Válido";
}

function formatBRL(v: number | null | undefined): string {
  if (v == null) return "—";
  return `R$ ${Math.round(v).toLocaleString("pt-BR")}`;
}

export function ComparableTable({ comparaveis, scoreMinimo }: ComparableTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = comparaveis.find((c) => c.id === selectedId);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 px-2">ID</th>
              <th className="text-right py-2 px-2">Preço</th>
              <th className="text-right py-2 px-2">PAM²</th>
              <th className="text-right py-2 px-2">MAT</th>
              <th className="text-right py-2 px-2">Score</th>
              <th className="text-center py-2 px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {comparaveis.map((comp) => (
              <tr
                key={comp.id}
                className={cn(
                  "border-l-2 cursor-pointer hover:bg-muted/30 transition-colors",
                  statusColor(comp, scoreMinimo),
                  selectedId === comp.id && "ring-1 ring-accent/50"
                )}
                onClick={() => setSelectedId(selectedId === comp.id ? null : comp.id)}
              >
                <td className="py-2 px-2 font-mono">{comp.id}</td>
                <td className="py-2 px-2 text-right font-mono">{formatBRL(comp.preco)}</td>
                <td className="py-2 px-2 text-right font-mono">
                  {comp.pam2 != null ? comp.pam2.toFixed(0) : "—"}
                </td>
                <td className="py-2 px-2 text-right font-mono">
                  {comp.mat_ajuste_total != null ? (
                    <span className={comp.mat_ajuste_total < 0 ? "text-destructive" : comp.mat_ajuste_total > 0 ? "text-accent" : ""}>
                      {comp.mat_ajuste_total > 0 ? "+" : ""}
                      {formatBRL(comp.mat_ajuste_total)}
                    </span>
                  ) : "—"}
                </td>
                <td className="py-2 px-2 text-right font-mono font-medium">
                  {comp.score != null ? comp.score.toFixed(1) : "—"}
                </td>
                <td className="py-2 px-2 text-center">
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full",
                    comp.outlier
                      ? "bg-destructive/20 text-destructive"
                      : (comp.score || 0) < scoreMinimo
                      ? "bg-accent-warning/20 text-accent-warning"
                      : "bg-accent/20 text-accent"
                  )}>
                    {statusLabel(comp, scoreMinimo)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && selected.sub_scores && (
        <ScoreBreakdown comp={selected} />
      )}
    </div>
  );
}
