import { useState } from "react";
import type { Imovel } from "@/engine/types";
import type { BuscaComparaveisParams } from "@/api/calibrador";
import { ALVO } from "@/data/mock-properties";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const RAIO_OPTIONS = [300, 500, 1000, 2000] as const;

interface AlvoFormProps {
  onSubmit: (alvo: Imovel, busca: BuscaComparaveisParams) => void;
  carregando: boolean;
  mensagemComparaveis?: string | null;
}

function numOrNull(v: string): number | null {
  const n = Number(v);
  return v === "" || isNaN(n) ? null : n;
}

export function AlvoForm({ onSubmit, carregando, mensagemComparaveis }: AlvoFormProps) {
  // Obrigatórios — preenchidos com defaults do ALVO mock
  const [lat, setLat] = useState(String(ALVO.lat));
  const [lon, setLon] = useState(String(ALVO.lon));
  const [area, setArea] = useState(String(ALVO.area_m2));
  const [tipo, setTipo] = useState<"apartamento" | "casa">("apartamento");
  const [raio, setRaio] = useState(500);

  // Opcionais
  const [areaExterna, setAreaExterna] = useState(String(ALVO.area_externa_m2 ?? ""));
  const [dormitorios, setDormitorios] = useState(String(ALVO.dormitorios ?? ""));
  const [suites, setSuites] = useState(String(ALVO.suites ?? ""));
  const [banheiros, setBanheiros] = useState(String(ALVO.banheiros ?? ""));
  const [vagas, setVagas] = useState(String(ALVO.vagas ?? ""));
  const [idadePredio, setIdadePredio] = useState(String(ALVO.idade_predio_anos ?? ""));
  const [andar, setAndar] = useState(String(ALVO.extras?.andar ?? ""));
  const [mobiliado, setMobiliado] = useState(ALVO.extras?.mobiliado ?? false);
  const [arCondicionado, setArCondicionado] = useState(ALVO.extras?.ar_condicionado ?? false);

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
      fonte: "formulario",
      extras: {
        andar: numOrNull(andar),
        mobiliado,
        ar_condicionado: arCondicionado,
      },
    };

    onSubmit(alvo, { lat: latNum, lon: lonNum, raio, tipo });
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
          {carregando ? "Buscando..." : "Avaliar"}
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

      {/* Mensagem de feedback */}
      {mensagemComparaveis && (
        <p className="text-xs text-amber-500">{mensagemComparaveis}</p>
      )}
    </form>
  );
}
