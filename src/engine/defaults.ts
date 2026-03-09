import type { ParameterMeta, PipelineParams } from "./types";

export const PARAMETERS: ParameterMeta[] = [
  // Homogeneização
  { key: "HOMOG_COEF_EXTERNO", label: "Coef. Externo", min: 0.10, max: 1.00, step: 0.05, defaultValue: 0.40, group: "Homogeneização", format: "decimal" },

  // Anti-Outlier
  { key: "OUTLIER_TOL_INFERIOR", label: "Tol. Inferior", min: 0.05, max: 0.50, step: 0.05, defaultValue: 0.20, group: "Anti-Outlier", format: "percent" },
  { key: "OUTLIER_TOL_SUPERIOR", label: "Tol. Superior", min: 0.05, max: 0.80, step: 0.05, defaultValue: 0.35, group: "Anti-Outlier", format: "percent" },

  // Scoring — Geral
  { key: "SCORING_RAIO_MAX", label: "Raio Máximo", min: 100, max: 2000, step: 50, defaultValue: 500, group: "Scoring Geral", format: "meters" },
  { key: "SCORING_SCORE_MINIMO", label: "Score Mínimo", min: 0, max: 100, step: 1, defaultValue: 65, group: "Scoring Geral", format: "integer" },

  // Scoring — Pesos Categorias
  { key: "SCORING_PESO_LOCALIZACAO", label: "Localização", min: 0, max: 1, step: 0.05, defaultValue: 0.30, group: "Pesos Categorias", weightGroup: "categorias", format: "percent" },
  { key: "SCORING_PESO_ESTRUTURA", label: "Estrutura", min: 0, max: 1, step: 0.05, defaultValue: 0.35, group: "Pesos Categorias", weightGroup: "categorias", format: "percent" },
  { key: "SCORING_PESO_ESTADO", label: "Estado", min: 0, max: 1, step: 0.05, defaultValue: 0.20, group: "Pesos Categorias", weightGroup: "categorias", format: "percent" },
  { key: "SCORING_PESO_DIFERENCIAIS", label: "Diferenciais", min: 0, max: 1, step: 0.05, defaultValue: 0.15, group: "Pesos Categorias", weightGroup: "categorias", format: "percent" },

  // Scoring — Sub-pesos Localização
  { key: "SCORING_LOC_DISTANCIA", label: "Distância", min: 0, max: 1, step: 0.05, defaultValue: 0.80, group: "Sub-pesos Localização", weightGroup: "localizacao", format: "percent" },
  { key: "SCORING_LOC_BAIRRO", label: "Bairro", min: 0, max: 1, step: 0.05, defaultValue: 0.20, group: "Sub-pesos Localização", weightGroup: "localizacao", format: "percent" },

  // Scoring — Sub-pesos Estrutura
  { key: "SCORING_ESTR_AREA", label: "Área", min: 0, max: 1, step: 0.05, defaultValue: 0.30, group: "Sub-pesos Estrutura", weightGroup: "estrutura", format: "percent" },
  { key: "SCORING_ESTR_DORMITORIOS", label: "Dormitórios", min: 0, max: 1, step: 0.05, defaultValue: 0.25, group: "Sub-pesos Estrutura", weightGroup: "estrutura", format: "percent" },
  { key: "SCORING_ESTR_VAGAS", label: "Vagas", min: 0, max: 1, step: 0.05, defaultValue: 0.15, group: "Sub-pesos Estrutura", weightGroup: "estrutura", format: "percent" },
  { key: "SCORING_ESTR_BANHEIROS", label: "Banheiros", min: 0, max: 1, step: 0.05, defaultValue: 0.10, group: "Sub-pesos Estrutura", weightGroup: "estrutura", format: "percent" },
  { key: "SCORING_ESTR_SUITES", label: "Suítes", min: 0, max: 1, step: 0.05, defaultValue: 0.10, group: "Sub-pesos Estrutura", weightGroup: "estrutura", format: "percent" },
  { key: "SCORING_ESTR_AREA_EXTERNA", label: "Área Externa", min: 0, max: 1, step: 0.05, defaultValue: 0.05, group: "Sub-pesos Estrutura", weightGroup: "estrutura", format: "percent" },
  { key: "SCORING_ESTR_ANDAR", label: "Andar", min: 0, max: 1, step: 0.05, defaultValue: 0.05, group: "Sub-pesos Estrutura", weightGroup: "estrutura", format: "percent" },

  // Scoring — Sub-pesos Diferenciais
  { key: "SCORING_DIF_CONDOMINIO", label: "Condomínio", min: 0, max: 1, step: 0.05, defaultValue: 0.30, group: "Sub-pesos Diferenciais", weightGroup: "diferenciais", format: "percent" },
  { key: "SCORING_DIF_MOBILIADO", label: "Mobiliado", min: 0, max: 1, step: 0.05, defaultValue: 0.30, group: "Sub-pesos Diferenciais", weightGroup: "diferenciais", format: "percent" },
  { key: "SCORING_DIF_IPTU", label: "IPTU", min: 0, max: 1, step: 0.05, defaultValue: 0.20, group: "Sub-pesos Diferenciais", weightGroup: "diferenciais", format: "percent" },
  { key: "SCORING_DIF_AR", label: "Ar Cond.", min: 0, max: 1, step: 0.05, defaultValue: 0.20, group: "Sub-pesos Diferenciais", weightGroup: "diferenciais", format: "percent" },

  // Scoring — Tolerâncias Discretas
  { key: "SCORING_TOL_DORMITORIOS", label: "Tol. Dormitórios", min: 1, max: 10, step: 1, defaultValue: 3, group: "Tolerâncias", format: "integer" },
  { key: "SCORING_TOL_SUITES", label: "Tol. Suítes", min: 1, max: 5, step: 1, defaultValue: 2, group: "Tolerâncias", format: "integer" },
  { key: "SCORING_TOL_BANHEIROS", label: "Tol. Banheiros", min: 1, max: 5, step: 1, defaultValue: 2, group: "Tolerâncias", format: "integer" },
  { key: "SCORING_TOL_VAGAS", label: "Tol. Vagas", min: 1, max: 5, step: 1, defaultValue: 2, group: "Tolerâncias", format: "integer" },
  { key: "SCORING_TOL_ANDAR", label: "Tol. Andar", min: 1, max: 10, step: 1, defaultValue: 2, group: "Tolerâncias", format: "integer" },

  // MAT
  { key: "MAT_VALOR_VAGAS", label: "Valor Vagas", min: 10000, max: 100000, step: 5000, defaultValue: 40000, group: "MAT", format: "currency" },
  { key: "MAT_VALOR_MOBILIADO", label: "Valor Mobiliado", min: 5000, max: 50000, step: 1000, defaultValue: 15000, group: "MAT", format: "currency" },
  { key: "MAT_VALOR_AR", label: "Valor Ar Cond.", min: 1000, max: 20000, step: 1000, defaultValue: 5000, group: "MAT", format: "currency" },
  { key: "MAT_VALOR_ANDAR", label: "Valor Andar", min: 1000, max: 15000, step: 500, defaultValue: 3000, group: "MAT", format: "currency" },
  { key: "MAT_VALOR_IDADE", label: "Valor Idade/ano", min: 500, max: 10000, step: 500, defaultValue: 2000, group: "MAT", format: "currency" },
  { key: "MAT_CAP_IDADE", label: "Cap Idade (anos)", min: 5, max: 50, step: 1, defaultValue: 20, group: "MAT", format: "integer" },

  // Faixa de Preço
  { key: "FAIXA_AJUSTE_LIQUIDEZ", label: "Ajuste Liquidez", min: 0, max: 0.10, step: 0.005, defaultValue: 0.02, group: "Faixa de Preço", format: "percent" },

  // Confidence Score
  { key: "CONFIDENCE_PESO_QUANTIDADE", label: "Peso Quantidade", min: 0, max: 1, step: 0.05, defaultValue: 0.30, group: "Confidence", weightGroup: "confidence", format: "percent" },
  { key: "CONFIDENCE_PESO_DISPERSAO", label: "Peso Dispersão", min: 0, max: 1, step: 0.05, defaultValue: 0.30, group: "Confidence", weightGroup: "confidence", format: "percent" },
  { key: "CONFIDENCE_PESO_QUALIDADE", label: "Peso Qualidade", min: 0, max: 1, step: 0.05, defaultValue: 0.15, group: "Confidence", weightGroup: "confidence", format: "percent" },
  { key: "CONFIDENCE_PESO_SIMILARIDADE", label: "Peso Similaridade", min: 0, max: 1, step: 0.05, defaultValue: 0.25, group: "Confidence", weightGroup: "confidence", format: "percent" },
  { key: "CONFIDENCE_CV_LIMIAR", label: "CV Limiar", min: 0.10, max: 1.00, step: 0.05, defaultValue: 0.30, group: "Confidence", format: "decimal" },
  { key: "CONFIDENCE_QTD_CAP", label: "Qtd. Cap", min: 3, max: 30, step: 1, defaultValue: 10, group: "Confidence", format: "integer" },
  { key: "CONFIDENCE_FAIXA_ALTA", label: "Faixa Alta", min: 60, max: 100, step: 5, defaultValue: 80, group: "Confidence", format: "integer" },
  { key: "CONFIDENCE_FAIXA_MODERADA", label: "Faixa Moderada", min: 40, max: 80, step: 5, defaultValue: 60, group: "Confidence", format: "integer" },
  { key: "CONFIDENCE_FAIXA_BAIXA", label: "Faixa Baixa", min: 20, max: 60, step: 5, defaultValue: 40, group: "Confidence", format: "integer" },
];

export function getDefaultParams(): PipelineParams {
  const params: PipelineParams = {};
  for (const p of PARAMETERS) {
    params[p.key] = p.defaultValue;
  }
  return params;
}

export const GROUPS = [...new Set(PARAMETERS.map((p) => p.group))];

export const WEIGHT_GROUPS: Record<string, string[]> = {};
for (const p of PARAMETERS) {
  if (p.weightGroup) {
    if (!WEIGHT_GROUPS[p.weightGroup]) WEIGHT_GROUPS[p.weightGroup] = [];
    WEIGHT_GROUPS[p.weightGroup].push(p.key);
  }
}
