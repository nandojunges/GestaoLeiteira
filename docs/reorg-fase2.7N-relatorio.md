# Relatório Fase 2.7-N

## Endpoints

### POST /api/v1/auth/send-code
- Payload:
```json
{ "email": "user@example.com" }
```
- Resposta:
```json
{ "ok": true, "sent": true }
```

### POST /api/v1/auth/forgot-password
- Payload:
```json
{ "email": "user@example.com" }
```
- Resposta:
```json
{ "ok": true }
```

### POST /api/v1/auth/reset-password
- Payload:
```json
{ "token": "<token>", "newPassword": "novaSenha" }
```
- Resposta:
```json
{ "ok": true }
```

## Considerações
- `send-code` e `forgot-password` aplicam rate limit básico (5 requisições/60s por IP).
- Tokens de reset são mantidos em memória por 30 minutos.
- E-mails utilizam `emailService.sendTemplate`.
