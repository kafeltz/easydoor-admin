import { apiFetch } from "./client";
import type { SimularRequest, SimularResponse } from "@/types/calibrador";

export interface PremissaResumo {
  versao: number;
  descricao: string | null;
  ativa: boolean;
  criado_em: string;
}

export interface PremissaCompleta {
  versao: number;
  parametros: Record<string, number>;
  descricao: string | null;
  ativa: boolean;
  criado_em: string;
}

async function apiFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const res = await apiFetch(path, {
    ...init,
    headers: { ...headers, ...init?.headers },
  });
  if (!res.ok) {
    throw new Error(`API ${path}: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  simular: (req: SimularRequest) =>
    apiFetchJson<SimularResponse>("/api/v1/avaliar/simular", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  premissas: {
    listar: () =>
      apiFetchJson<PremissaResumo[]>("/api/v1/premissas"),

    ativa: () =>
      apiFetchJson<PremissaCompleta>("/api/v1/premissas/ativa"),

    obter: (versao: number) =>
      apiFetchJson<PremissaCompleta>(`/api/v1/premissas/${versao}`),

    criar: (parametros: Record<string, number>, descricao?: string | null) =>
      apiFetchJson<PremissaCompleta>("/api/v1/premissas", {
        method: "POST",
        body: JSON.stringify({ parametros, descricao: descricao ?? null }),
      }),

    ativar: (versao: number) =>
      apiFetchJson<PremissaCompleta>(`/api/v1/premissas/${versao}/ativar`, {
        method: "POST",
      }),
  },
};
