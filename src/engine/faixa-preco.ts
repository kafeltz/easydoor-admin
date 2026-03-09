import type { Imovel, FaixaResult, PipelineParams } from "./types";

export function calcularFaixa(
  alvo: Imovel,
  comparaveis: Imovel[],
  params: PipelineParams
): FaixaResult {
  const areaEqAlvo = alvo.area_equivalente_m2;
  const SCORE_MINIMO = params.SCORING_SCORE_MINIMO;
  const ajusteLiquidez = params.FAIXA_AJUSTE_LIQUIDEZ;

  if (!areaEqAlvo) {
    return {
      minimo: null, medio: null, maximo: null, sugerido: null,
      pam2_minimo: null, pam2_medio: null, pam2_maximo: null,
      total_validos: 0, area_equivalente_alvo: null,
    };
  }

  const validos = comparaveis.filter(
    (c) => !c.outlier && (c.score || 0) >= SCORE_MINIMO && c.pam2 != null
  );

  if (validos.length === 0) {
    return {
      minimo: null, medio: null, maximo: null, sugerido: null,
      pam2_minimo: null, pam2_medio: null, pam2_maximo: null,
      total_validos: 0, area_equivalente_alvo: areaEqAlvo,
    };
  }

  const pam2s = validos.map((c) => c.pam2!);
  const scores = validos.map((c) => c.score || 0);

  const pam2Minimo = Math.min(...pam2s);
  const pam2Maximo = Math.max(...pam2s);

  const somaPesos = scores.reduce((s, v) => s + v, 0);
  const pam2Medio =
    Math.round(
      (pam2s.reduce((s, p, i) => s + p * scores[i], 0) / somaPesos) * 100
    ) / 100;

  const minimo = Math.round(pam2Minimo * areaEqAlvo * 100) / 100;
  const medio = Math.round(pam2Medio * areaEqAlvo * 100) / 100;
  const maximo = Math.round(pam2Maximo * areaEqAlvo * 100) / 100;
  const sugerido = Math.round(minimo * (1 - ajusteLiquidez) * 100) / 100;

  return {
    minimo,
    medio,
    maximo,
    sugerido,
    pam2_minimo: pam2Minimo,
    pam2_medio: pam2Medio,
    pam2_maximo: pam2Maximo,
    total_validos: validos.length,
    area_equivalente_alvo: areaEqAlvo,
  };
}
