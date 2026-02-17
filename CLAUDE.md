# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos

```bash
npm run dev      # Dev server na porta 5175
npm run build    # Build de produção (vite build)
npm run preview  # Preview do build de produção
```

Não há linter, formatter ou testes configurados no projeto.

## Arquitetura

Dashboard administrativo **EasyDoor** — React 18 + TypeScript + Vite 5.

### Stack

- **UI**: Tailwind CSS 3 com tema dark por padrão, componentes próprios baseados em Radix UI primitives
- **Variantes de componentes**: Class Variance Authority (CVA)
- **Utilitário de classes**: `cn()` em `src/lib/utils.ts` (clsx + tailwind-merge)
- **Roteamento**: React Router DOM 7 (routes definidas em `src/App.tsx`)
- **Notificações**: Sonner (toasts)
- **Ícones**: Lucide React

### Estrutura

- `src/pages/` — Páginas da aplicação
- `src/components/ui/` — Componentes reutilizáveis (Button, Card, Input, Badge, Tooltip)
- `src/components/layout/` — AppLayout (wrapper com Header + Outlet) e Header (navegação)

### Rotas

| Path | Página |
|------|--------|
| `/` | Redireciona para `/ceps` |
| `/ceps` | CadastrarCepPage |
| `/imoveis` | ImoveisPage |

### API

- Chamadas diretas com `fetch` para `/api/v1/*`
- Vite proxy: `/api` → `http://localhost:8000` (backend Python/FastAPI)
- Polling com `setInterval` de 5s para atualização de status
- Sem biblioteca de data fetching (React Query, SWR, etc.)

### Convenções

- Path alias: `@/` → `./src/`
- Componentes UI usam `forwardRef` e aceitam `className` via props
- Estado local com `useState`/`useRef` — sem state management global
- Nomes de variáveis e textos da UI em português
