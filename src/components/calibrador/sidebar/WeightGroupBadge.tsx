import { Badge } from "@/components/ui/badge";
import type { PipelineParams } from "@/engine/types";

interface WeightGroupBadgeProps {
  keys: string[];
  params: PipelineParams;
}

export function WeightGroupBadge({ keys, params }: WeightGroupBadgeProps) {
  const sum = keys.reduce((s, k) => s + (params[k] || 0), 0);
  const rounded = Math.round(sum * 100) / 100;
  const isValid = Math.abs(rounded - 1.0) < 0.011;

  return (
    <Badge
      variant={isValid ? "default" : "destructive"}
      className={`text-[10px] px-1.5 py-0 ${
        isValid
          ? "bg-accent/20 text-accent border-accent/30"
          : "bg-destructive/20 text-destructive border-destructive/30"
      }`}
    >
      = {rounded.toFixed(2)}
    </Badge>
  );
}
