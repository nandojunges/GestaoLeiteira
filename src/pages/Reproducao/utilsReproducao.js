import { calcularDEL } from '../Animais/utilsAnimais';
import {
  buscarTodos,
  adicionarItem,
  atualizarItem,
  excluirItem,
} from '../../utils/apiFuncoes.js';

// 🔄 Carrega vacas liberadas para protocolo com base em IA anterior
export const carregarAnimaisReprodutivos = async () => {
  const animais = await buscarTodos('animais');
  const hoje = new Date();

  const liberadas = animais.filter(vaca => {
    const ultimaIA = new Date(vaca.ultimaIA || 0);
    const diasDesdeUltimaIA = Math.ceil((hoje - ultimaIA) / (1000 * 60 * 60 * 24));
    return diasDesdeUltimaIA > 45; // Exemplo fixo ou configurável
  });

  return { liberadas };
};

// 🔧 PEV configurado (dias). Se nenhum registro existir, assume 45 dias
let configCache = null;
export const obterAjustePEV = () => {
  if (configCache === null) {
    buscarTodos('configPEV').then((lista) => {
      configCache = lista?.[0] || {};
    });
  }
  return parseInt(configCache?.diasPEV) || 45;
};

// ✅ Determina se a vaca está liberada ou ainda no PEV de acordo com o DEL
export const getStatusVaca = (del) => {
  const ajustePEV = obterAjustePEV();
  return del >= ajustePEV ? 'Liberada' : 'No PEV';
};

// ✅ Filtra animais conforme status e intervalo de DEL
export const filtrarPorStatus = (animais, statusFiltro, delMin = '', delMax = '') => {
  return (animais || []).filter(a => {
    const del = a.ultimoParto ? calcularDEL(a.ultimoParto) : 0;
    if (statusFiltro === 'pev' && getStatusVaca(del) === 'Liberada') return false;
    if (statusFiltro === 'liberada' && getStatusVaca(del) !== 'Liberada') return false;
    if (statusFiltro === 'prenhe' && (a.statusReprodutivo || '').toLowerCase() !== 'prenhe') return false;
    if (delMin && del < parseInt(delMin)) return false;
    if (delMax && del > parseInt(delMax)) return false;
    return true;
  });
};

// ✅ Ações permitidas conforme o DEL
export const getAcoesDisponiveis = (del) => {
  const ajustePEV = obterAjustePEV();
  if (del < ajustePEV) {
    return ['Registrar Ocorrência'];
  }
  return [
    'Iniciar Protocolo IATF',
    'Iniciar sincronização de cio',
    'Registrar cio natural',
    'Registrar inseminação',
    'Registrar tratamento clínico',
    'Registrar retorno ao cio',
  ];
};

// 🔍 Verifica se existem registros reprodutivos armazenados para o animal
export const possuiDadosReprodutivos = async (animal) => {
  const num = animal?.numero;
  if (!num) return false;
  const temParto =
    (Array.isArray(animal.partos) && animal.partos.length > 0) ||
    !!animal.ultimoParto;

  const temProtocolo = !!animal.protocoloAtivo;

  const temPrenhez = (animal.statusReprodutivo || '').toLowerCase() === 'prenhe';

  return temParto || temProtocolo || temPrenhez;
};

// ✅ Filtra animais com status reprodutivo ativo e que possuam algum registro
export const filtrarAnimaisAtivos = async (animais) => {
  const res = [];
  for (const a of animais || []) {
    const status = (a.statusReprodutivo || '').toLowerCase();
    if (['seca', 'vendida', 'inativo'].includes(status)) continue;
    if (await possuiDadosReprodutivos(a)) res.push(a);
  }
  return res;
};

// ✅ Conta implantes em estoque com base no uso
export const contarEstoqueImplantes = async (uso) => {
  const implantes = await buscarTodos('implantes');
  return (implantes || []).filter(
    (i) => String(i.uso) === String(uso) && !i.emUsoPor
  ).length;
};

// ✅ Registra aviso simples no sistema
export const registrarAvisoInicial = async (msg) => {
  await adicionarItem('avisos', { msg, data: new Date().toISOString() });
  window.dispatchEvent(new Event('avisosAtualizados'));
};

// ✅ Registra aviso quando faltar produto hormonal
export const criarAvisoEstoqueFaltando = ({
  principioAtivo,
  vaca,
  protocoloId,
  quantidadeNecessaria,
}) => {
  (async () => {
    const msg = `Estoque insuficiente para aplicação de ${principioAtivo}.`;
    await adicionarItem('avisos', { msg, data: new Date().toISOString() });
  })();
  window.dispatchEvent(new Event('avisosAtualizados'));
};

// ✅ Atualiza ou remove um implante do estoque conforme o uso
export const movimentarImplanteEstoque = async (uso, numeroAnimal) => {
  const implantes = await buscarTodos('implantes');
  const alvo = implantes.find(
    (i) =>
      String(i.uso) === String(uso) &&
      (!numeroAnimal || String(i.emUsoPor) === String(numeroAnimal))
  );
  if (alvo) {
    if (alvo.usosRestantes > 1) {
      const atual = parseInt(alvo.uso || '1');
      const dados = { ...alvo, usosRestantes: alvo.usosRestantes - 1, uso: String(atual + 1) };
      delete dados.emUsoPor;
      await atualizarItem('implantes', { id: alvo.id, ...dados });
    } else {
      await excluirItem('implantes', alvo.id);
    }
  }
};

export const alocarImplanteParaVaca = async (uso, numeroAnimal) => {
  const implantes = await buscarTodos('implantes');
  const alvo = (implantes || []).find((i) => String(i.uso) === String(uso) && !i.emUsoPor);
  if (!alvo) return false;
  await atualizarItem('implantes', { ...alvo, emUsoPor: numeroAnimal, id: alvo.id });
  return true;
};

// ✅ Remove protocolo ativo da vaca, tarefas e eventos associados
export const removerProtocoloDaVaca = async (numeroAnimal) => {
  // Remove do objeto da vaca
  const animais = await buscarTodos('animais');
  const alvo = (animais || []).find((a) => String(a.numero) === String(numeroAnimal));
  if (alvo && alvo.protocoloAtivo) {
    delete alvo.protocoloAtivo;
    await atualizarItem('animais', { id: alvo.id, ...alvo });
  }

  // Remove tarefas associadas a protocolo
  const tarefas = await buscarTodos('tarefas');
  for (const t of tarefas || []) {
    if (t.tipo === 'protocolo' && t.animalNumero === numeroAnimal) {
      await excluirItem('tarefas', t.id);
    }
  }

  // Remove eventos do calendário associados
  const eventos = await buscarTodos('eventosReproducao');
  for (const e of eventos || []) {
    if (
      e.protocoloId &&
      (e.vaca === numeroAnimal || String(e.vaca) === String(numeroAnimal))
    ) {
      await excluirItem('eventosReproducao', e.id);
    }
  }

  // Dispara evento global para recarregar painel/calendário
  window.dispatchEvent(new Event('registroReprodutivoAtualizado'));
};
