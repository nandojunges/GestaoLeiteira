# Relatório Fase 2.5

## Proxy
- Removido `src/setupProxy.js`.
- Dependência `http-proxy-middleware` retirada do `package.json`.

## Healthcheck
```bash
curl http://localhost:3001/api/v1/health
{"ok":true,"ts":1754867067371}
```

## Build
- `npm i` e `npm run build` falharam (`vite: not found`).
