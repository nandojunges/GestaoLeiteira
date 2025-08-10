# Reorg Fase 2.3 – Relatório

## Promoção Pré-Parto
- Lógica automática em `animalsService.shouldPromoteToPreParto`.
- Endpoint utilitário `POST /api/v1/maintenance/promote-preparto`.
- Flags `.env`:
  - `ENABLE_PREPARTO_JOB`: ativa job diário com `node-cron`.
  - `PREPARTO_WINDOW_DAYS`: janela em dias (padrão 21).
- Exemplo de resposta:
```json
{ "ok": true, "processed": 2, "ids": [1, 5] }
```

## Consolidação EscolherPlano
- Novo componente `EscolherPlanoUnified` com `mode` (`inicio`, `cadastro`, `usuario`).
- Wrappers antigos encaminham para o componente unificado.
- Rotas atualizadas:
  - `/escolher-plano` → `mode="inicio"`
  - `/escolher-plano-finalizar` → `mode="cadastro"`

## Limpeza parcial
- Removidos arquivos confirmados em `src/_quarantine` sem referências:
  - `firebase.js`, `AnimalContext.jsx`, `SaudeAnimais.jsx`,
    `GraficoDescarteIdade.jsx`, `ResumoLactacoes.jsx`, `icones/informacoes.png`.
- Varredura com `rg` confirmou ausência de imports externos antes da exclusão.

## Colapso EscolherPlano
- Arquivos removidos:
  - `src/usuario/auth/EscolherPlano.jsx`
  - `src/usuario/auth/EscolherPlanoCadastro.jsx`
  - `src/usuario/auth/EscolherPlanoUsuario.jsx`
  - `src/usuario/auth/EscolherPlanoInicio.jsx`
- Rotas/locais atualizados para `EscolherPlanoUnified`:
  - `/escolher-plano` → `mode="inicio"`
  - `/escolher-plano-finalizar` → `mode="cadastro"`
- Build: tentativa de `npm install` falhou (`react-input-mask@^3.0.0` ausente), portanto `npm run build` não pôde ser executado.

## Checklist – Próximo passo (Fase 2.4)
- [ ] Ativar cron via `ENABLE_PREPARTO_JOB=true` (opcional).
- [ ] Iniciar testes ponta a ponta no front.
- [ ] Preparar remoções definitivas de gráficos/relatórios não usados.
