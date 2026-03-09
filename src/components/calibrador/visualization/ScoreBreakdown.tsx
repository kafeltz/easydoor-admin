import type { Imovel } from "@/types/calibrador";

interface ScoreBreakdownProps {
  comp: Imovel;
}

const CATEGORY_LABELS: Record<string, string> = {
  localizacao: "Localização",
  estrutura: "Estrutura",
  estado: "Estado",
  diferenciais: "Diferenciais",
};

const CATEGORY_COLORS: Record<string, string> = {
  localizacao: "bg-blue-400",
  estrutura: "bg-accent",
  estado: "bg-accent-gold",
  diferenciais: "bg-purple-400",
};

export function ScoreBreakdown({ comp }: ScoreBreakdownProps) {
  if (!comp.sub_scores) return null;

  return (
    <div className="p-3 bg-muted/30 rounded-lg border border-border space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">{comp.id} — Score: {comp.score?.toFixed(1)}</span>
      </div>
      <div className="space-y-1.5">
        {Object.entries(comp.sub_scores).map(([cat, value]) => (
          <div key={cat} className="space-y-0.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">{CATEGORY_LABELS[cat] || cat}</span>
              <span className="font-mono">{value != null ? `${value.toFixed(1)}` : "N/A"}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              {value != null && (
                <div
                  className={`h-full rounded-full ${CATEGORY_COLORS[cat] || "bg-accent"}`}
                  style={{ width: `${Math.min(value, 100)}%` }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
