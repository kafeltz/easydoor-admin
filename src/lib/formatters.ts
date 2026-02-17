const precoBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatarPreco(valor: number): string {
  return precoBRL.format(valor);
}

export function formatarDistancia(metros: number): string {
  if (metros >= 1000) {
    return `${(metros / 1000).toFixed(1).replace(".", ",")} km`;
  }
  return `${Math.round(metros)} m`;
}

export function formatarCep(cep: string): string {
  const limpo = cep.replace(/\D/g, "");
  if (limpo.length !== 8) return cep;
  return `${limpo.slice(0, 5)}-${limpo.slice(5)}`;
}

export function formatarData(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
