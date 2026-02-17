import { useEffect, useState } from "react";
import { ClipboardList, Loader2 } from "lucide-react";
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

export function AvaliacoesPage() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch("/api/v1/avaliacoes")
      .then((res) => res.json())
      .then((data: Avaliacao[]) => setAvaliacoes(data))
      .catch(() => toast.error("Erro ao carregar avaliacoes"))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Avaliacoes</h1>
        <p className="text-muted-foreground mt-1">
          Historico de avaliacoes realizadas pelo pipeline
        </p>
      </div>

      {avaliacoes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ClipboardList className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhuma avaliacao encontrada</p>
            <p className="text-sm mt-1">
              As avaliacoes aparecerao aqui apos serem processadas
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Avaliacoes ({avaliacoes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>CEP</TableHead>
                  <TableHead>Endereco</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Sugerido</TableHead>
                  <TableHead>Faixa</TableHead>
                  <TableHead>PAM²/m²</TableHead>
                  <TableHead>Confianca</TableHead>
                  <TableHead className="text-right">Comparaveis</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {avaliacoes.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatarData(a.criado_em)}
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatarCep(a.cep)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {a.endereco ?? "—"}
                    </TableCell>
                    <TableCell>{a.area_interna_m2} m²</TableCell>
                    <TableCell className="font-bold text-accent">
                      {a.sugerido !== null ? formatarPreco(a.sugerido) : "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {a.minimo !== null && a.maximo !== null
                        ? `${formatarPreco(a.minimo)} — ${formatarPreco(a.maximo)}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {a.pam2_medio !== null
                        ? formatarPreco(Math.round(a.pam2_medio))
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <ConfiancaBadge score={a.confidence_score} />
                    </TableCell>
                    <TableCell className="text-right">
                      {a.comparaveis_usados ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
