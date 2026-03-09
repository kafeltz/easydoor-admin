import { useState, useRef } from "react";
import { usePipeline } from "@/hooks/use-pipeline";
import { CalibradorLayout } from "@/components/calibrador/layout/CalibradorLayout";
import { ParameterSidebar } from "@/components/calibrador/sidebar/ParameterSidebar";
import { ResultsPanel } from "@/components/calibrador/visualization/ResultsPanel";
import { ExportPanel } from "@/components/calibrador/export/ExportPanel";
import { AlvoForm } from "@/components/calibrador/AlvoForm";
import { generateEnvText } from "@/engine/export-env";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, Copy, Check, ChevronDown } from "lucide-react";

export function CalibradorPage() {
  const {
    params,
    updateParam,
    resetParams,
    result,
    premissas,
    versaoAtiva,
    carregando,
    salvarPremissa,
    ativarPremissa,
    carregarPremissa,
    pesosValidos,
    buscarComparaveis,
    carregandoComparaveis,
    mensagemComparaveis,
  } = usePipeline();

  const [salvarModal, setSalvarModal] = useState(false);
  const [descricaoInput, setDescricaoInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [versaoMenuOpen, setVersaoMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const text = generateEnvText(params);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSalvar = () => {
    setDescricaoInput("");
    setSalvarModal(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const confirmarSalvar = async () => {
    setSalvarModal(false);
    try {
      const nova = await salvarPremissa(descricaoInput || null);
      alert(`Versão v${nova.versao} salva com sucesso!`);
    } catch (e) {
      alert(`Erro ao salvar: ${e}`);
    }
  };

  const handleAtivar = async (versao: number) => {
    try {
      await ativarPremissa(versao);
    } catch (e) {
      alert(`Erro ao ativar: ${e}`);
    }
  };

  const handleCarregar = async (versao: number) => {
    setVersaoMenuOpen(false);
    try {
      await carregarPremissa(versao);
    } catch (e) {
      alert(`Erro ao carregar versão: ${e}`);
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Carregando premissas...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Barra de ações do calibrador */}
      <div className="flex items-center gap-2 px-6 py-2 border-b border-border bg-muted/30">
        <span className="text-xs text-muted-foreground mr-auto">
          {versaoAtiva != null ? `Premissa ativa: v${versaoAtiva}` : "Sem premissa ativa (defaults)"}
        </span>

        {/* Menu de versões */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVersaoMenuOpen(!versaoMenuOpen)}
            disabled={premissas.length === 0}
          >
            Versões
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
          {versaoMenuOpen && premissas.length > 0 && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setVersaoMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-64 bg-card border border-border rounded-lg shadow-elevated overflow-hidden">
                <div className="max-h-48 overflow-y-auto">
                  {premissas.map((p) => (
                    <div
                      key={p.versao}
                      className="flex items-center justify-between px-3 py-2 hover:bg-muted/50 text-xs"
                    >
                      <button
                        className="flex-1 text-left"
                        onClick={() => handleCarregar(p.versao)}
                      >
                        <span className="font-mono font-medium">v{p.versao}</span>
                        {p.descricao && (
                          <span className="ml-2 text-muted-foreground">{p.descricao}</span>
                        )}
                        {p.ativa && (
                          <span className="ml-2 text-accent text-[10px]">(ativa)</span>
                        )}
                      </button>
                      {!p.ativa && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 px-1.5 text-[10px]"
                          onClick={() => handleAtivar(p.versao)}
                        >
                          Ativar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={resetParams}>
          <RotateCcw className="w-3 h-3 mr-1" />
          Resetar
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport}>
          {copied ? (
            <>
              <Check className="w-3 h-3 mr-1 text-accent" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" />
              Export .env
            </>
          )}
        </Button>
        <Button size="sm" onClick={handleSalvar} disabled={!pesosValidos}>
          <Save className="w-3 h-3 mr-1" />
          Salvar
        </Button>
      </div>

      {/* Formulário do imóvel alvo + busca de comparáveis */}
      <AlvoForm
        onSubmit={buscarComparaveis}
        carregando={carregandoComparaveis}
        mensagemComparaveis={mensagemComparaveis}
      />

      <CalibradorLayout
        sidebar={
          <ParameterSidebar params={params} onParamChange={updateParam} />
        }
        main={
          <ResultsPanel result={result} params={params} />
        }
        footer={
          <ExportPanel params={params} />
        }
      />

      {/* Modal inline para salvar versão */}
      {salvarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-lg p-6 w-96 space-y-4 shadow-elevated">
            <h2 className="text-sm font-semibold text-foreground">Salvar nova versão</h2>
            <input
              ref={inputRef}
              type="text"
              value={descricaoInput}
              onChange={(e) => setDescricaoInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmarSalvar();
                if (e.key === "Escape") setSalvarModal(false);
              }}
              placeholder="Descrição (opcional)"
              className="w-full text-sm bg-background border border-border rounded px-3 py-2 text-foreground"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSalvarModal(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={confirmarSalvar}>
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
