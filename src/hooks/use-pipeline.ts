import { useState, useMemo, useCallback, useEffect } from "react";
import type { PipelineParams, PipelineResult, Imovel } from "@/engine/types";
import { getDefaultParams, PARAMETERS, WEIGHT_GROUPS } from "@/engine/defaults";
import { runPipeline } from "@/engine/pipeline";
import { ALVO, COMPARAVEIS } from "@/data/mock-properties";
import { api } from "@/api/calibrador";
import type { BuscaComparaveisParams, PremissaResumo } from "@/api/calibrador";

// Calibrador usa UPPERCASE, backend usa lowercase — conversão direta
function paramsParaBackend(params: PipelineParams): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(params)) {
    out[key.toLowerCase()] = value as number;
  }
  return out;
}

function backendParaParams(parametros: Record<string, number>): PipelineParams {
  const out: PipelineParams = {};
  for (const p of PARAMETERS) {
    const backendKey = p.key.toLowerCase();
    out[p.key] = backendKey in parametros ? parametros[backendKey] : p.defaultValue;
  }
  return out;
}

function calcularPesosValidos(params: PipelineParams): boolean {
  const EPS = 0.01;
  for (const keys of Object.values(WEIGHT_GROUPS)) {
    const soma = keys.reduce((acc, k) => acc + (params[k] ?? 0), 0);
    if (Math.abs(soma - 1.0) > EPS) return false;
  }
  return true;
}

export function usePipeline() {
  const [params, setParams] = useState<PipelineParams>(getDefaultParams);
  const [premissas, setPremissas] = useState<PremissaResumo[]>([]);
  const [versaoAtiva, setVersaoAtiva] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [alvo, setAlvo] = useState<Imovel>(ALVO);
  const [comparaveis, setComparaveis] = useState<Imovel[]>(COMPARAVEIS);
  const [carregandoComparaveis, setCarregandoComparaveis] = useState(false);
  const [mensagemComparaveis, setMensagemComparaveis] = useState<string | null>(null);

  // Carrega premissas do backend ao montar; cai em defaults se backend offline
  useEffect(() => {
    async function carregar() {
      try {
        const [lista, ativa] = await Promise.all([
          api.premissas.listar(),
          api.premissas.ativa(),
        ]);
        setPremissas(lista);
        setVersaoAtiva(ativa.versao);
        setParams(backendParaParams(ativa.parametros));
      } catch {
        console.warn("[calibrador] Backend indisponível — usando defaults locais.");
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  // Busca comparáveis reais via lat/lon/raio/tipo
  const buscarComparaveis = useCallback(
    async (novoAlvo: Imovel, busca: BuscaComparaveisParams) => {
      setAlvo(novoAlvo);
      setCarregandoComparaveis(true);
      setMensagemComparaveis(null);
      try {
        const resultado = await api.comparaveis.buscar(busca);
        if (resultado.length > 0) {
          setComparaveis(resultado);
          setMensagemComparaveis(null);
        } else {
          setComparaveis(COMPARAVEIS);
          setMensagemComparaveis(
            `Nenhum comparável encontrado no raio de ${busca.raio ?? 500}m. Tente aumentar o raio. Exibindo dados mock.`
          );
        }
      } catch {
        console.warn("[calibrador] Erro ao buscar comparáveis — usando mock.");
        setComparaveis(COMPARAVEIS);
        setMensagemComparaveis("Backend indisponível — exibindo dados mock.");
      } finally {
        setCarregandoComparaveis(false);
      }
    },
    []
  );

  const updateParam = useCallback((key: string, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetParams = useCallback(() => {
    setParams(getDefaultParams());
    setVersaoAtiva(null);
  }, []);

  // Salva os params atuais como nova versão imutável no backend
  const salvarPremissa = useCallback(
    async (descricao?: string | null) => {
      const nova = await api.premissas.criar(paramsParaBackend(params), descricao);
      setPremissas((prev) => [nova, ...prev]);
      return nova;
    },
    [params]
  );

  // Ativa uma versão e carrega seus params nos sliders
  const ativarPremissa = useCallback(async (versao: number) => {
    const ativada = await api.premissas.ativar(versao);
    setPremissas((prev) => prev.map((p) => ({ ...p, ativa: p.versao === versao })));
    setVersaoAtiva(ativada.versao);
    setParams(backendParaParams(ativada.parametros));
    return ativada;
  }, []);

  // Carrega os params de uma versão nos sliders sem ativá-la no banco
  const carregarPremissa = useCallback(async (versao: number) => {
    const prm = await api.premissas.obter(versao);
    setVersaoAtiva(prm.versao);
    setParams(backendParaParams(prm.parametros));
    return prm;
  }, []);

  const pesosValidos = useMemo(() => calcularPesosValidos(params), [params]);

  const result: PipelineResult = useMemo(
    () => runPipeline(alvo, comparaveis, params),
    [alvo, comparaveis, params]
  );

  return {
    params,
    updateParam,
    resetParams,
    result,
    premissas,
    versaoAtiva,
    carregando,
    salvarPremissa,
    ativarPremissa,
    carregarPremissa,
    pesosValidos,
    buscarComparaveis,
    carregandoComparaveis,
    mensagemComparaveis,
  };
}
