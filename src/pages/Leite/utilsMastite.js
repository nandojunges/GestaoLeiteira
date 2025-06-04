// Adiciona um novo registro (sem sobrescrever os anteriores)
export const adicionarInfoMastite = (numeroVaca, tipo, novoRegistro) => {
  if (!numeroVaca || !tipo || !novoRegistro) return;

  const chave = `mastite_vaca_${numeroVaca}`;
  const existente = JSON.parse(localStorage.getItem(chave)) || {};

  // Inicializa o array do tipo se não existir ainda
  if (!Array.isArray(existente[tipo])) {
    existente[tipo] = [];
  }

  // Adiciona o novo dado ao histórico da vaca
  existente[tipo].push(novoRegistro);

  // Salva de volta
  localStorage.setItem(chave, JSON.stringify(existente));
};

// Retorna todos os dados da vaca (com listas de cmt, diagnosticos e tratamentos)
export const carregarHistoricoMastite = (numeroVaca) => {
  if (!numeroVaca) return {};
  const chave = `mastite_vaca_${numeroVaca}`;
  const dados = localStorage.getItem(chave);
  return dados ? JSON.parse(dados) : {};
};

// Apaga todo o histórico da vaca
export const apagarHistoricoMastite = (numeroVaca) => {
  if (!numeroVaca) return;
  const chave = `mastite_vaca_${numeroVaca}`;
  localStorage.removeItem(chave);
};
