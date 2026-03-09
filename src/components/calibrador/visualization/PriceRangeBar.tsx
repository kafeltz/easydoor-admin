import type { FaixaResult } from "@/types/calibrador";

interface PriceRangeBarProps {
  faixa: FaixaResult;
}

function formatBRL(value: number | null): string {
  if (value == null) return "—";
  return `R$ ${Math.round(value).toLocaleString("pt-BR")}`;
}

export function PriceRangeBar({ faixa }: PriceRangeBarProps) {
  if (faixa.minimo == null || faixa.maximo == null) {
    return (
      <div className="p-4 bg-card rounded-lg border border-border text-center text-muted-foreground text-sm">
        Sem dados suficientes para calcular faixa de preço
      </div>
    );
  }

  const range = faixa.maximo - faixa.minimo;
  const padMin = faixa.minimo - range * 0.1;
  const padMax = faixa.maximo + range * 0.1;
  const totalRange = padMax - padMin || 1;

  const pos = (val: number) => ((val - padMin) / totalRange) * 100;

  return (
    <div className="p-4 bg-card rounded-lg border border-border space-y-3">
      <h3 className="text-sm font-medium text-foreground">Faixa de Preço</h3>
      <div className="relative h-10">
        {/* Background bar */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 bg-muted rounded-full" />
        {/* Active range */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2 bg-accent/40 rounded-full"
          style={{
            left: `${pos(faixa.minimo)}%`,
            width: `${pos(faixa.maximo) - pos(faixa.minimo)}%`,
          }}
        />
        {/* Markers */}
        {[
          { val: faixa.sugerido!, label: "Sugerido", color: "bg-accent-cyan" },
          { val: faixa.minimo, label: "Min", color: "bg-blue-400" },
          { val: faixa.medio!, label: "Médio", color: "bg-accent" },
          { val: faixa.maximo, label: "Máx", color: "bg-orange-400" },
        ].map((m) => (
          <div
            key={m.label}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${pos(m.val)}%` }}
          >
            <div className={`w-3 h-3 rounded-full ${m.color} border-2 border-background`} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: "Sugerido", value: faixa.sugerido, color: "text-accent-cyan" },
          { label: "Mínimo", value: faixa.minimo, color: "text-blue-400" },
          { label: "Médio", value: faixa.medio, color: "text-accent" },
          { label: "Máximo", value: faixa.maximo, color: "text-orange-400" },
        ].map((item) => (
          <div key={item.label}>
            <div className="text-[10px] text-muted-foreground">{item.label}</div>
            <div className={`text-xs font-mono font-medium ${item.color}`}>
              {formatBRL(item.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
