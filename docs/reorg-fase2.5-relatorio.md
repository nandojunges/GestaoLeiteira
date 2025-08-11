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
- `npm i` falhou (403 Forbidden ao buscar pacote `invariant`).
- `npm run build` não executou devido à falha na instalação.

## Saneamento de dependências (Fase 2.5.2)

Comandos executados:

```bash
rm -f package-lock.json
npm cache clean --force
npm i # falha 403
npm i --legacy-peer-deps # falha 403
npm run build # vite: not found
```

Resultado final: falha na instalação (403) e build não executado.

## Fase 2.5.3 – Anti-403 + Node pinado
- Node: `v20.19.4`
- `./scripts/install.sh`: falhou (403 ao baixar `@fullcalendar/bootstrap5`, mesmo com mirror)
- `npm run build`: falha (`vite: not found`)
