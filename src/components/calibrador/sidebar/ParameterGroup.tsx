import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ParameterSlider } from "./ParameterSlider";
import { WeightGroupBadge } from "./WeightGroupBadge";
import type { ParameterMeta, PipelineParams } from "@/types/calibrador";
import { WEIGHT_GROUPS } from "@/config/parametros";

interface ParameterGroupProps {
  group: string;
  parameters: ParameterMeta[];
  params: PipelineParams;
  onParamChange: (key: string, value: number) => void;
}

export function ParameterGroup({ group, parameters, params, onParamChange }: ParameterGroupProps) {
  const weightGroup = parameters[0]?.weightGroup;
  const weightKeys = weightGroup ? WEIGHT_GROUPS[weightGroup] : null;

  return (
    <AccordionItem value={group}>
      <AccordionTrigger className="px-4 py-2 text-sm hover:no-underline">
        <div className="flex items-center gap-2">
          <span>{group}</span>
          {weightKeys && <WeightGroupBadge keys={weightKeys} params={params} />}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-3 space-y-3">
        {parameters.map((meta) => (
          <ParameterSlider
            key={meta.key}
            meta={meta}
            value={params[meta.key]}
            onChange={(v) => onParamChange(meta.key, v)}
          />
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}
