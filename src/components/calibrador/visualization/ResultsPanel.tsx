import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PipelineSummary } from "./PipelineSummary";
import { PriceRangeBar } from "./PriceRangeBar";
import { ConfidenceGauge } from "./ConfidenceGauge";
import { ComparableTable } from "./ComparableTable";
import { Pam2Chart } from "./Pam2Chart";
import type { PipelineResult, PipelineParams } from "@/engine/types";

interface ResultsPanelProps {
  result: PipelineResult;
  params: PipelineParams;
}

export function ResultsPanel({ result, params }: ResultsPanelProps) {
  const firstComp = result.comparaveis[0];
  const mediana = firstComp?.mediana || 0;
  const piso = firstComp?.piso || 0;
  const teto = firstComp?.teto || 0;

  return (
    <Tabs defaultValue="resumo" className="w-full">
      <TabsList className="bg-muted/50">
        <TabsTrigger value="resumo">Resumo</TabsTrigger>
        <TabsTrigger value="comparaveis">Comparáveis</TabsTrigger>
        <TabsTrigger value="pam2">PAM²</TabsTrigger>
      </TabsList>

      <TabsContent value="resumo" className="space-y-4 mt-4">
        <PipelineSummary result={result} />
        <PriceRangeBar faixa={result.faixa} />
        <ConfidenceGauge confidence={result.confidence} params={params} />
      </TabsContent>

      <TabsContent value="comparaveis" className="mt-4">
        <ComparableTable
          comparaveis={result.comparaveis}
          scoreMinimo={params.SCORING_SCORE_MINIMO}
        />
      </TabsContent>

      <TabsContent value="pam2" className="mt-4">
        <Pam2Chart
          comparaveis={result.comparaveis}
          mediana={mediana}
          piso={piso}
          teto={teto}
          scoreMinimo={params.SCORING_SCORE_MINIMO}
        />
      </TabsContent>
    </Tabs>
  );
}
