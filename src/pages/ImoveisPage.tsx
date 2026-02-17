import { useCallback, useEffect, useState } from "react";
import { Building2, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatarPreco, formatarDistancia, formatarCep } from "@/lib/formatters";

interface Cep {
  id: number;
  cep: string;
  status: string;
  total_anuncios: number;
}

interface DadosRegiao {
  coordenadas: { lat: number; lon: number };
  totalAnuncios: number;
  faixaPreco: {
    min: number;
    max: number;
    valorMedio: number;
    precoMedioM2: number;
  };
}

interface Comparavel {
  id: string;
  preco: number;
  area_interna_m2: number | null;
  dormitorios: number | null;
  bairro: string | null;
  url: string | null;
  fonte: string | null;
  distancia_metros: number;
}

export function ImoveisPage() {
  const [ceps, setCeps] = useState<Cep[]>([]);
  const [cepSelecionado, setCepSelecionado] = useState("");
  const [carregandoCeps, setCarregandoCeps] = useState(true);
  const [carregandoImoveis, setCarregandoImoveis] = useState(false);
  const [dadosRegiao, setDadosRegiao] = useState<DadosRegiao | null>(null);
  const [comparaveis, setComparaveis] = useState<Comparavel[]>([]);

  useEffect(() => {
    fetch("/api/v1/ceps")
      .then((res) => res.json())
      .then((data: Cep[]) => {
        const concluidos = data.filter((c) => c.status === "concluido");
        setCeps(concluidos);
        if (concluidos.length > 0) {
          setCepSelecionado(concluidos[0].cep);
        }
      })
      .catch(() => toast.error("Erro ao carregar CEPs"))
      .finally(() => setCarregandoCeps(false));
  }, []);

  const buscarImoveis = useCallback(async (cep: string) => {
    if (!cep) return;
    setCarregandoImoveis(true);
    setDadosRegiao(null);
    setComparaveis([]);

    try {
      const resRegiao = await fetch(`/api/v1/dados-regiao/${cep}`);
      if (!resRegiao.ok) throw new Error("Erro ao buscar dados da regiao");
      const dados: DadosRegiao = await resRegiao.json();
      setDadosRegiao(dados);

      const resComp = await fetch(
        `/api/v1/comparaveis?lat=${dados.coordenadas.lat}&lon=${dados.coordenadas.lon}&raio=500`
      );
      if (!resComp.ok) throw new Error("Erro ao buscar comparaveis");
      const comps: Comparavel[] = await resComp.json();
      setComparaveis(comps);
    } catch {
      toast.error("Erro ao carregar imoveis da regiao");
    } finally {
      setCarregandoImoveis(false);
    }
  }, []);

  useEffect(() => {
    if (cepSelecionado) {
      buscarImoveis(cepSelecionado);
    }
  }, [cepSelecionado, buscarImoveis]);

  if (carregandoCeps) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (ceps.length === 0) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Imoveis</h1>
          <p className="text-muted-foreground mt-1">
            Anuncios encontrados por CEP
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Building2 className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhum CEP concluido</p>
            <p className="text-sm mt-1">
              Cadastre CEPs e aguarde o processamento
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Imoveis</h1>
          <p className="text-muted-foreground mt-1">
            Anuncios encontrados por CEP
          </p>
        </div>
        <select
          value={cepSelecionado}
          onChange={(e) => setCepSelecionado(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {ceps.map((c) => (
            <option key={c.id} value={c.cep}>
              {formatarCep(c.cep)} — {c.total_anuncios} anuncio(s)
            </option>
          ))}
        </select>
      </div>

      {carregandoImoveis ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {dadosRegiao && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total anuncios</p>
                  <p className="text-2xl font-bold">{dadosRegiao.totalAnuncios}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Preco medio</p>
                  <p className="text-2xl font-bold">
                    {formatarPreco(dadosRegiao.faixaPreco.valorMedio)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">PAM²/m²</p>
                  <p className="text-2xl font-bold">
                    {formatarPreco(dadosRegiao.faixaPreco.precoMedioM2)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Faixa</p>
                  <p className="text-2xl font-bold">
                    {formatarPreco(dadosRegiao.faixaPreco.min)}
                    <span className="text-sm text-muted-foreground font-normal"> — </span>
                    {formatarPreco(dadosRegiao.faixaPreco.max)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {comparaveis.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Building2 className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhum imovel encontrado</p>
                <p className="text-sm mt-1">
                  Nao ha anuncios num raio de 500m deste CEP
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Anuncios ({comparaveis.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Preco</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Quartos</TableHead>
                      <TableHead>Bairro</TableHead>
                      <TableHead>Fonte</TableHead>
                      <TableHead className="text-right">Distancia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparaveis.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">
                          {formatarPreco(c.preco)}
                        </TableCell>
                        <TableCell>
                          {c.area_interna_m2 ? `${c.area_interna_m2} m²` : "—"}
                        </TableCell>
                        <TableCell>{c.dormitorios ?? "—"}</TableCell>
                        <TableCell>{c.bairro ?? "—"}</TableCell>
                        <TableCell>
                          {c.url ? (
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted">
                                {c.fonte ?? "Link"}
                                <ExternalLink className="w-3 h-3" />
                              </Badge>
                            </a>
                          ) : (
                            <Badge variant="outline">{c.fonte ?? "—"}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatarDistancia(c.distancia_metros)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
