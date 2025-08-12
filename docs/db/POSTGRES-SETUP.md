# PostgreSQL — Setup
1) Crie/edite o arquivo `.env` na raiz com seus dados (NÃO commite):
   DB_NAME=gestao_leiteira
   DB_USER=postgres
   DB_PASS=...
   DB_HOST=localhost
   DB_PORT=5432
   PORT=3001
   EMAIL_REMETENTE=...
   SENHA_REMETENTE=...
   EMAIL_SERVICE=Zoho
   MAIL_FROM="Gestão Leiteira <...>"
   JWT_SECRET=...

2) Inicie apenas o backend:
   cd backend
   npm i
   npm run db:init
   npm start  (ou npm run dev)

3) Health:
   GET http://localhost:3001/api/v1/health/db  -> { ok:true, db:'up' }
