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
| Origem | Destino | Status |
| ------ | ------- | ------ |
| src/components/AbaSaude/AbaSaude.jsx | src/saude/Saude.jsx | migrado |
| src/components/AbaSaude/TabelaTratamentos.jsx | src/saude/TabelaTratamentos.jsx | migrado |
| src/components/AbaSaude/ModalOcorrencia.jsx | src/saude/ModalOcorrencia.jsx | migrado |
| src/components/AbaSaude/ModalTratamento.jsx | src/saude/ModalTratamento.jsx | migrado |
| src/components/AbaSaude/TabelaOcorrencias.jsx | src/saude/TabelaOcorrencias.jsx | migrado |
| src/components/SaudeAnimais.jsx | src/saude/SaudeAnimais.jsx | migrado |
| src/components/MenuAcao.jsx | src/usuario/MenuAcao.jsx | migrado |
| src/components/ModalCapa.jsx | src/usuario/ModalCapa.jsx | migrado |
| src/components/ModalFoto.jsx | src/usuario/ModalFoto.jsx | migrado |
| src/components/ModalPlanoSelecionado.jsx | src/usuario/ModalPlanoSelecionado.jsx | migrado |
| src/components/LoginInfoRotativo.jsx | src/usuario/auth/LoginInfoRotativo.jsx | migrado |
| src/pages/EscolherPlano.jsx | src/usuario/auth/EscolherPlano.jsx | migrado |
| src/pages/EscolherPlanoCadastro.jsx | src/usuario/auth/EscolherPlanoCadastro.jsx | migrado |
| src/pages/EscolherPlanoUsuario.jsx | src/usuario/auth/EscolherPlanoUsuario.jsx | migrado |
| src/pages/EscolherPlanoInicio.jsx | src/usuario/auth/EscolherPlanoInicio.jsx | migrado |
| src/pages/EscolherPlano.css | src/usuario/auth/EscolherPlano.css | migrado |
| src/components/OverflowInfo.jsx | src/components/shared/OverflowInfo.jsx | migrado |
| src/components/ModalConfirmarExclusao.jsx | src/components/modals/ModalConfirmarExclusao.jsx | migrado |
| src/components/ModalExclusaoPadrao.jsx | src/components/modals/ModalExclusaoPadrao.jsx | migrado |
| src/components/Lembrete.jsx | src/dev/Lembrete.jsx | migrado |
| src/Graficos/Animais/GraficoDescarteIdade.jsx | src/animais/graficos/GraficoDescarteIdade.jsx | migrado |
| src/Graficos/Animais/ResumoLactacoes.jsx | src/animais/graficos/ResumoLactacoes.jsx | migrado |
| src/Graficos/Animais/CurvaLactacao.jsx | src/animais/graficos/CurvaLactacao.jsx | migrado |

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

## Imports corrigidos na Fase 1.2
- `src/pages/ConsumoReposicao/SubAbasConsumoReposicao.jsx`
- `public/data/loginInfo.json`
- `public/data/rotativos/01.txt`

## Arquivos em quarentena
- `src/_quarantine/firebase.js`
- `src/_quarantine/AnimalContext.jsx`
- `src/_quarantine/SaudeAnimais.jsx`
- `src/_quarantine/GraficoDescarteIdade.jsx`
- `src/_quarantine/ResumoLactacoes.jsx`
- `src/_quarantine/icones/informacoes.png`
- `src/usuario/MenuAcao.jsx` (não utilizado, avaliar na Fase 2)

## Pendências para a Fase 2
- Consolidar componentes `EscolherPlano*`
- Migrar arquivos `src/sqlite/*.js` para backend/services
- Validar remoção de arquivos em `src/_quarantine`
- Revisar `src/usuario/MenuAcao.jsx` e outros componentes não utilizados

## Build
- `npm ci` e `npm i` falharam: `403 Forbidden - GET https://registry.npmjs.org/http-proxy-middleware`
- `npm run build` não executado: `vite: not found`

## Inventário de uso de arquivos

```csv
arquivo_absoluto;pertence_a;utilizado_em;status_utilizacao;observacoes
/workspace/GestaoLeiteira/src/components/SaudeAnimais.jsx;src/components;;NAO_REFERENCIADO;
/workspace/GestaoLeiteira/src/components/ModalConfirmarExclusao.jsx;src/components;src/pages/ConsumoReposicao/ListaCalendarioVacinal.jsx|src/components/ModalExclusaoPadrao.jsx|src/pages/Animais/RelatorioMedicamentos.jsx|src/pages/Animais/FichaAnimalReproducao.jsx|src/pages/Reproducao/ProtocolosReprodutivos.jsx;USADO;
/workspace/GestaoLeiteira/src/components/LoginInfoRotativo.jsx;src/components;src/pages/Auth/Login.jsx;USADO;
/workspace/GestaoLeiteira/src/components/OverflowInfo.jsx;src/components;src/pages/Reproducao/VisaoGeralReproducao.jsx;USADO;
/workspace/GestaoLeiteira/src/components/ModalCapa.jsx;src/components;src/pages/Ajustes/Ajustes.jsx;USADO;
/workspace/GestaoLeiteira/src/components/AbaSaude/AbaSaude.jsx;src/components;;NAO_REFERENCIADO;
/workspace/GestaoLeiteira/src/components/AbaSaude/TabelaTratamentos.jsx;src/components;src/components/AbaSaude/AbaSaude.jsx|src/pages/Saude/TabelaTratamentos.jsx;USADO;
/workspace/GestaoLeiteira/src/components/AbaSaude/ModalOcorrencia.jsx;src/components;src/components/AbaSaude/AbaSaude.jsx|src/pages/Saude/ModalOcorrencia.jsx;USADO;
/workspace/GestaoLeiteira/src/components/AbaSaude/ModalTratamento.jsx;src/components;src/components/AbaSaude/AbaSaude.jsx|src/pages/Saude/ModalTratamento.jsx;USADO;
/workspace/GestaoLeiteira/src/components/AbaSaude/TabelaOcorrencias.jsx;src/components;src/pages/Saude/TabelaOcorrencias.jsx|src/components/AbaSaude/AbaSaude.jsx;USADO;
/workspace/GestaoLeiteira/src/components/MenuAcao.jsx;src/components;;NAO_REFERENCIADO;
/workspace/GestaoLeiteira/src/components/CardResumoIndicador.jsx;src/components;;NAO_REFERENCIADO;
/workspace/GestaoLeiteira/src/components/Lembrete.jsx;src/components;;NAO_REFERENCIADO;
/workspace/GestaoLeiteira/src/components/IconeInfo.jsx;src/components;;NAO_REFERENCIADO;
/workspace/GestaoLeiteira/src/components/FiltrosLinha.jsx;src/components;;NAO_REFERENCIADO;
/workspace/GestaoLeiteira/src/components/ModalExclusaoPadrao.jsx;src/components;src/pages/ConsumoReposicao/ListaLotes.jsx|src/pages/ConsumoReposicao/ListaLimpeza.jsx|src/pages/ConsumoReposicao/ListaDietas.jsx|src/pages/ConsumoReposicao/Estoque.jsx|src/pages/ConsumoReposicao/ListaProdutos.jsx;USADO;
/workspace/GestaoLeiteira/src/components/ModalFoto.jsx;src/components;src/pages/Ajustes/Ajustes.jsx;USADO;
/workspace/GestaoLeiteira/src/components/CardReposicao.jsx;src/components;;NAO_REFERENCIADO;
/workspace/GestaoLeiteira/src/components/ModalPlanoSelecionado.jsx;src/components;src/pages/EscolherPlanoCadastro.jsx|src/pages/EscolherPlanoUsuario.jsx;USADO;
/workspace/GestaoLeiteira/src/context/AnimalContext.jsx;src/context;;NAO_REFERENCIADO;
/workspace/GestaoLeiteira/src/context/ConfiguracaoContext.jsx;src/context;src/pages/Ajustes/SecaoIdentidade.jsx|src/pages/Ajustes/SecaoPermissoes.jsx|src/pages/Ajustes/SecaoPreferenciasGerais.jsx|src/pages/Ajustes/SecaoConfiguracoesVisuais.jsx|src/pages/Ajustes/SecaoNotificacoes.jsx|src/pages/Ajustes/Ajustes.jsx|src/main.jsx|src/layout/NavegacaoPrincipal.jsx|src/pages/Animais/SubAbasAnimais.jsx|src/pages/Relatorios/SubAbasRelatorios.jsx|src/pages/Reproducao/SubAbasReproducao.jsx|src/pages/Saude/SubAbasSaude.jsx|src/pages/ConsumoReposicao/SubAbasConsumoReposicao.jsx;USADO;
/workspace/GestaoLeiteira/src/Graficos/Animais/GraficoDescarteIdade.jsx;src/Graficos;;NAO_REFERENCIADO;
/workspace/GestaoLeiteira/src/Graficos/Animais/ResumoLactacoes.jsx;src/Graficos;;NAO_REFERENCIADO;
/workspace/GestaoLeiteira/src/Graficos/Animais/CurvaLactacao.jsx;src/Graficos;src/pages/Animais/GraficoCurvaLactacao.jsx|src/pages/Animais/FichaAnimalLeite.jsx;USADO;
/workspace/GestaoLeiteira/src/sqlite/animais.js;src/sqlite;backend/controllers/animaisController.js|backend/routes/animaisRoutes.js|backend/routes/rotasExtras.js|backend/routes/adminRoutes.js|src/pages/Saude/AlertasSaude.jsx|src/pages/Leite/ModalMedicaoLeite.jsx|src/pages/Saude/ModalTratamento.jsx|src/pages/Saude/ModalOcorrencia.jsx|src/pages/Leite/ControleLeiteiro.jsx|src/pages/Leite/AbaCCS.jsx|src/pages/Saude/AlertaSaude.jsx|src/pages/Leite/AbaRegistroCMT.jsx|src/pages/Saude/Saude.jsx|backend/server.js|src/pages/AppTarefas/utilsDashboard.js|src/pages/AppTarefas/DashboardAlertas.jsx|src/pages/AppTarefas/DashboardEventos.jsx|src/pages/AppTarefas/DashboardCards.jsx|backend/db.js|src/pages/AppTarefas/index.jsx|src/pages/AppTarefas/DashboardGraficos.jsx|src/pages/AppTarefas/componentes/GraficosRepro.jsx|backend/models/Produtor.js|src/pages/AppTarefas/componentes/InsightsInteligentes.jsx|backend/models/animaisModel.js|backend/models/eventosModel.js|src/pages/ConsumoReposicao/CadastroDietas.jsx|backend/services/reproducaoService.js|src/pages/ConsumoReposicao/ModalInfoLote.jsx|src/pages/Animais/ModalCadastroBezerro.jsx|src/pages/Animais/PainelLateralCadastro.jsx|src/pages/Animais/ConteudoExportarDados.jsx|src/pages/Animais/ConteudoInativas.jsx|src/pages/ConsumoReposicao/ModalExamesSanitarios.jsx|src/pages/Animais/AcaoParto.jsx|src/pages/Animais/ConteudoSaidaAnimal.jsx|src/pages/Animais/ConteudoParto.jsx|src/pages/Animais/ConteudoEntradaAnimal.jsx|src/pages/Animais/index.jsx|src/pages/Animais/utilsAnimais.js|src/pages/Animais/ConteudoSecagem.jsx|src/layout/NavegacaoPrincipal.jsx|src/pages/Animais/ModalEditarAnimal.jsx|src/pages/Animais/ConteudoImportarPDF.jsx|src/pages/Animais/ConteudoRelatorio.jsx|src/pages/Animais/CadastroBasicoAnimal.jsx|src/Graficos/Animais/GraficoDescarteIdade.jsx|src/pages/Relatorios/RelatorioReprodutivo.jsx|src/pages/Relatorios/RelatorioMovimentacaoAnimais.jsx|src/components/SaudeAnimais.jsx|src/routes.jsx|src/utils/verificarAlertaEstoque.js|src/context/AnimalContext.jsx|src/utils/apiFuncoes.js|src/pages/Reproducao/ProtocolosReprodutivos.jsx|src/utils/gerarTarefasAutomaticas.js|src/pages/Reproducao/utilsReproducao.js|src/utils/historico.js|src/pages/Reproducao/VisaoGeralReproducao.jsx|src/utils/gerarEventosCalendario.js|src/utils/registroReproducao.js|src/utils/cacheAnimais.js|src/pages/Calendario/CalendarioAtividades.jsx;USADO;avaliar migracao para backend/services
/workspace/GestaoLeiteira/src/sqlite/ajustes.js;src/sqlite;src/index.css|src/utils/verificarAlertaEstoque.js|src/utils/configUsuario.js|src/routes.jsx|src/layout/NavegacaoPrincipal.jsx|backend/routes/mockRoutes.js|src/pages/ConsumoReposicao/AjustesEstoque.jsx;USADO;avaliar migracao para backend/services
/workspace/GestaoLeiteira/src/App.jsx;src root;src/pages/AppTarefas/utilsDashboard.js|src/pages/AppTarefas/index.jsx|src/pages/AppTarefas/TarefasCentrais.jsx|package-lock.json|src/routes.jsx|src/firebase.js|src/utils/gerarTarefasAutomaticas.js;USADO;
/workspace/GestaoLeiteira/src/firebase.js;src root;;NAO_REFERENCIADO;
/workspace/GestaoLeiteira/src/routes.jsx;src root;backend/routes/animaisRoutes.js|src/main.jsx|backend/server.js;USADO;
/workspace/GestaoLeiteira/src/main.jsx;src root;index.html|src/layout/SistemaBase.jsx|src/pages/Animais/SecaoCMT.jsx|src/pages/Animais/GraficoIAPorCiclo.jsx|src/firebase.js|src/pages/Animais/GraficoDELporLactacao.jsx|src/pages/Animais/LinhaDoTempoReprodutiva.jsx|backend/server.js|backend/package.json;USADO;
/workspace/GestaoLeiteira/src/setupProxy.js;src root;;NAO_REFERENCIADO;
/workspace/GestaoLeiteira/src/api.js;src root;src/setupProxy.js|src/pages/Leite/ModalMedicaoLeite.jsx|src/pages/Leite/utilsMastite.js|src/pages/Leite/GuiaMastite.jsx|src/pages/Leite/ModalFiltroLoteInteligente.jsx|src/pages/Leite/ControleLeiteiro.jsx|src/pages/Leite/AbaRegistroCMT.jsx|src/pages/AppTarefas/utilsDashboard.js|backend/server.js|src/pages/Animais/ModalCadastroBezerro.jsx|src/pages/Animais/ModalCadastroSecagem.jsx|src/pages/Animais/ConteudoExportarDados.jsx|src/pages/Animais/ImportarFichaTouro.jsx|src/pages/Animais/FichaAnimalReproducao.jsx|src/pages/Animais/ConteudoPlantel.jsx|src/pages/Animais/AcaoParto.jsx|index.html|src/pages/Animais/ModalHistoricoCompleto.jsx|package-lock.json|src/pages/Animais/ConteudoParto.jsx|src/pages/Animais/AcaoSecagem.jsx|src/pages/Animais/ConteudoSecagem.jsx|src/pages/Animais/ModalRegistrarParto.jsx|src/pages/Animais/CadastroBasicoAnimal.jsx|src/pages/Animais/RelatorioMedicamentos.jsx|src/styles/filtros.css|src/pages/Admin/ListaUsuarios.jsx|src/pages/Animais/AbrirFichaTouro.jsx|src/pages/Admin/RelatorioAdmin.jsx|src/pages/Admin/PainelAprovacaoAdmin.jsx|src/firebase.js|src/pages/Admin/PainelAprovacoesPendentes.jsx|src/pages/Animais/FichaComplementarAnimal.jsx|src/pages/Fazenda/Fazenda.jsx|src/pages/Animais/ModalEditarAnimal.jsx|src/pages/Admin/PainelPlanosAdmin.jsx|src/pages/EscolherPlanoCadastro.jsx|src/pages/Admin/AdminPainel.jsx|src/utils/backendApi.js|src/utils/apiFuncoes.js|src/utils/db.js|src/utils/gerarTarefasAutomaticas.js|src/utils/financeiro.js|src/utils/registroReproducao.js|src/pages/Reproducao/ModalConfiguracaoPEV.jsx|src/utils/cacheAnimais.js|src/pages/Reproducao/ProtocolosReprodutivos.jsx|src/pages/Reproducao/ModalCadastroProtocolo.jsx|src/pages/Reproducao/ModalRegistrarOcorrencia.jsx|src/pages/Reproducao/VisaoGeralReproducao.jsx|src/pages/Reproducao/ModalLancamentoDiagnostico.jsx|src/pages/EscolherPlano.jsx|src/pages/EscolherPlanoUsuario.jsx|src/pages/StatusPlanoUsuario.jsx|src/pages/Auth/EsqueciSenha.jsx|src/pages/Auth/Cadastro.jsx|src/pages/Auth/BemVindo.jsx|src/pages/Auth/VerificarEmail.jsx|src/pages/Auth/Login.jsx|src/pages/Financeiro/LivroCaixa.jsx|src/pages/Bezerras/index.jsx|src/pages/Financeiro/ResumoRapido.jsx|src/pages/Calendario/CalendarioAtividades.jsx;USADO;
/workspace/GestaoLeiteira/src/pages/ConfigTelaInicial.jsx;src/pages;src/routes.jsx;USADO;
/workspace/GestaoLeiteira/src/pages/EscolherPlano.jsx;src/pages;src/pages/EscolherPlanoUsuario.jsx|src/pages/EscolherPlanoInicio.jsx|src/pages/EscolherPlanoCadastro.jsx|src/routes.jsx;USADO;
/workspace/GestaoLeiteira/src/pages/EscolherPlanoCadastro.jsx;src/pages;src/routes.jsx;USADO;
/workspace/GestaoLeiteira/src/pages/EscolherPlanoUsuario.jsx;src/pages;src/routes.jsx;USADO;
/workspace/GestaoLeiteira/src/pages/EscolherPlanoInicio.jsx;src/pages;src/routes.jsx;USADO;
```

Este relatório deve acompanhar o pull request.
