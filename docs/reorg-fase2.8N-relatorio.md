# Reorganização fase 2.8N – Front preparado para estados e histórico

## Telas ajustadas
- **Animais/ConteudoPlantel**: usa `vaca.del`, `previsaoParto` e `previsaoSecagem` vindos do backend e exibe estado.
- **Animais/ConteudoInativas**: busca animais inativos via API.
- **Animais/ModalHistoricoCompleto + FichaAnimalEventos**: seção "Histórico" carrega ocorrências de reprodução e saúde da API.
- **Animais/FichaAnimalResumoReprodutivo**: apresenta DEL e previsões fornecidas pelo backend.
- **Reproducao/VisaoGeralReproducao**: lista vacas conforme filtro de estado diretamente da API.

## Endpoints utilizados
- `GET /api/v1/animais?estado=...`
- `GET /api/v1/reproducao/{id}/historico`
- `GET /api/v1/saude/{id}/historico`

## Novas props
- `FichaAnimalEventos` agora recebe `animalId`.
