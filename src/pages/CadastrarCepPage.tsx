import { useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const formatarCep = (valor: string): string => {
  const digitos = valor.replace(/\D/g, "").slice(0, 8);
  if (digitos.length <= 5) return digitos;
  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
};

const cepCompleto = (cep: string): boolean =>
  cep.replace(/\D/g, "").length === 8;

export function CadastrarCepPage() {
  const [cep, setCep] = useState("");
  const [cepsCadastrados, setCepsCadastrados] = useState<string[]>([]);

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCep(formatarCep(e.target.value));
  };

  const handleCadastrar = () => {
    if (!cepCompleto(cep)) return;

    const cepLimpo = cep.replace(/\D/g, "");
    if (cepsCadastrados.includes(cepLimpo)) {
      toast.error("CEP ja cadastrado");
      return;
    }

    setCepsCadastrados((prev) => [cepLimpo, ...prev]);
    setCep("");
    toast.success(`CEP ${cep} cadastrado com sucesso`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCadastrar();
    }
  };

  const handleRemover = (cepRemover: string) => {
    setCepsCadastrados((prev) => prev.filter((c) => c !== cepRemover));
    const formatado = `${cepRemover.slice(0, 5)}-${cepRemover.slice(5)}`;
    toast.info(`CEP ${formatado} removido`);
  };

  const formatarCepExibicao = (cepLimpo: string) =>
    `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cadastrar CEP</h1>
        <p className="text-muted-foreground mt-1">
          Adicione CEPs para monitoramento de imoveis na regiao
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Novo CEP</CardTitle>
          <CardDescription>
            Digite o CEP da regiao que deseja monitorar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                value={cep}
                onChange={handleCepChange}
                onKeyDown={handleKeyDown}
                placeholder="Ex: 88015-200"
                className="pl-11 h-12 text-base"
                maxLength={9}
              />
            </div>
            <Button
              onClick={handleCadastrar}
              disabled={!cepCompleto(cep)}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium h-12 px-6"
            >
              <Plus className="w-4 h-4 mr-1" />
              Cadastrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {cepsCadastrados.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              CEPs cadastrados ({cepsCadastrados.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cepsCadastrados.map((c) => (
                <div
                  key={c}
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/50 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span className="font-mono text-sm font-medium">
                      {formatarCepExibicao(c)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemover(c)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
