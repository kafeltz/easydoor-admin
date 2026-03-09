import type { Imovel, PipelineParams, PipelineResult } from "./types";
import { homogeneizar, homogeneizarLista } from "./homogeneizacao";
import { aplicarMatLista } from "./mat";
import { filtrarOutliers } from "./anti-outlier";
import { pontuarLista } from "./scoring";
import { calcularFaixa } from "./faixa-preco";
import { calcularConfidence } from "./confidence-score";

export function runPipeline(
  alvoRaw: Imovel,
  comparaveisRaw: Imovel[],
  params: PipelineParams
): PipelineResult {
  // 1. Homogeneização
  const alvo = homogeneizar(alvoRaw, params);
  const compsH = homogeneizarLista(comparaveisRaw, params);

  // 2. MAT
  const compsMat = aplicarMatLista(alvo, compsH, params);

  // 3. Anti-Outlier
  const compsFiltrados = filtrarOutliers(compsMat, params);

  // 4. Scoring
  const compsPontuados = pontuarLista(alvo, compsFiltrados, params);

  // 5. Faixa de Preço
  const faixa = calcularFaixa(alvo, compsPontuados, params);

  // Filtrar válidos (mesmo critério da faixa)
  const SCORE_MINIMO = params.SCORING_SCORE_MINIMO;
  const validos = compsPontuados.filter(
    (c) => !c.outlier && (c.score || 0) >= SCORE_MINIMO && c.pam2 != null
  );
  const outliers = compsPontuados.filter((c) => c.outlier);
  const filtradosPorScore = compsPontuados.filter(
    (c) => !c.outlier && (c.score || 0) < SCORE_MINIMO && c.pam2 != null
  );

  // 6. Confidence Score
  const confidence = calcularConfidence(validos, params);

  return {
    alvo,
    comparaveis: compsPontuados,
    faixa,
    confidence,
    validos,
    outliers,
    filtradosPorScore,
  };
}
