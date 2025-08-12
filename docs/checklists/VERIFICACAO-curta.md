# Verificação curta (mão na massa)
1) API viva: GET /api/v1/health e /api/v1/health/db (porta 3001).
2) Cadastro/Login:
   - POST /auth/register -> send-code -> verify -> login.
3) Animais:
   - POST /animais (criar) -> GET /animais?estado=vazia -> PUT -> DELETE.
4) Reprodução:
   - POST /reproducao/{id}/inseminacoes
   - POST /reproducao/{id}/diagnosticos (positivo)
   - GET /animais?estado=gestante
   - (opcional) POST /maintenance/promote-preparto -> GET preparto
5) Front (quando build destravar):
   - Listas por estado mostram DEL/previsões vindas do backend (sem cálculo no front).
