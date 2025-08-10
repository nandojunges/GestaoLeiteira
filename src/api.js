import axios from 'axios';

const api = axios.create({
  // Garante que a base da API termine com barra caso VITE_API_URL não esteja definida.
  // Assim, chamadas como `api.post('auth/login')` resultam em '/api/auth/login' em vez de 'apiauth/login'.
  baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : '/api/',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Animais
export async function getAnimais(params = {}) {
  const res = await api.get('v1/animais', { params });
  return res.data;
}

export async function getAnimal(id) {
  const res = await api.get(`v1/animais/${id}`);
  return res.data;
}

export async function criarAnimal(data) {
  const res = await api.post('v1/animais', data);
  return res.data;
}

export async function atualizarAnimal(id, data) {
  const res = await api.put(`v1/animais/${id}`, data);
  return res.data;
}

export async function removerAnimal(id) {
  const res = await api.delete(`v1/animais/${id}`);
  return res.data;
}

// Reprodução
export async function inserirInseminacao(id, data) {
  const res = await api.post(`v1/reproducao/${id}/inseminacoes`, data);
  return res.data;
}

export async function inserirDiagnostico(id, data) {
  const res = await api.post(`v1/reproducao/${id}/diagnosticos`, data);
  return res.data;
}

export async function registrarParto(id, data) {
  const res = await api.post(`v1/reproducao/${id}/partos`, data);
  return res.data;
}

export async function registrarSecagem(id, data) {
  const res = await api.post(`v1/reproducao/${id}/secagens`, data);
  return res.data;
}

export async function listarHistoricoReproducao(id) {
  const res = await api.get(`v1/reproducao/${id}/historico`);
  return res.data;
}

// Saúde
export async function listarHistoricoSaude(id) {
  const res = await api.get(`v1/saude/${id}/historico`);
  return res.data;
}

export async function registrarOcorrencia(id, data) {
  const res = await api.post(`v1/saude/${id}/ocorrencias`, data);
  return res.data;
}

export async function registrarTratamento(id, data) {
  const res = await api.post(`v1/saude/${id}/tratamentos`, data);
  return res.data;
}

// Configuração do usuário (substituindo sqlite/ajustes)
export async function carregarConfiguracao() {
  const res = await api.get('configuracao');
  return res.data;
}

export async function salvarConfiguracao(data) {
  const res = await api.post('configuracao', data);
  return res.data;
}

// Compatibilidade com antigas funções baseadas em sqlite
export const buscarTodosAnimais = getAnimais;
export const buscarAnimalPorId = getAnimal;
export const buscarAnimalPorNumero = (numero) =>
  getAnimais({ q: numero }).then((list) => list && list[0]);
export const salvarAnimais = async (animais) =>
  Promise.all(
    (animais || []).map((a) => (a.id ? atualizarAnimal(a.id, a) : criarAnimal(a)))
  );
export const atualizarAnimalNoBanco = (animal) => atualizarAnimal(animal.id, animal);
export const excluirAnimal = removerAnimal;
export const salvarSaidaAnimal = (saida) =>
  api.post('v1/animais/saidas', saida).then((r) => r.data);
