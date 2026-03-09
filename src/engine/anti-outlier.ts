import type { Imovel, PipelineParams } from "./types";

function mediana(valores: number[]): number {
  if (valores.length === 0) return 0;
  const sorted = [...valores].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

export function filtrarOutliers(imoveis: Imovel[], params: PipelineParams): Imovel[] {
  const tolInf = params.OUTLIER_TOL_INFERIOR;
  const tolSup = params.OUTLIER_TOL_SUPERIOR;

  const pam2s = imoveis
    .map((im) => im.pam2)
    .filter((v): v is number => v != null);

  if (pam2s.length === 0) {
    return imoveis.map((im) => ({
      ...im,
      outlier: false,
      mediana: 0,
      piso: 0,
      teto: 0,
    }));
  }

  const med = mediana(pam2s);
  const piso = Math.round(med * (1 - tolInf) * 100) / 100;
  const teto = Math.round(med * (1 + tolSup) * 100) / 100;

  return imoveis.map((im) => {
    const isOutlier = im.pam2 != null ? im.pam2 < piso || im.pam2 > teto : false;
    return {
      ...im,
      outlier: isOutlier,
      mediana: med,
      piso,
      teto,
    };
  });
}
