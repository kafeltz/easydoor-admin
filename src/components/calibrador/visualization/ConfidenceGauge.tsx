import type { ConfidenceResult, PipelineParams } from "@/types/calibrador";

interface ConfidenceGaugeProps {
  confidence: ConfidenceResult;
  params: PipelineParams;
}

export function ConfidenceGauge({ confidence, params }: ConfidenceGaugeProps) {
  const value = confidence.score;
  const faixaAlta = params.CONFIDENCE_FAIXA_ALTA;
  const faixaModerada = params.CONFIDENCE_FAIXA_MODERADA;
  const faixaBaixa = params.CONFIDENCE_FAIXA_BAIXA;

  // SVG gauge params
  const cx = 100;
  const cy = 90;
  const r = 70;
  const startAngle = Math.PI;
  const endAngle = 0;
  const totalAngle = Math.PI;

  const arc = (start: number, end: number) => {
    const s = startAngle - (start / 100) * totalAngle;
    const e = startAngle - (end / 100) * totalAngle;
    const x1 = cx + r * Math.cos(s);
    const y1 = cy - r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy - r * Math.sin(e);
    const large = end - start > 50 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 0 ${x2} ${y2}`;
  };

  const needleAngle = startAngle - (Math.min(value, 100) / 100) * totalAngle;
  const nx = cx + (r - 10) * Math.cos(needleAngle);
  const ny = cy - (r - 10) * Math.sin(needleAngle);

  const color =
    value >= faixaAlta
      ? "hsl(160, 100%, 45%)"
      : value >= faixaModerada
      ? "hsl(45, 100%, 55%)"
      : value >= faixaBaixa
      ? "hsl(35, 100%, 55%)"
      : "hsl(0, 65%, 50%)";

  return (
    <div className="p-4 bg-card rounded-lg border border-border">
      <h3 className="text-sm font-medium text-foreground mb-2">Confiança</h3>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 200 110" className="w-40 h-24">
          {/* Background arcs */}
          <path d={arc(0, faixaBaixa)} fill="none" stroke="hsl(0, 65%, 50%)" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
          <path d={arc(faixaBaixa, faixaModerada)} fill="none" stroke="hsl(35, 100%, 55%)" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
          <path d={arc(faixaModerada, faixaAlta)} fill="none" stroke="hsl(45, 100%, 55%)" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
          <path d={arc(faixaAlta, 100)} fill="none" stroke="hsl(160, 100%, 45%)" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
          {/* Active arc */}
          <path d={arc(0, Math.min(value, 100))} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
          {/* Needle */}
          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="4" fill={color} />
          {/* Value */}
          <text x={cx} y={cy + 2} textAnchor="middle" className="text-lg font-bold" fill="currentColor" fontSize="18" fontFamily="JetBrains Mono">
            {value.toFixed(1)}
          </text>
        </svg>
        <div className="flex-1 space-y-1">
          <div className="text-sm font-medium" style={{ color }}>
            {confidence.diagnostico}
          </div>
          {confidence.sub_scores && (
            <div className="space-y-0.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Quantidade</span>
                <span className="font-mono">{confidence.sub_scores.quantidade.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Dispersão</span>
                <span className="font-mono">{confidence.sub_scores.dispersao.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Qualidade</span>
                <span className="font-mono">{confidence.sub_scores.qualidade.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Similaridade</span>
                <span className="font-mono">{confidence.sub_scores.similaridade.toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
