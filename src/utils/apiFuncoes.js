import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function fetchJson(url, options = {}) {
  try {
    const token = localStorage.getItem('token');
    options.headers = {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    const res = await fetch(url, options);
    if (!res.ok) {
      if (res.status === 404) {
        return [];
      }
      throw new Error(`Erro ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error('Erro ao buscar dados:', err);
    toast.error('Erro ao conectar com o servidor.');
    return [];
  }
}

// ==== CONSULTAS ====

export async function buscarAnimais() {
  return fetchJson(`${BASE_URL}/animais`);
}

export async function buscarTodos() {
  return await buscarAnimais(); // apelido alternativo
}

export async function buscarVacas() {
  return fetchJson(`${BASE_URL}/vacas`);
}

export async function buscarTarefas() {
  return fetchJson(`${BASE_URL}/tarefas`);
}

export async function buscarEstoque() {
  return fetchJson(`${BASE_URL}/estoque`);
}

export async function buscarProtocolos() {
  return fetchJson(`${BASE_URL}/protocolos-reprodutivos`);
}

export async function buscarReproducao(numero) {
  return fetchJson(`${BASE_URL}/reproducao/${numero}`);
}

export async function buscarMedicamentosSecagemSQLite() {
  return fetchJson(`${BASE_URL}/medicamentos-secagem`);
}

export async function buscarPrincipiosSQLite() {
  return fetchJson(`${BASE_URL}/principios`);
}

export async function buscarTodosBezerrosSQLite() {
  return fetchJson(`${BASE_URL}/bezerras`);
}

export async function buscarTodosTourosSQLite() {
  return fetchJson(`${BASE_URL}/touros`);
}

export async function buscarPelagensSQLite() {
  return fetchJson(`${BASE_URL}/pelagens`);
}

export async function buscarRacasAdicionaisSQLite() {
  return fetchJson(`${BASE_URL}/racas`);
}

export async function buscarCiclosEditadosSQLite(numero) {
  return fetchJson(`${BASE_URL}/ciclos/${numero}`);
}

export async function buscarEventosCalendarioSQLite() {
  return fetchJson(`${BASE_URL}/eventos`);
}

export async function buscarResponsaveisSecagemSQLite() {
  return fetchJson(`${BASE_URL}/responsaveis-secagem`);
}

export async function buscarLancamentosPorPeriodo(inicio, fim) {
  const params = new URLSearchParams();
  if (inicio) params.append('inicio', inicio);
  if (fim) params.append('fim', fim);
  return fetchJson(`${BASE_URL}/financeiro?${params.toString()}`);
}

export async function buscarFinanceiro() {
  return fetchJson(`${BASE_URL}/financeiro`);
}

export async function buscarColecaoGenericaSQLite(nome) {
  return fetchJson(`${BASE_URL}/${nome}`);
}

// ==== INSERÇÕES / ATUALIZAÇÕES ====

export async function adicionarItem(rota, item) {
  return await fetchJson(`${BASE_URL}/${rota}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
}

export async function atualizarItem(rota, id, item) {
  await fetchJson(`${BASE_URL}/${rota}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
}

export async function registrarProtocolo(dados) {
  return await adicionarItem("protocolos-reprodutivos", dados);
}

export async function atualizarProtocolo(id, dados) {
  return await atualizarItem("protocolos-reprodutivos", id, dados);
}

export async function salvarMedicamentosSecagemSQLite(dados) {
  return await adicionarItem("medicamentos-secagem", dados);
}

export async function inserirMedicamentoSecagemSQLite(dados) {
  return await adicionarItem("medicamentos-secagem", dados);
}

export async function inserirPrincipioSQLite(dado) {
  return await adicionarItem("principios", { valor: dado });
}

export async function salvarBezerrosSQLite(dados) {
  return await adicionarItem("bezerras", dados);
}

export async function inserirTouroSQLite(dados) {
  return await adicionarItem("touros", dados);
}

export async function inserirPelagemSQLite(dado) {
  return await adicionarItem("pelagens", { valor: dado });
}

export async function registrarPartoSQLite(dados) {
  return await adicionarItem("partos", dados);
}

export async function inserirRacaAdicionalSQLite(dado) {
  return await adicionarItem("racas", { valor: dado });
}

export async function salvarCiclosEditadosSQLite(numero, dados) {
  return await atualizarItem("ciclos", numero, dados);
}

export async function salvarEventosCalendarioSQLite(dados) {
  if (Array.isArray(dados)) {
    for (const ev of dados) {
      await adicionarItem("eventos", ev);
    }
    return true;
  }
  return await adicionarItem("eventos", dados);
}

export async function inserirResponsavelSecagemSQLite(nome) {
  return await adicionarItem("responsaveis-secagem", { nome });
}

export async function adicionarLancamentoFinanceiro(dados) {
  return await adicionarItem("financeiro", dados);
}

export async function editarLancamento(id, dados) {
  return await atualizarItem("financeiro", id, dados);
}

export async function salvarFichaAnimalSQLite(numeroAnimal, dados) {
  return await atualizarItem("animais/ficha", numeroAnimal, dados);
}

// ==== EXCLUSÕES ====

export async function deletarItem(rota, id) {
  await fetchJson(`${BASE_URL}/${rota}/${id}`, { method: 'DELETE' });
}

export async function excluirItem(rota, id) {
  await deletarItem(rota, id); // alias
}

export async function excluirProtocolo(id) {
  return await deletarItem("protocolos-reprodutivos", id);
}

export async function removerMedicamentoSecagemSQLite(id) {
  return await deletarItem("medicamentos-secagem", id);
}

export async function removerTouroSQLite(id) {
  return await deletarItem("touros", id);
}

export async function deletarLancamento(id) {
  return await deletarItem("financeiro", id);
}

// ==== OUTROS ====

export async function exportarAnimaisSQLite() {
  return buscarAnimais();
}

// ==== FUNÇÕES DEDICADAS PARA BEZERRAS (alias) ====

export async function adicionarBezerra(dados) {
  return await adicionarItem("bezerras", dados);
}

export async function buscarBezerras() {
  return await buscarTodosBezerrosSQLite();
}

export async function removerBezerra(id) {
  return await deletarItem("bezerras", id);
}

export async function removerBezerraSQLite(id) {
  return await fetchJson(`${BASE_URL}/bezerras/${id}`, { method: 'DELETE' });
}

export async function atualizarBezerra(id, dados) {
  return await atualizarItem("bezerras", id, dados);
}
