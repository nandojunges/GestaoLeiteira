# Reorg Fase 2 – Relatório

## Serviços iniciais
- Criado `backend/services/dbAdapter.js` para padronizar acesso ao banco.
- Criado `backend/services/animalsService.js` com operações básicas.
- Stubs iniciais para `reproductionService` e `eventsService`.

## Endpoints v1
- `POST /api/v1/animais`
- `GET /api/v1/animais`
- `GET /api/v1/animais/:id`
- `PUT /api/v1/animais/:id`
- `DELETE /api/v1/animais/:id`
- `POST /api/v1/reproducao/:id/inseminacoes`
- `POST /api/v1/reproducao/:id/diagnosticos`
- `POST /api/v1/reproducao/:id/partos`
- `POST /api/v1/reproducao/:id/secagens`
- `GET /api/v1/reproducao/:id/historico`
- `POST /api/v1/saude/:id/ocorrencias`
- `POST /api/v1/saude/:id/tratamentos`
- `GET /api/v1/saude/:id/historico`

### Exemplos de payload
```json
// POST /api/v1/animais
{ "numero": 123, "categoria": "vaca" }

// POST /api/v1/reproducao/1/inseminacoes
{ "data": "2025-05-01", "descricao": "IA" }
```

## Frontend migrado para api.js
Os seguintes arquivos deixaram de importar `src/sqlite/animais.js` ou `src/sqlite/ajustes.js`:
- `src/pages/Animais/AcaoParto.jsx`
- `src/pages/Animais/ConteudoExportarDados.jsx`
- `src/pages/Animais/ConteudoImportarPDF.jsx`
- `src/pages/Animais/ConteudoInativas.jsx`
- `src/pages/Animais/ConteudoRelatorio.jsx`
- `src/pages/Animais/ConteudoSaidaAnimal.jsx`
- `src/pages/Animais/ModalCadastroBezerro.jsx`
- `src/pages/Animais/index.jsx`
- `src/pages/Animais/utilsAnimais.js`
- `src/pages/Leite/AbaCCS.jsx`
- `src/pages/Leite/AbaRegistroCMT.jsx`
- `src/pages/Leite/ControleLeiteiro.jsx`
- `src/pages/Leite/ModalMedicaoLeite.jsx`
- `src/pages/Reproducao/ProtocolosReprodutivos.jsx`
- `src/utils/configUsuario.js`
- `src/utils/gerarEventosCalendario.js`
- `src/utils/gerarTarefasAutomaticas.js`
- `src/utils/historico.js`
- `src/utils/registroReproducao.js`

## Evidências de teste
Tentativa de executar `node backend/server.js` falhou devido à ausência do pacote `dotenv`.
