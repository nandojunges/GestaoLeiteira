import { buscarTodos, adicionarItem } from '../../utils/backendApi';

// === GRUPOS =====================================================
export async function salvarGrupos(grupos) {
  try {
    await adicionarItem('grupos', grupos);
    window.dispatchEvent(new Event('gruposAtualizados'));
  } catch (err) {
    console.error('Erro ao salvar grupos:', err);
  }
}

export async function carregarGrupos() {
  try {
    return await buscarTodos('grupos');
  } catch (err) {
    console.error('Erro ao carregar grupos:', err);
    return [];
  }
}

// === PREFERÊNCIAS ===============================================
export async function salvarPreferencias(preferencias) {
  try {
    await adicionarItem('preferencias', preferencias);
    window.dispatchEvent(new Event('preferenciasAtualizadas'));
  } catch (err) {
    console.error('Erro ao salvar preferências:', err);
  }
}

export async function carregarPreferencias() {
  try {
    const lista = await buscarTodos('preferencias');
    return lista[0] || {};
  } catch (err) {
    console.error('Erro ao carregar preferências:', err);
    return {};
  }
}

// === ALERTAS DE ESTOQUE ========================================
export async function salvarAlertas(alertas) {
  try {
    await adicionarItem('alertasEstoque', alertas);
    window.dispatchEvent(new Event('alertasEstoqueAtualizados'));
  } catch (err) {
    console.error('Erro ao salvar alertas de estoque:', err);
  }
}

export async function carregarAlertas() {
  try {
    const lista = await buscarTodos('alertasEstoque');
    return lista[0] || {};
  } catch (err) {
    console.error('Erro ao carregar alertas de estoque:', err);
    return {};
  }
}

// === CONFIGURAÇÃO DO USUÁRIO ===================================
export async function salvarConfiguracao(config) {
  try {
    await adicionarItem('configUsuario', config);
    window.dispatchEvent(new Event('configAtualizado'));
  } catch (err) {
    console.error('Erro ao salvar configUsuario:', err);
  }
}

export async function carregarConfiguracao() {
  try {
    const lista = await buscarTodos('configUsuario');
    return lista[0] || {};
  } catch (err) {
    console.error('Erro ao carregar configUsuario:', err);
    return {};
  }
}
