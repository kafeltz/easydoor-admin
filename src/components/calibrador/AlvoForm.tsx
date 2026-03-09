import { useState } from "react";
import type { Imovel } from "@/types/calibrador";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const RAIO_OPTIONS = [300, 500, 1000, 2000] as const;

interface AlvoFormProps {
  onSubmit: (alvo: Imovel, raio: number, tipo: string) => void;
  carregando: boolean;
  mensagemSimulacao?: string | null;
}

function numOrNull(v: string): number | null {
  const n = Number(v);
  return v === "" || isNaN(n) ? null : n;
}

export function AlvoForm({ onSubmit, carregando, mensagemSimulacao }: AlvoFormProps) {
  const [cep, setCep] = useState("");
  const [cepErro, setCepErro] = useState<string | null>(null);
  const [cepCarregando, setCepCarregando] = useState(false);

  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [area, setArea] = useState("");
  const [tipo, setTipo] = useState<"apartamento" | "casa">("apartamento");
  const [raio, setRaio] = useState(500);

  // Opcionais
  const [areaExterna, setAreaExterna] = useState("");
  const [dormitorios, setDormitorios] = useState("");
  const [suites, setSuites] = useState("");
  const [banheiros, setBanheiros] = useState("");
  const [vagas, setVagas] = useState("");
  const [idadePredio, setIdadePredio] = useState("");
  const [andar, setAndar] = useState("");
  const [mobiliado, setMobiliado] = useState(false);
  const [arCondicionado, setArCondicionado] = useState(false);

  const buscarCep = async (valor: string) => {
    const cepLimpo = valor.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;
    setCepCarregando(true);
    setCepErro(null);
    try {
      const res = await fetch(`/api/v1/dados-regiao/${cepLimpo}`);
      if (!res.ok) throw new Error("CEP não encontrado");
      const data = await res.json();
      if (data.lat && data.lon) {
        setLat(String(data.lat));
        setLon(String(data.lon));
      } else {
        setCepErro("CEP encontrado, mas sem coordenadas.");
      }
    } catch {
      setCepErro("CEP não encontrado.");
    } finally {
      setCepCarregando(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, "").slice(0, 8);
    setCep(valor);
    setCepErro(null);
  };

  const handleCepBlur = () => buscarCep(cep);
  const handleCepKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      buscarCep(cep);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const latNum = Number(lat);
    const lonNum = Number(lon);
    const areaNum = Number(area);
    if (isNaN(latNum) || isNaN(lonNum) || isNaN(areaNum) || areaNum <= 0) return;

    const alvo: Imovel = {
      id: "alvo-form",
      preco: 0,
      area_m2: areaNum,
      area_externa_m2: numOrNull(areaExterna),
      dormitorios: numOrNull(dormitorios),
      suites: numOrNull(suites),
      banheiros: numOrNull(banheiros),
      vagas: numOrNull(vagas),
      idade_predio_anos: numOrNull(idadePredio),
      lat: latNum,
      lon: lonNum,
      cep: cep || null,
      fonte: "formulario",
      extras: {
        andar: numOrNull(andar),
        mobiliado,
        ar_condicionado: arCondicionado,
      },
    };

    onSubmit(alvo, raio, tipo);
  };

  const inputCls =
    "text-xs bg-background border border-border rounded px-2 py-1 text-foreground font-mono w-full";
  const labelCls = "text-[11px] text-muted-foreground";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 px-6 py-3 border-b border-border bg-muted/30"
    >
      {/* Linha principal: campos obrigatórios + botão */}
      <div className="flex items-end gap-3 flex-wrap">
        <div className="flex flex-col gap-0.5">
          <label className={labelCls}>CEP</label>
          <div className="relative">
            <input
              type="text"
              value={cep}
              onChange={handleCepChange}
              onBlur={handleCepBlur}
              onKeyDown={handleCepKeyDown}
              placeholder="00000000"
              className={`${inputCls} w-24`}
            />
            {cepCarregando && (
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                ...
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <label className={labelCls}>Latitude</label>
          <input
            type="text"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className={`${inputCls} w-28`}
            required
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <label className={labelCls}>Longitude</label>
          <input
            type="text"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            className={`${inputCls} w-28`}
            required
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <label className={labelCls}>Área (m²)</label>
          <input
            type="number"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className={`${inputCls} w-20`}
            min={1}
            required
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <label className={labelCls}>Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "apartamento" | "casa")}
            className={`${inputCls} w-32`}
          >
            <option value="apartamento">Apartamento</option>
            <option value="casa">Casa</option>
          </select>
        </div>
        <div className="flex flex-col gap-0.5">
          <label className={labelCls}>Raio (m)</label>
          <select
            value={raio}
            onChange={(e) => setRaio(Number(e.target.value))}
            className={`${inputCls} w-20`}
          >
            {RAIO_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}m
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="sm" disabled={carregando}>
          {carregando ? "Calculando..." : "Avaliar"}
        </Button>
      </div>

      {/* Campos opcionais colapsáveis */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="opcionais" className="border-0">
          <AccordionTrigger className="py-1 text-[11px] text-muted-foreground hover:no-underline">
            Campos opcionais do imóvel alvo
          </AccordionTrigger>
          <AccordionContent className="pb-1">
            <div className="flex items-end gap-3 flex-wrap">
              <div className="flex flex-col gap-0.5">
                <label className={labelCls}>Área ext. (m²)</label>
                <input
                  type="number"
                  value={areaExterna}
                  onChange={(e) => setAreaExterna(e.target.value)}
                  className={`${inputCls} w-20`}
                  min={0}
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <label className={labelCls}>Dormitórios</label>
                <input
                  type="number"
                  value={dormitorios}
                  onChange={(e) => setDormitorios(e.target.value)}
                  className={`${inputCls} w-16`}
                  min={0}
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <label className={labelCls}>Suítes</label>
                <input
                  type="number"
                  value={suites}
                  onChange={(e) => setSuites(e.target.value)}
                  className={`${inputCls} w-16`}
                  min={0}
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <label className={labelCls}>Banheiros</label>
                <input
                  type="number"
                  value={banheiros}
                  onChange={(e) => setBanheiros(e.target.value)}
                  className={`${inputCls} w-16`}
                  min={0}
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <label className={labelCls}>Vagas</label>
                <input
                  type="number"
                  value={vagas}
                  onChange={(e) => setVagas(e.target.value)}
                  className={`${inputCls} w-16`}
                  min={0}
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <label className={labelCls}>Idade prédio</label>
                <input
                  type="number"
                  value={idadePredio}
                  onChange={(e) => setIdadePredio(e.target.value)}
                  className={`${inputCls} w-16`}
                  min={0}
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <label className={labelCls}>Andar</label>
                <input
                  type="number"
                  value={andar}
                  onChange={(e) => setAndar(e.target.value)}
                  className={`${inputCls} w-16`}
                  min={0}
                />
              </div>
              <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={mobiliado}
                  onChange={(e) => setMobiliado(e.target.checked)}
                />
                Mobiliado
              </label>
              <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={arCondicionado}
                  onChange={(e) => setArCondicionado(e.target.checked)}
                />
                Ar-cond.
              </label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Feedback CEP */}
      {cepErro && <p className="text-xs text-destructive">{cepErro}</p>}

      {/* Feedback simulação */}
      {mensagemSimulacao && (
        <p className="text-xs text-amber-500">{mensagemSimulacao}</p>
      )}
    </form>
  );
}
