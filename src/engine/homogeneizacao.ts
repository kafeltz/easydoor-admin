import type { Imovel, PipelineParams } from "./types";

export function homogeneizar(imovel: Imovel, params: PipelineParams): Imovel {
  const area = imovel.area_m2 || 0;
  const areaExterna = imovel.area_externa_m2 || 0;
  const coef = params.HOMOG_COEF_EXTERNO;

  // area_eq = area - area_externa * (1 - coef)
  const areaEquivalente = area - areaExterna * (1 - coef);
  const preco = imovel.preco || 0;
  const pam2 = areaEquivalente > 0 ? Math.round((preco / areaEquivalente) * 100) / 100 : null;

  return {
    ...imovel,
    area_equivalente_m2: Math.round(areaEquivalente * 100) / 100,
    pam2,
  };
}

export function homogeneizarLista(imoveis: Imovel[], params: PipelineParams): Imovel[] {
  return imoveis.map((im) => homogeneizar(im, params));
}
