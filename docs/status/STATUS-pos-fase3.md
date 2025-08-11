# STATUS — Pós-Fase 3 (Consolidação)

## Concluído
- Reorganização de pastas (frontend por domínio e componentes compartilhados)
- Consolidação "EscolherPlano*" → Unified
- Quarentena e remoções seguras (pendências resolvidas nas Fases 2.3/2.4/3)
- Backend unificado (services + controllers + rotas v1)
- Estados de Animal + derivados (DEL, previsões) e filtros ?estado=
- Reprodução integrada (IA, diagnóstico, parto, secagem)
- Endpoint de manutenção: promote-preparto (D-21)
- Healthcheck /api/v1/health
- Logger, validação básica e rate-limit em auth
- Testes node:test com skip quando API offline

## Pendentes declarados (deixar para o fim)
- FullCalendar (@fullcalendar/bootstrap5) — 403 do registry (Plano A: npmjs pinado; Plano B: remover plugin bootstrap5 temporariamente)
- Build Vite aguardando `npm i` estável (scripts já preparados)
- Testes de UI quando o build destravar

## Próximas frentes sugeridas
- Fase 2.6N/2.7N/2.8N: já iniciadas (auth resend/forgot/reset; front preparado p/ estados/histórico)
- Go/No-Go checklist e roteiro de QA manual (abaixo)
