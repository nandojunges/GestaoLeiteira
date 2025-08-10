# Reorg Fase 2.4 – Relatório

## Smoke test guiado
Tentativa de execução dos passos solicitados falhou por ausência de dependências.

```bash
$ node backend/server.js
Error: Cannot find module 'dotenv'
```

Sem o servidor rodando não foi possível realizar as requisições `curl` para criação de animal, IA, diagnóstico, promoção manual e parto.

## Integração front Pré-Parto
- Botão "Promover Pré-Parto (D-21)" adicionado em **Ajustes**.
- Recurso restrito a administradores e desabilita durante o processamento.
- Chama `POST /api/v1/maintenance/promote-preparto` e exibe resultado via toast.

## Limpeza final
- Removido diretório `src/sqlite/` e referências legadas.
- `rg` confirmou ausência de arquivos em `src/_quarantine`, `assets/icones` e `src/firebase.js`.

## Build
```bash
$ npm run build
sh: 1: vite: not found
```
A tentativa de `npm install` retornou 403 para `http-proxy-middleware`, impedindo a geração do build.
