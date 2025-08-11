# Relatório Fase 2.6-N

## Logger
- Middleware simples que gera `requestId` (`Date.now()` + random).
- Loga método, URL, status e duração em ms.
- Corpos de requisição só são exibidos fora de produção.

## Validações
- Utilitário `requireFields` garante presença de campos.
- `isEmail` e `isDate` fazem checagens básicas.
- Aplicado nos controllers de autenticação, animais e reprodução em operações `POST/PATCH`.

## Rate limit
- Limite em memória: 5 requisições/60s por IP+rota.
- Aplicado em `/api/v1/auth/send-code` e `/api/v1/auth/login`.
- Excede limite: responde `429` `{ ok:false, message:"Too many requests", code:429 }`.

## Exemplos
- Falta de campos obrigatórios:
```json
{ "ok": false, "message": "Campos obrigatórios ausentes", "missing": ["email"] }
```
- Rate limit excedido:
```json
{ "ok": false, "message": "Too many requests", "code": 429 }
```

## Testes (node:test)
- Adicionado script `"test": "node --test"` no package.json.
- Criados:
  - `tests/health.test.js` (verifica `/api/v1/health`).
  - `tests/rate-limit.test.js` (envia rajada a `/api/v1/auth/send-code`; tolerante a ambiente).
> Para rodar: iniciar `backend/server.js` (porta 3000) e depois `npm test`.
