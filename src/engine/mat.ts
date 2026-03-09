import type { Imovel, MatDetalhe, PipelineParams } from "./types";

interface AjusteConfig {
  tipo: "discreto" | "booleano";
  campo: string;
  fonte: "schema" | "extras";
  valor_unitario?: number;
  valor?: number;
  cap?: number;
}

function buildTabela(params: PipelineParams): Record<string, AjusteConfig> {
  return {
    vagas: {
      tipo: "discreto",
      valor_unitario: params.MAT_VALOR_VAGAS,
      campo: "vagas",
      fonte: "schema",
    },
    mobiliado: {
      tipo: "booleano",
      valor: params.MAT_VALOR_MOBILIADO,
      campo: "mobiliado",
      fonte: "extras",
    },
    ar_condicionado: {
      tipo: "booleano",
      valor: params.MAT_VALOR_AR,
      campo: "ar_condicionado",
      fonte: "extras",
    },
    andar: {
      tipo: "discreto",
      valor_unitario: params.MAT_VALOR_ANDAR,
      campo: "andar",
      fonte: "extras",
    },
    idade_predio: {
      tipo: "discreto",
      valor_unitario: params.MAT_VALOR_IDADE,
      campo: "idade_predio_anos",
      fonte: "schema",
      cap: params.MAT_CAP_IDADE,
    },
  };
}

function getValor(imovel: Imovel, campo: string, fonte: string): any {
  if (fonte === "extras") {
    const extras = imovel.extras;
    if (extras && typeof extras === "object") return extras[campo] ?? null;
    return null;
  }
  return (imovel as any)[campo] ?? null;
}

export function calcularAjustes(
  alvo: Imovel,
  comp: Imovel,
  params: PipelineParams
): { ajuste_total: number; detalhes: MatDetalhe[] } {
  const tabela = buildTabela(params);
  const detalhes: MatDetalhe[] = [];
  let ajusteTotal = 0;

  for (const [nome, cfg] of Object.entries(tabela)) {
    const valAlvo = getValor(alvo, cfg.campo, cfg.fonte);
    const valComp = getValor(comp, cfg.campo, cfg.fonte);

    if (valAlvo == null || valComp == null) continue;

    let ajuste = 0;

    if (cfg.tipo === "discreto") {
      let diff = Number(valComp) - Number(valAlvo);
      if (cfg.cap != null) {
        diff = Math.max(-cfg.cap, Math.min(cfg.cap, diff));
      }
      ajuste = -(diff * cfg.valor_unitario!);
    } else if (cfg.tipo === "booleano") {
      if (valComp && !valAlvo) {
        ajuste = -cfg.valor!;
      } else if (!valComp && valAlvo) {
        ajuste = cfg.valor!;
      }
    }

    if (ajuste !== 0) {
      detalhes.push({
        nome,
        campo: cfg.campo,
        valor_alvo: valAlvo,
        valor_comp: valComp,
        ajuste_rs: ajuste,
      });
      ajusteTotal += ajuste;
    }
  }

  return { ajuste_total: ajusteTotal, detalhes };
}

export function aplicarMat(alvo: Imovel, comp: Imovel, params: PipelineParams): Imovel {
  const resultado = calcularAjustes(alvo, comp, params);
  const preco = comp.preco || 0;
  const precoAjustado = preco + resultado.ajuste_total;
  const areaEq = comp.area_equivalente_m2 || 0;

  const pam2Novo =
    areaEq > 0 && precoAjustado > 0
      ? Math.round((precoAjustado / areaEq) * 100) / 100
      : null;

  return {
    ...comp,
    preco_ajustado: precoAjustado,
    pam2_original: comp.pam2,
    pam2: pam2Novo,
    mat_ajuste_total: resultado.ajuste_total,
    mat_detalhes: resultado.detalhes,
  };
}

export function aplicarMatLista(alvo: Imovel, comps: Imovel[], params: PipelineParams): Imovel[] {
  return comps.map((c) => aplicarMat(alvo, c, params));
}
