import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  MapPin,
  Building2,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
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
import { formatarPreco, formatarCep, formatarData } from "@/lib/formatters";

interface Cep {
  id: number;
  cep: string;
  status: "pendente" | "processando" | "concluido" | "erro";
  erro_msg: string | null;
  tentativas: number;
  total_anuncios: number;
  criado_em: string;
  atualizado_em: string;
}

interface Avaliacao {
  id: number;
  cep: string;
  endereco: string | null;
  cidade: string | null;
  uf: string | null;
  area_interna_m2: number;
  dormitorios: number | null;
  minimo: number | null;
  medio: number | null;
  maximo: number | null;
  sugerido: number | null;
  confidence_score: number | null;
  pam2_medio: number | null;
  comparaveis_usados: number | null;
  criado_em: string;
}

function ConfiancaBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-muted-foreground">—</span>;

  if (score >= 70) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        {score}%
      </Badge>
    );
  }
  if (score >= 40) {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        {score}%
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
      {score}%
    </Badge>
  );
}

function StatusBadge({ status }: { status: Cep["status"] }) {
  switch (status) {
    case "pendente":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>;
    case "processando":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Processando
        </Badge>
      );
    case "concluido":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Concluido</Badge>;
    case "erro":
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Erro</Badge>;
  }
}

function MetricCard({
  titulo,
  valor,
  icon: Icon,
}: {
  titulo: string;
  valor: string | number;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{titulo}</p>
            <p className="text-2xl font-bold mt-1">{valor}</p>
          </div>
          <Icon className="w-8 h-8 text-muted-foreground/50" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const [ceps, setCeps] = useState<Cep[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const buscarDados = useCallback(async () => {
    try {
      const [resCeps, resAval] = await Promise.all([
        fetch("/api/v1/ceps"),
        fetch("/api/v1/avaliacoes"),
      ]);

      if (resCeps.ok) setCeps(await resCeps.json());
      if (resAval.ok) setAvaliacoes(await resAval.json());
    } catch {
      toast.error("Erro de conexao com o servidor");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    buscarDados();
    intervalRef.current = setInterval(buscarDados, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [buscarDados]);

  if (carregando) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const cepsConcluidos = ceps.filter((c) => c.status === "concluido").length;
  const totalAnuncios = ceps.reduce((s, c) => s + c.total_anuncios, 0);

  const avaliacoesComConfianca = avaliacoes.filter((a) => a.confidence_score !== null);
  const confiancaMedia =
    avaliacoesComConfianca.length > 0
      ? Math.round(
          avaliacoesComConfianca.reduce((s, a) => s + a.confidence_score!, 0) /
            avaliacoesComConfianca.length
        )
      : null;

  const avaliacoesComSugerido = avaliacoes.filter((a) => a.sugerido !== null);
  const precoMedioSugerido =
    avaliacoesComSugerido.length > 0
      ? avaliacoesComSugerido.reduce((s, a) => s + a.sugerido!, 0) /
        avaliacoesComSugerido.length
      : null;

  const avaliacoesComPam2 = avaliacoes.filter((a) => a.pam2_medio !== null);
  const pam2Medio =
    avaliacoesComPam2.length > 0
      ? avaliacoesComPam2.reduce((s, a) => s + a.pam2_medio!, 0) /
        avaliacoesComPam2.length
      : null;

  const ultimasAvaliacoes = [...avaliacoes]
    .sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())
    .slice(0, 5);

  const cepsOrdenados = [...ceps].sort((a, b) => {
    const prioridade: Record<string, number> = { erro: 0, processando: 1, pendente: 2, concluido: 3 };
    return (prioridade[a.status] ?? 4) - (prioridade[b.status] ?? 4);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visao geral do EasyDoor</p>
      </div>

      {/* Metricas principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard titulo="CEPs cadastrados" valor={ceps.length} icon={MapPin} />
        <MetricCard titulo="CEPs concluidos" valor={cepsConcluidos} icon={MapPin} />
        <MetricCard titulo="Total de anuncios" valor={totalAnuncios} icon={Building2} />
        <MetricCard titulo="Avaliacoes realizadas" valor={avaliacoes.length} icon={ClipboardList} />
      </div>

      {/* Metricas secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confianca media</p>
                <div className="mt-1">
                  {confiancaMedia !== null ? (
                    <ConfiancaBadge score={confiancaMedia} />
                  ) : (
                    <span className="text-2xl font-bold text-muted-foreground">—</span>
                  )}
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Preco medio sugerido</p>
                <p className="text-2xl font-bold mt-1">
                  {precoMedioSugerido !== null
                    ? formatarPreco(Math.round(precoMedioSugerido))
                    : "—"}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">PAM²/m² medio</p>
                <p className="text-2xl font-bold mt-1">
                  {pam2Medio !== null
                    ? formatarPreco(Math.round(pam2Medio))
                    : "—"}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Duas colunas: ultimas avaliacoes + status dos CEPs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ultimas avaliacoes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Ultimas avaliacoes</CardTitle>
            <Link
              to="/avaliacoes"
              className="text-sm text-accent hover:underline"
            >
              Ver todas
            </Link>
          </CardHeader>
          <CardContent>
            {ultimasAvaliacoes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhuma avaliacao ainda
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>CEP</TableHead>
                    <TableHead>Sugerido</TableHead>
                    <TableHead>Confianca</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ultimasAvaliacoes.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatarData(a.criado_em)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatarCep(a.cep)}
                      </TableCell>
                      <TableCell className="font-bold text-accent text-sm">
                        {a.sugerido !== null ? formatarPreco(a.sugerido) : "—"}
                      </TableCell>
                      <TableCell>
                        <ConfiancaBadge score={a.confidence_score} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Status dos CEPs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Status dos CEPs</CardTitle>
            <Link
              to="/ceps"
              className="text-sm text-accent hover:underline"
            >
              Gerenciar
            </Link>
          </CardHeader>
          <CardContent>
            {cepsOrdenados.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhum CEP cadastrado
              </p>
            ) : (
              <div className="space-y-2">
                {cepsOrdenados.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-accent" />
                      <span className="font-mono text-sm font-medium">
                        {formatarCep(c.cep)}
                      </span>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
