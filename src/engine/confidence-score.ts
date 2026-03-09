import type { Imovel, ConfidenceResult, PipelineParams } from "./types";

const CAMPOS_QUALIDADE = [
  "preco", "area_m2", "area_externa_m2", "dormitorios", "suites",
  "banheiros", "vagas", "idade_predio_anos", "lat", "lon",
];

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function stdev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

function scoreQuantidade(n: number, cap: number): number {
  if (n <= 0) return 0;
  if (n >= cap) return 1;
  return n / cap;
}

function scoreDispersao(pam2s: number[], cvLimiar: number): number {
  if (pam2s.length < 2) return 0.5;
  const m = mean(pam2s);
  if (m === 0) return 0.5;
  const cv = stdev(pam2s) / m;
  return Math.round(Math.max(0, 1 - cv / cvLimiar) * 10000) / 10000;
}

function scoreQualidade(comparaveis: Imovel[]): number {
  if (comparaveis.length === 0) return 0;
  const totalCampos = CAMPOS_QUALIDADE.length;
  const completudes = comparaveis.map((comp) => {
    let preenchidos = 0;
    for (const campo of CAMPOS_QUALIDADE) {
      if ((comp as any)[campo] != null) preenchidos++;
    }
    return preenchidos / totalCampos;
  });
  return Math.round(mean(completudes) * 10000) / 10000;
}

function scoreSimilaridade(comparaveis: Imovel[], scoreMinimo: number): number {
  if (comparaveis.length === 0) return 0;
  const scores = comparaveis
    .filter((c) => c.score != null)
    .map((c) => c.score!);
  if (scores.length === 0) return 0;
  const media = mean(scores);
  const faixa = 100 - scoreMinimo;
  if (faixa <= 0) return 1;
  return Math.round(Math.max(0, Math.min(1, (media - scoreMinimo) / faixa)) * 10000) / 10000;
}

export function calcularConfidence(
  comparaveisValidos: Imovel[],
  params: PipelineParams
): ConfidenceResult {
  const n = comparaveisValidos.length;

  if (n === 0) {
    return {
      confidence: 0,
      sub_scores: { quantidade: 0, dispersao: 0, qualidade: 0, similaridade: 0 },
      total_validos: 0,
      diagnostico: "Confiança muito baixa — resultado pouco confiável",
    };
  }

  const pam2s = comparaveisValidos
    .filter((c) => c.pam2 != null)
    .map((c) => c.pam2!);

  const quant = scoreQuantidade(n, params.CONFIDENCE_QTD_CAP);
  const disp = scoreDispersao(pam2s, params.CONFIDENCE_CV_LIMIAR);
  const qual = scoreQualidade(comparaveisValidos);
  const sim = scoreSimilaridade(comparaveisValidos, params.SCORING_SCORE_MINIMO);

  const raw =
    (quant * params.CONFIDENCE_PESO_QUANTIDADE +
      disp * params.CONFIDENCE_PESO_DISPERSAO +
      qual * params.CONFIDENCE_PESO_QUALIDADE +
      sim * params.CONFIDENCE_PESO_SIMILARIDADE) * 100;

  const confidence = Math.round(Math.max(0, Math.min(100, raw)) * 10) / 10;

  let diagnostico: string;
  if (confidence >= params.CONFIDENCE_FAIXA_ALTA) {
    diagnostico = "Alta confiança";
  } else if (confidence >= params.CONFIDENCE_FAIXA_MODERADA) {
    diagnostico = "Confiança moderada";
  } else if (confidence >= params.CONFIDENCE_FAIXA_BAIXA) {
    diagnostico = "Confiança baixa — poucos dados ou alta dispersão";
  } else {
    diagnostico = "Confiança muito baixa — resultado pouco confiável";
  }

  return {
    confidence,
    sub_scores: {
      quantidade: Math.round(quant * 1000) / 10,
      dispersao: Math.round(disp * 1000) / 10,
      qualidade: Math.round(qual * 1000) / 10,
      similaridade: Math.round(sim * 1000) / 10,
    },
    total_validos: n,
    diagnostico,
  };
}
