export interface Imovel {
  id: string;
  preco: number;
  area_m2: number;
  area_externa_m2?: number | null;
  dormitorios?: number | null;
  suites?: number | null;
  banheiros?: number | null;
  vagas?: number | null;
  idade_predio_anos?: number | null;
  cep?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  lat?: number | null;
  lon?: number | null;
  url?: string | null;
  fonte?: string | null;
  extras?: Record<string, any> | null;

  // Campos calculados (homogeneização)
  area_equivalente_m2?: number;
  pam2?: number | null;

  // Campos calculados (MAT)
  preco_ajustado?: number;
  pam2_original?: number | null;
  mat_ajuste_total?: number;
  mat_detalhes?: MatDetalhe[];

  // Campos calculados (anti-outlier)
  outlier?: boolean;
  mediana?: number;
  piso?: number;
  teto?: number;

  // Campos calculados (scoring)
  score?: number;
  sub_scores?: Record<string, number | null>;
  detalhes?: Record<string, Record<string, number>>;
}

export interface MatDetalhe {
  nome: string;
  campo: string;
  valor_alvo: any;
  valor_comp: any;
  ajuste_rs: number;
}

export interface FaixaResult {
  minimo: number | null;
  medio: number | null;
  maximo: number | null;
  sugerido: number | null;
  pam2_minimo: number | null;
  pam2_medio: number | null;
  pam2_maximo: number | null;
  total_validos: number;
  area_equivalente_alvo: number | null;
}

export interface ConfidenceResult {
  confidence: number;
  sub_scores: {
    quantidade: number;
    dispersao: number;
    qualidade: number;
    similaridade: number;
  };
  total_validos: number;
  diagnostico: string;
}

export interface PipelineResult {
  alvo: Imovel;
  comparaveis: Imovel[];
  faixa: FaixaResult;
  confidence: ConfidenceResult;
  validos: Imovel[];
  outliers: Imovel[];
  filtradosPorScore: Imovel[];
}

export interface ParameterMeta {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  group: string;
  weightGroup?: string;
  format?: "percent" | "currency" | "integer" | "decimal" | "meters";
}

export type PipelineParams = Record<string, number>;
