import { Slider } from "@/components/ui/slider";
import type { ParameterMeta } from "@/engine/types";

interface ParameterSliderProps {
  meta: ParameterMeta;
  value: number;
  onChange: (value: number) => void;
}

function formatValue(value: number, format?: string): string {
  switch (format) {
    case "percent":
      return `${(value * 100).toFixed(0)}%`;
    case "currency":
      return `R$ ${value.toLocaleString("pt-BR")}`;
    case "meters":
      return `${value}m`;
    case "integer":
      return `${Math.round(value)}`;
    case "decimal":
      return `${value.toFixed(2)}`;
    default:
      return `${value}`;
  }
}

export function ParameterSlider({ meta, value, onChange }: ParameterSliderProps) {
  return (
    <div className="space-y-1.5 px-1">
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">{meta.label}</label>
        <span className="text-xs font-mono text-foreground font-medium">
          {formatValue(value, meta.format)}
        </span>
      </div>
      <Slider
        min={meta.min}
        max={meta.max}
        step={meta.step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
    </div>
  );
}
