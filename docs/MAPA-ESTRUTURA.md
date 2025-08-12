# Mapa de Estrutura (visão simples)

## Backend (Bunked)
- backend/
  - server.js, routes/, controllers/, services/, sql/, scripts/
  - Lê .env (DB_*, EMAIL_*, PORT, JWT_SECRET)
  - Porta padrão: 3001
  - Rotas v1: /api/v1/* (animais, reproducao, saude, auth, maintenance, health)

## Frontend
- src/, public/, vite.config.js, index.html
- Páginas por domínio: Animais, Reprodução, Saúde, Leite, Ajustes, Auth (login/cadastro)
- Acessa o backend em /api (proxy do Vite)

## Outros
- docs/: relatórios, OpenAPI, cURLs, checklists
- tests/: testes node:test (pulam se API offline)
- scripts/: utilidades
