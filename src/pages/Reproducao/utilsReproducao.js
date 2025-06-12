import { calcularDEL } from '../Animais/utilsAnimais';

export const carregarAnimaisReprodutivos = () => {
  const animais = JSON.parse(localStorage.getItem('animais') || '[]');

  const hoje = new Date();

  const liberadas = animais.filter(vaca => {
    const ultimaIA = new Date(vaca.ultimaIA || 0);
    const diasDesdeUltimaIA = Math.ceil((hoje - ultimaIA) / (1000 * 60 * 60 * 24));
    return diasDesdeUltimaIA > 45; // exemplo configurável
  });

  return { liberadas };
};

// 🔧 PEV configurado (dias). Se não existir no localStorage, assume 45 dias
export const obterAjustePEV = () => {
  const cfg = JSON.parse(localStorage.getItem('configPEV') || '{}');
  return parseInt(cfg.diasPEV) || 45;
};

// ✅ Determina se a vaca está liberada ou ainda no PEV de acordo com o DEL
export const getStatusVaca = (del) => {
  const ajustePEV = obterAjustePEV();
  return del >= ajustePEV ? 'Liberada' : 'No PEV';
};

// Filtra animais conforme status e intervalo de DEL
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
export const possuiDadosReprodutivos = (animal) => {
  const num = animal?.numero;
  if (!num) return false;

  const temParto = !!localStorage.getItem(`parto_${num}`) ||
    (Array.isArray(animal.partos) && animal.partos.length > 0) ||
    !!animal.ultimoParto;

  const temProtocolo = !!localStorage.getItem(`protocolo_${num}`) || !!animal.protocoloAtivo;

  const temPrenhez = !!localStorage.getItem(`prenhez_${num}`) ||
    (animal.statusReprodutivo || '').toLowerCase() === 'prenhe';

  return temParto || temProtocolo || temPrenhez;
};

// ✅ Filtra animais com status reprodutivo ativo e que possuam algum registro
export const filtrarAnimaisAtivos = (animais) => {
  return (animais || []).filter((a) => {
    const status = (a.statusReprodutivo || '').toLowerCase();
    if (['seca', 'vendida', 'inativo'].includes(status)) return false;
    return possuiDadosReprodutivos(a);
  });
};

export const contarEstoqueImplantes = (uso) => {
  const implantes = JSON.parse(localStorage.getItem('implantes') || '[]');
  return implantes.filter((i) => String(i.uso) === String(uso)).length;
};

export const registrarAvisoInicial = (msg) => {
  const avisos = JSON.parse(localStorage.getItem('avisos') || '[]');
  localStorage.setItem(
    'avisos',
    JSON.stringify([...avisos, { msg, data: new Date().toISOString() }])
  );
  window.dispatchEvent(new Event('avisosAtualizados'));
};

export const movimentarImplanteEstoque = (uso) => {
  const implantes = JSON.parse(localStorage.getItem('implantes') || '[]');
  const idx = implantes.findIndex((i) => String(i.uso) === String(uso));
  if (idx !== -1) {
    if (uso === '1') implantes[idx].uso = '2';
    else if (uso === '2') implantes[idx].uso = '3';
    else implantes.splice(idx, 1);
    localStorage.setItem('implantes', JSON.stringify(implantes));
  }
};
