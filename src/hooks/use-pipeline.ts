import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import type { PipelineParams, PipelineResult, Imovel } from "@/types/calibrador";
import { getDefaultParams, PARAMETERS, WEIGHT_GROUPS } from "@/config/parametros";
import { api } from "@/api/calibrador";
import type { PremissaResumo } from "@/api/calibrador";

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
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [carregandoSimulacao, setCarregandoSimulacao] = useState(false);
  const [mensagemSimulacao, setMensagemSimulacao] = useState<string | null>(null);

  // Refs para evitar closures desatualizadas nos debounces
  const alvoRef = useRef<{ alvo: Imovel; raio: number; tipo: string } | null>(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

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

  const executarSimulacao = useCallback(
    async (alvo: Imovel, raio: number, tipo: string, currentParams: PipelineParams) => {
      setCarregandoSimulacao(true);
      setMensagemSimulacao(null);
      try {
        const res = await api.simular({
          lat: alvo.lat!,
          lon: alvo.lon!,
          area_m2: alvo.area_m2,
          area_externa_m2: alvo.area_externa_m2,
          dormitorios: alvo.dormitorios,
          suites: alvo.suites,
          banheiros: alvo.banheiros,
          vagas: alvo.vagas,
          idade_predio_anos: alvo.idade_predio_anos,
          andar: alvo.extras?.andar as number | undefined,
          mobiliado: alvo.extras?.mobiliado as boolean | undefined,
          ar_condicionado: alvo.extras?.ar_condicionado as boolean | undefined,
          tipo,
          raio,
          parametros: paramsParaBackend(currentParams),
        });
        const scoreMinimo = currentParams.SCORING_SCORE_MINIMO ?? 65;
        setResult({
          alvo: res.alvo,
          comparaveis: res.comparaveis,
          faixa: res.faixa,
          confidence: res.confidence,
          validos: res.comparaveis.filter(
            (c) => !c.outlier && (c.score ?? 0) >= scoreMinimo
          ),
          outliers: res.comparaveis.filter((c) => c.outlier),
          filtradosPorScore: res.comparaveis.filter(
            (c) => !c.outlier && (c.score ?? 0) < scoreMinimo
          ),
        });
      } catch (e) {
        setMensagemSimulacao(`Erro na simulação: ${e}`);
      } finally {
        setCarregandoSimulacao(false);
      }
    },
    []
  );

  // Re-simula com debounce quando params mudam (só se já houver alvo)
  useEffect(() => {
    if (!alvoRef.current) return;
    const { alvo, raio, tipo } = alvoRef.current;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      executarSimulacao(alvo, raio, tipo, paramsRef.current);
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [params, executarSimulacao]);

  // Chamado pelo AlvoForm ao submeter
  const buscarComparaveis = useCallback(
    async (alvo: Imovel, raio: number, tipo: string) => {
      alvoRef.current = { alvo, raio, tipo };
      clearTimeout(debounceRef.current);
      await executarSimulacao(alvo, raio, tipo, paramsRef.current);
    },
    [executarSimulacao]
  );

  const updateParam = useCallback((key: string, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetParams = useCallback(() => {
    setParams(getDefaultParams());
    setVersaoAtiva(null);
  }, []);

  const salvarPremissa = useCallback(
    async (descricao?: string | null) => {
      const nova = await api.premissas.criar(paramsParaBackend(paramsRef.current), descricao);
      setPremissas((prev) => [nova, ...prev]);
      return nova;
    },
    []
  );

  const ativarPremissa = useCallback(async (versao: number) => {
    const ativada = await api.premissas.ativar(versao);
    setPremissas((prev) => prev.map((p) => ({ ...p, ativa: p.versao === versao })));
    setVersaoAtiva(ativada.versao);
    setParams(backendParaParams(ativada.parametros));
    return ativada;
  }, []);

  const carregarPremissa = useCallback(async (versao: number) => {
    const prm = await api.premissas.obter(versao);
    setVersaoAtiva(prm.versao);
    setParams(backendParaParams(prm.parametros));
    return prm;
  }, []);

  const pesosValidos = useMemo(() => calcularPesosValidos(params), [params]);

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
    carregandoSimulacao,
    mensagemSimulacao,
  };
}
