import type { Imovel, PipelineParams } from "./types";

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const rlat1 = toRad(lat1);
  const rlat2 = toRad(lat2);
  const dlat = toRad(lat2 - lat1);
  const dlon = toRad(lon2 - lon1);
  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(dlon / 2) ** 2;
  return Math.round(R * 2 * Math.asin(Math.sqrt(a)) * 100) / 100;
}

function obterExtra(imovel: Imovel, campo: string): any {
  const extras = imovel.extras;
  if (extras && typeof extras === "object") return extras[campo] ?? null;
  return null;
}

function normalizarContinua(valAlvo: number, valComp: number): number {
  const diff = Math.abs(valAlvo - valComp);
  const denom = Math.max(valAlvo, 1);
  return Math.round((1 - Math.min(diff / denom, 1.0)) * 10000) / 10000;
}

function normalizarDiscreta(valAlvo: number, valComp: number, tolerancia: number): number {
  const diff = Math.abs(valAlvo - valComp);
  return Math.round(Math.max(0, 1 - diff / tolerancia) * 10000) / 10000;
}

function normalizarBooleana(valAlvo: any, valComp: any): number | null {
  if (valAlvo == null || valComp == null) return null;
  return valAlvo == valComp ? 1.0 : 0.0;
}

function calcularCategoria(
  variaveis: Record<string, number | null>,
  pesos: Record<string, number>
): [number | null, Record<string, number>] {
  const disponiveis: Record<string, number> = {};
  for (const [k, v] of Object.entries(variaveis)) {
    if (v != null) disponiveis[k] = v;
  }
  if (Object.keys(disponiveis).length === 0) return [null, {}];

  const somaPesos = Object.keys(disponiveis).reduce((s, k) => s + (pesos[k] || 0), 0);
  if (somaPesos === 0) return [null, {}];

  let score = 0;
  for (const [k, v] of Object.entries(disponiveis)) {
    score += v * ((pesos[k] || 0) / somaPesos);
  }
  return [Math.round(score * 10000) / 10000, disponiveis];
}

function scoreLocalizacao(
  alvo: Imovel,
  comp: Imovel,
  params: PipelineParams
): [number | null, Record<string, number>] {
  const variaveis: Record<string, number | null> = {};
  const RAIO_MAX = params.SCORING_RAIO_MAX;

  if (alvo.lat != null && alvo.lon != null && comp.lat != null && comp.lon != null) {
    const dist = haversine(
      Number(alvo.lat), Number(alvo.lon),
      Number(comp.lat), Number(comp.lon)
    );
    variaveis["distancia"] = Math.round((1 - Math.min(dist / RAIO_MAX, 1.0)) * 10000) / 10000;
  } else {
    variaveis["distancia"] = null;
  }

  const ba = alvo.bairro;
  const bc = comp.bairro;
  if (ba && bc) {
    variaveis["bairro"] = ba.toLowerCase() === bc.toLowerCase() ? 1.0 : 0.0;
  } else {
    variaveis["bairro"] = null;
  }

  const pesos = {
    distancia: params.SCORING_LOC_DISTANCIA,
    bairro: params.SCORING_LOC_BAIRRO,
  };
  return calcularCategoria(variaveis, pesos);
}

function scoreEstrutura(
  alvo: Imovel,
  comp: Imovel,
  params: PipelineParams
): [number | null, Record<string, number>] {
  const variaveis: Record<string, number | null> = {};

  for (const campo of ["area_m2", "area_externa_m2"] as const) {
    const va = (alvo as any)[campo];
    const vc = (comp as any)[campo];
    variaveis[campo] = va != null && vc != null ? normalizarContinua(va, vc) : null;
  }

  const discretas: Record<string, string> = {
    dormitorios: "SCORING_TOL_DORMITORIOS",
    suites: "SCORING_TOL_SUITES",
    banheiros: "SCORING_TOL_BANHEIROS",
    vagas: "SCORING_TOL_VAGAS",
  };
  for (const [campo, tolKey] of Object.entries(discretas)) {
    const va = (alvo as any)[campo];
    const vc = (comp as any)[campo];
    variaveis[campo] = va != null && vc != null ? normalizarDiscreta(va, vc, params[tolKey]) : null;
  }

  const andarAlvo = obterExtra(alvo, "andar");
  const andarComp = obterExtra(comp, "andar");
  variaveis["andar"] =
    andarAlvo != null && andarComp != null
      ? normalizarDiscreta(Number(andarAlvo), Number(andarComp), params.SCORING_TOL_ANDAR)
      : null;

  const pesos: Record<string, number> = {
    area_m2: params.SCORING_ESTR_AREA,
    dormitorios: params.SCORING_ESTR_DORMITORIOS,
    vagas: params.SCORING_ESTR_VAGAS,
    banheiros: params.SCORING_ESTR_BANHEIROS,
    suites: params.SCORING_ESTR_SUITES,
    area_externa_m2: params.SCORING_ESTR_AREA_EXTERNA,
    andar: params.SCORING_ESTR_ANDAR,
  };
  return calcularCategoria(variaveis, pesos);
}

function scoreEstado(
  alvo: Imovel,
  comp: Imovel,
  _params: PipelineParams
): [number | null, Record<string, number>] {
  const variaveis: Record<string, number | null> = {};
  const va = alvo.idade_predio_anos;
  const vc = comp.idade_predio_anos;
  variaveis["idade_predio_anos"] = va != null && vc != null ? normalizarContinua(va, vc) : null;

  // Estado has only one weight (1.0) so no need for params
  const pesos = { idade_predio_anos: 1.0 };
  return calcularCategoria(variaveis, pesos);
}

function scoreDiferenciais(
  alvo: Imovel,
  comp: Imovel,
  params: PipelineParams
): [number | null, Record<string, number>] {
  const variaveis: Record<string, number | null> = {};

  for (const campo of ["condominio", "iptu"]) {
    const va = obterExtra(alvo, campo);
    const vc = obterExtra(comp, campo);
    variaveis[campo] = va != null && vc != null ? normalizarContinua(Number(va), Number(vc)) : null;
  }

  for (const campo of ["mobiliado", "ar_condicionado"]) {
    const va = obterExtra(alvo, campo);
    const vc = obterExtra(comp, campo);
    variaveis[campo] = normalizarBooleana(va, vc);
  }

  const pesos: Record<string, number> = {
    condominio: params.SCORING_DIF_CONDOMINIO,
    mobiliado: params.SCORING_DIF_MOBILIADO,
    iptu: params.SCORING_DIF_IPTU,
    ar_condicionado: params.SCORING_DIF_AR,
  };
  return calcularCategoria(variaveis, pesos);
}

export function calcularScore(
  alvo: Imovel,
  comparavel: Imovel,
  params: PipelineParams
): { score: number; sub_scores: Record<string, number | null>; detalhes: Record<string, Record<string, number>> } {
  const categorias: Record<string, [number | null, Record<string, number>]> = {
    localizacao: scoreLocalizacao(alvo, comparavel, params),
    estrutura: scoreEstrutura(alvo, comparavel, params),
    estado: scoreEstado(alvo, comparavel, params),
    diferenciais: scoreDiferenciais(alvo, comparavel, params),
  };

  const PESOS_CATEGORIAS: Record<string, number> = {
    localizacao: params.SCORING_PESO_LOCALIZACAO,
    estrutura: params.SCORING_PESO_ESTRUTURA,
    estado: params.SCORING_PESO_ESTADO,
    diferenciais: params.SCORING_PESO_DIFERENCIAIS,
  };

  const subScores: Record<string, number | null> = {};
  const detalhes: Record<string, Record<string, number>> = {};

  for (const [cat, [scoreCat, detCat]] of Object.entries(categorias)) {
    subScores[cat] = scoreCat != null ? Math.round(scoreCat * 100 * 100) / 100 : null;
    detalhes[cat] = detCat;
  }

  const catsDisponiveis: Record<string, number> = {};
  for (const [cat, peso] of Object.entries(PESOS_CATEGORIAS)) {
    if (subScores[cat] != null) catsDisponiveis[cat] = peso;
  }

  if (Object.keys(catsDisponiveis).length === 0) {
    return { score: 0, sub_scores: subScores, detalhes };
  }

  const somaPesos = Object.values(catsDisponiveis).reduce((s, v) => s + v, 0);
  let scoreFinal = 0;
  for (const [cat, peso] of Object.entries(catsDisponiveis)) {
    scoreFinal += (subScores[cat]! / 100) * (peso / somaPesos);
  }

  return {
    score: Math.round(scoreFinal * 100 * 100) / 100,
    sub_scores: subScores,
    detalhes,
  };
}

export function pontuarLista(alvo: Imovel, comps: Imovel[], params: PipelineParams): Imovel[] {
  const resultado = comps.map((comp) => {
    const scoring = calcularScore(alvo, comp, params);
    return { ...comp, ...scoring };
  });
  resultado.sort((a, b) => (b.score || 0) - (a.score || 0));
  return resultado;
}
