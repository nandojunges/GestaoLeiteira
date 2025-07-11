// Adiciona um novo registro (sem sobrescrever os anteriores)
import { buscarTodos, adicionarItem, excluirItem } from "../../utils/apiFuncoes.js";

export const adicionarInfoMastite = async (numeroVaca, tipo, novoRegistro) => {
  if (!numeroVaca || !tipo || !novoRegistro) return;

  const chave = `mastite_vaca_${numeroVaca}`;
   const existente = (await buscarTodos(chave))[0] || {};

  // Inicializa o array do tipo se não existir ainda
  if (!Array.isArray(existente[tipo])) {
    existente[tipo] = [];
  }

  // Adiciona o novo dado ao histórico da vaca
  existente[tipo].push(novoRegistro);

  // Salva de volta
  await adicionarItem(chave, existente);
};

// Retorna todos os dados da vaca (com listas de cmt, diagnosticos e tratamentos)
export const carregarHistoricoMastite = async (numeroVaca) => {
  if (!numeroVaca) return {};
  const chave = `mastite_vaca_${numeroVaca}`;
 const dados = await buscarTodos(chave);
  return dados[0] || {};
};

// Apaga todo o histórico da vaca
export const apagarHistoricoMastite = async (numeroVaca) => {
  if (!numeroVaca) return;
  const chave = `mastite_vaca_${numeroVaca}`;
  const docs = await buscarTodos(chave);
  for (const d of docs) await excluirItem(chave, d.id);
};
