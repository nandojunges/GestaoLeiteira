import { buscarTodos, adicionarItem } from '../utils/backendApi';

export async function carregarGrupos() {
  return buscarTodos('grupos');
}

export async function salvarGrupos(grupos) {
  await adicionarItem('grupos', grupos);
  window.dispatchEvent(new Event('gruposAtualizados'));
}

export async function carregarPreferencias() {
  const lista = await buscarTodos('preferencias');
  return lista[0] || {};
}

export async function salvarPreferencias(preferencias) {
  await adicionarItem('preferencias', preferencias);
  window.dispatchEvent(new Event('preferenciasAtualizadas'));
}

export async function carregarAlertas() {
  const lista = await buscarTodos('alertasEstoque');
  return lista[0] || {};
}

export async function salvarAlertas(alertas) {
  await adicionarItem('alertasEstoque', alertas);
  window.dispatchEvent(new Event('alertasEstoqueAtualizados'));
}

export async function carregarConfiguracao() {
  const lista = await buscarTodos('configUsuario');
  return lista[0] || {};
}

export async function salvarConfiguracao(config) {
  await adicionarItem('configUsuario', config);
  window.dispatchEvent(new Event('configAtualizado'));
}
