// src/pages/AppTarefas/utilsDashboard.js
import { calcularDEL } from '../Animais/utilsAnimais';
import { getStatusVaca, obterAjustePEV } from '../Reproducao/utilsReproducao';
import gerarEventosCalendario from '../../utils/gerarEventosCalendario';
import {
  calcularConsumoDiario,
  calcularDemandaProtocolos,
} from '../../utils/verificarAlertaEstoque';

export function parseDate(d) {
  if (!d) return null;
  const [dia, mes, ano] = d.split('/');
  return new Date(ano, mes - 1, dia);
}

export function getAlertasCriticos() {
  const hoje = new Date();
  const alertas = [];

  const carencias = JSON.parse(localStorage.getItem('alertasCarencia') || '[]');
  carencias.forEach((a) => {
    const dl = parseDate(a.leiteAte);
    if (dl && dl >= hoje)
      alertas.push({ mensagem: `Vaca ${a.numeroAnimal} em carência de leite até ${a.leiteAte}` });
    const dc = parseDate(a.carneAte);
    if (dc && dc >= hoje)
      alertas.push({ mensagem: `Vaca ${a.numeroAnimal} em carência de carne até ${a.carneAte}` });
  });

  const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
  produtos.forEach((p) => {
    if (p.validade) {
      const dv = parseDate(p.validade);
      const diff = Math.ceil((dv - hoje) / (1000 * 60 * 60 * 24));
      if (!isNaN(diff) && diff >= 0 && diff <= 30)
        alertas.push({ mensagem: `Produto ${p.nomeComercial} vence em ${diff} dias` });
    }
    if (p.alertaEstoque)
      alertas.push({ mensagem: `${p.nomeComercial} - ${p.alertaEstoque}` });
  });

  const animais = JSON.parse(localStorage.getItem('animais') || '[]');
  const diasPEV = obterAjustePEV();
  animais.forEach((v) => {
    if (v.ultimoParto) {
      const del = calcularDEL(v.ultimoParto);
      if (getStatusVaca(del) !== 'Liberada' && del > diasPEV) {
        alertas.push({ mensagem: `Vaca ${v.numero} em PEV há ${del} dias` });
      }
    }
  });

  return alertas;
}

export function contagemStatusVacas() {
  const animais = JSON.parse(localStorage.getItem('animais') || '[]');
  const lactacao = animais.filter((v) => v.status === 'lactacao').length;
  const diasPEV = obterAjustePEV();
  let pev = 0;
  let negativas = 0;
  let preParto = 0;

  animais.forEach((v) => {
    if (v.ultimoParto) {
      const del = calcularDEL(v.ultimoParto);
      if (getStatusVaca(del) !== 'Liberada') pev += 1;
      const pp = parseDate(v.dataPrevistaParto);
      if (pp && pp > new Date() && pp - new Date() < 60 * 24 * 60 * 60 * 1000)
        preParto += 1;
      const diag = (v.diagnosticoGestacao || '').toLowerCase();
      if (diag === 'negativo') negativas += 1;
    }
  });

  return { lactacao, pev, negativas, preParto };
}

export function diagnosticosPorStatus() {
  const animais = JSON.parse(localStorage.getItem('animais') || '[]');
  const prenhes = animais.filter((a) => (a.statusReprodutivo || '').toLowerCase() === 'prenhe').length;
  const negativas = animais.filter((a) => (a.diagnosticoGestacao || '').toLowerCase() === 'negativo').length;
  const nao = Math.max(0, animais.length - prenhes - negativas);
  return [
    { status: 'Prenhes', valor: prenhes },
    { status: 'Negativas', valor: negativas },
    { status: 'Não diag.', valor: nao },
  ];
}

export function volumeLeitePorGrupo() {
  const inicio = new Date();
  inicio.setDate(1);
  const hoje = new Date();
  const grupos = {};

  Object.keys(localStorage).forEach((k) => {
    if (k.startsWith('medicaoLeite_')) {
      const data = new Date(k.replace('medicaoLeite_', ''));
      if (data >= inicio && data <= hoje) {
        const registro = JSON.parse(localStorage.getItem(k) || '{}');
        const dados = registro.dados || {};
        Object.values(dados).forEach((d) => {
          const grupo = d.loteSugerido || d.lote || '—';
          const total = parseFloat(d.total || 0);
          grupos[grupo] = (grupos[grupo] || 0) + total;
        });
      }
    }
  });

  return Object.entries(grupos).map(([grupo, litros]) => ({ grupo, litros: Number(litros.toFixed(1)) }));
}

export function consumoPorCategoria() {
  const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
  const categorias = {};
  produtos.forEach((p) => {
    if (p.categoria) {
      categorias[p.categoria] = (categorias[p.categoria] || 0) + parseFloat(p.quantidade || 0);
    }
  });
  return Object.entries(categorias).map(([categoria, quantidade]) => ({ categoria, quantidade }));
}

export function eventosDeHoje() {
  const hoje = new Date().toISOString().split('T')[0];
  const auto = gerarEventosCalendario();
  const extras = JSON.parse(localStorage.getItem('eventosExtras') || '[]');
  const todos = [...auto, ...extras];
  return todos.filter((ev) => ev.date === hoje);
}

export function resumoEventosHoje() {
  const eventos = eventosDeHoje();
  const resumo = { partos: 0, vacinacoes: 0, secagens: 0 };
  eventos.forEach((ev) => {
    if (ev.tipo === 'parto') resumo.partos += 1;
    else if (ev.tipo === 'vacina') resumo.vacinacoes += 1;
    else if (ev.tipo === 'secagem') resumo.secagens += 1;
  });
  return resumo;
}

export function produtosVencendo() {
  const hoje = new Date();
  const limite = new Date();
  limite.setDate(limite.getDate() + 7);
  const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
  return produtos.filter((p) => {
    const dv = parseDate(p.validade);
    return dv && dv >= hoje && dv <= limite;
  });
}

export function consumoVsEstoque() {
  const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
  return produtos.map((p) => ({
    produto: p.nomeComercial,
    estoque: parseFloat(p.quantidade || 0),
    consumoDiario: calcularConsumoDiario(p.nomeComercial, p.unidade),
  }));
}

export function consumoPorProtocolo() {
  const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
  return produtos
    .map((p) => ({
      produto: p.nomeComercial,
      demanda: calcularDemandaProtocolos(p.nomeComercial),
    }))
    .filter((p) => p.demanda > 0);
}
