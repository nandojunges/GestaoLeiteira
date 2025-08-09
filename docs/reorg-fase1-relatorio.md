# Relatório de Reorganização – Fase 1

## Pastas criadas
- `src/animais/graficos`
- `src/reproducao`
- `src/saude`
- `src/usuario`
- `src/usuario/auth`
- `src/components/shared`
- `src/components/modals`
- `src/dev`

## Arquivos movidos
| Origem | Destino |
| ------ | ------- |
| src/components/AbaSaude/AbaSaude.jsx | src/saude/Saude.jsx |
| src/components/AbaSaude/TabelaTratamentos.jsx | src/saude/TabelaTratamentos.jsx |
| src/components/AbaSaude/ModalOcorrencia.jsx | src/saude/ModalOcorrencia.jsx |
| src/components/AbaSaude/ModalTratamento.jsx | src/saude/ModalTratamento.jsx |
| src/components/AbaSaude/TabelaOcorrencias.jsx | src/saude/TabelaOcorrencias.jsx |
| src/components/SaudeAnimais.jsx | src/saude/SaudeAnimais.jsx |
| src/components/MenuAcao.jsx | src/usuario/MenuAcao.jsx |
| src/components/ModalCapa.jsx | src/usuario/ModalCapa.jsx |
| src/components/ModalFoto.jsx | src/usuario/ModalFoto.jsx |
| src/components/ModalPlanoSelecionado.jsx | src/usuario/ModalPlanoSelecionado.jsx |
| src/components/LoginInfoRotativo.jsx | src/usuario/auth/LoginInfoRotativo.jsx |
| src/pages/EscolherPlano.jsx | src/usuario/auth/EscolherPlano.jsx |
| src/pages/EscolherPlanoCadastro.jsx | src/usuario/auth/EscolherPlanoCadastro.jsx |
| src/pages/EscolherPlanoUsuario.jsx | src/usuario/auth/EscolherPlanoUsuario.jsx |
| src/pages/EscolherPlanoInicio.jsx | src/usuario/auth/EscolherPlanoInicio.jsx |
| src/pages/EscolherPlano.css | src/usuario/auth/EscolherPlano.css |
| src/components/OverflowInfo.jsx | src/components/shared/OverflowInfo.jsx |
| src/components/ModalConfirmarExclusao.jsx | src/components/modals/ModalConfirmarExclusao.jsx |
| src/components/ModalExclusaoPadrao.jsx | src/components/modals/ModalExclusaoPadrao.jsx |
| src/components/Lembrete.jsx | src/dev/Lembrete.jsx |
| src/Graficos/Animais/GraficoDescarteIdade.jsx | src/animais/graficos/GraficoDescarteIdade.jsx |
| src/Graficos/Animais/ResumoLactacoes.jsx | src/animais/graficos/ResumoLactacoes.jsx |
| src/Graficos/Animais/CurvaLactacao.jsx | src/animais/graficos/CurvaLactacao.jsx |

## Imports ajustados
| Arquivo | Quantidade |
| ------- | ---------- |
| src/components/IconeInfo.jsx | 1 |
| src/pages/Ajustes/Ajustes.jsx | 2 |
| src/pages/Animais/FichaAnimalReproducao.jsx | 1 |
| src/pages/Animais/RelatorioMedicamentos.jsx | 1 |
| src/pages/Auth/Login.jsx | 1 |
| src/pages/ConsumoReposicao/Estoque.jsx | 1 |
| src/pages/ConsumoReposicao/ListaCalendarioVacinal.jsx | 1 |
| src/pages/ConsumoReposicao/ListaDietas.jsx | 1 |
| src/pages/ConsumoReposicao/ListaLimpeza.jsx | 1 |
| src/pages/ConsumoReposicao/ListaLotes.jsx | 1 |
| src/pages/ConsumoReposicao/ListaProdutos.jsx | 1 |
| src/pages/Reproducao/ProtocolosReprodutivos.jsx | 1 |
| src/pages/Reproducao/VisaoGeralReproducao.jsx | 1 |
| src/usuario/auth/EscolherPlano.jsx | 2 |
| src/usuario/auth/EscolherPlanoCadastro.jsx | 2 |
| src/usuario/auth/EscolherPlanoUsuario.jsx | 2 |
| src/routes.jsx | 3 |

## Candidatos à remoção
- `src/assets/icones/` (ícone duplicado, não utilizado)
- `src/firebase.js` (marcado como legado)
- `src/context/AnimalContext.jsx` (sem referências)
- `src/usuario/MenuAcao.jsx` (não utilizado)
- `src/saude/SaudeAnimais.jsx` (não utilizado)
- `src/animais/graficos/GraficoDescarteIdade.jsx` e `src/animais/graficos/ResumoLactacoes.jsx` (gráficos sem referências)

## Pendências para a Fase 2
- Consolidar componentes `EscolherPlano*`
- Migrar arquivos `src/sqlite/*.js` para serviços/backend
- Remover definitivamente ícones de `src/assets/icones`
- Eliminar `firebase.js` e `AnimalContext.jsx` se confirmada a inutilização
- Revisar e remover componentes/relatórios não utilizados

## Build
- `npm install` falhou: `403 Forbidden - GET https://registry.npmjs.org/http-proxy-middleware`
- `npm run build` falhou: `vite: not found`

\nEste relatório deve acompanhar o pull request.
