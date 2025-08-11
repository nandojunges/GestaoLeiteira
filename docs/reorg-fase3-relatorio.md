# Reorganização - Fase 3

## Itens removidos
- `src/dev/Lembrete.jsx` (sem referências restantes)

## Imports e rotas atualizados
- `src/usuario/auth/LoginInfoRotativo.jsx`: recursos agora em `/api/data/rotativos/...` e imagens em `/api/...`
- `src/pages/Animais/ConteudoRelatorio.jsx`: restauração do plantel via `/api/vacas_plantel_corrigido.json`

## Regras de contribuição
- Veja `docs/policy-codigo.md` e `docs/pr-checklist.md` para políticas e checklist.

## Pendências finais
- Erro 403 ao baixar `@fullcalendar/bootstrap5` durante o build.
- Verificar estabilidade do build final.
