import { Accordion } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ParameterGroup } from "./ParameterGroup";
import { PARAMETERS, GROUPS } from "@/config/parametros";
import type { PipelineParams } from "@/types/calibrador";

interface ParameterSidebarProps {
  params: PipelineParams;
  onParamChange: (key: string, value: number) => void;
}

export function ParameterSidebar({ params, onParamChange }: ParameterSidebarProps) {
  const paramsByGroup: Record<string, typeof PARAMETERS> = {};
  for (const p of PARAMETERS) {
    if (!paramsByGroup[p.group]) paramsByGroup[p.group] = [];
    paramsByGroup[p.group].push(p);
  }

  return (
    <ScrollArea className="h-full">
      <div className="py-2">
        <Accordion type="multiple" defaultValue={GROUPS}>
          {GROUPS.map((group) => (
            <ParameterGroup
              key={group}
              group={group}
              parameters={paramsByGroup[group]}
              params={params}
              onParamChange={onParamChange}
            />
          ))}
        </Accordion>
      </div>
    </ScrollArea>
  );
}
