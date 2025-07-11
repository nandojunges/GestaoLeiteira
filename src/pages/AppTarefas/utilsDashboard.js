// src/pages/AppTarefas/utilsDashboard.js
import { calcularDEL } from '../Animais/utilsAnimais';
import { getStatusVaca, obterAjustePEV } from '../Reproducao/utilsReproducao';
import gerarEventosCalendario from '@/utils/gerarEventosCalendario';
import {
  calcularConsumoDiario,
  calcularDemandaProtocolos,
} from '../../utils/verificarAlertaEstoque';
import {
  buscarTodos,
  adicionarItem,
  atualizarItem,
  excluirItem
} from '../../utils/backendApi';
import { buscarAnimais } from '../../utils/apiFuncoes.js';

export function parseDate(d) {
  if (!d) return null;
  const [dia, mes, ano] = d.split('/');
  return new Date(ano, mes - 1, dia);
}



export async function getAlertasCriticos() {
  const hoje = new Date();
  const alertas = [];

  const carencias = await buscarTodos('alertasCarencia');
  carencias.forEach((a) => {
    const dl = parseDate(a.leiteAte);
    if (dl && dl >= hoje)
      alertas.push({ mensagem: `Vaca ${a.numeroAnimal} em carência de leite até ${a.leiteAte}` });
    const dc = parseDate(a.carneAte);
    if (dc && dc >= hoje)
      alertas.push({ mensagem: `Vaca ${a.numeroAnimal} em carência de carne até ${a.carneAte}` });
  });

  const produtos = await buscarTodos('estoque');
  const arrProd = Array.isArray(produtos) ? produtos : [];
  arrProd.forEach((p) => {
    if (p.validade) {
      const dv = parseDate(p.validade);
      const diff = Math.ceil((dv - hoje) / (1000 * 60 * 60 * 24));
      if (!isNaN(diff)) {
        if (diff < 0) {
          alertas.push({ mensagem: `Produto ${p.nomeComercial} está vencido desde ${p.validade}. Ação imediata recomendada.` });
        } else if (diff <= 30) {
          alertas.push({ mensagem: `Produto ${p.nomeComercial} vence em ${p.validade}. Verificar uso ou substituição.` });
        }
      }
    }
    if (p.alertaEstoque)
      alertas.push({ mensagem: `${p.nomeComercial} - ${p.alertaEstoque}` });
  });

  const avisos = await buscarTodos('avisos');
  avisos.forEach((a) => alertas.push({ mensagem: a.msg }));

  const animais = await buscarAnimais();
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

export async function contagemStatusVacas() {
  const animais = await buscarAnimais();
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

export async function diagnosticosPorStatus() {
  const animais = await buscarAnimais();
  const prenhes = animais.filter((a) => (a.statusReprodutivo || '').toLowerCase() === 'prenhe').length;
  const negativas = animais.filter((a) => (a.diagnosticoGestacao || '').toLowerCase() === 'negativo').length;
  const nao = Math.max(0, animais.length - prenhes - negativas);
  return [
    { status: 'Prenhes', valor: prenhes },
    { status: 'Negativas', valor: negativas },
    { status: 'Não diag.', valor: nao },
  ];
}

export async function volumeLeitePorGrupo() {
  const inicio = new Date();
  inicio.setDate(1);
  const hoje = new Date();
  const grupos = {};

  const medicoes = await buscarTodos('medicaoLeite');
  medicoes.forEach((m) => {
    const data = new Date(m.data || m.id);
    if (data >= inicio && data <= hoje) {
      const dados = m.dados || {};
      Object.values(dados).forEach((d) => {
        const grupo = d.loteSugerido || d.lote || '—';
        const total = parseFloat(d.total || 0);
        grupos[grupo] = (grupos[grupo] || 0) + total;
      });
    }
  });

  return Object.entries(grupos).map(([grupo, litros]) => ({ grupo, litros: Number(litros.toFixed(1)) }));
}

export async function consumoPorCategoria() {
  const produtos = await buscarTodos('estoque');
  const lista = Array.isArray(produtos) ? produtos : [];
  const categorias = {};
  lista.forEach((p) => {
    if (p.categoria) {
      categorias[p.categoria] = (categorias[p.categoria] || 0) + parseFloat(p.quantidade || 0);
    }
  });
  return Object.entries(categorias).map(([categoria, quantidade]) => ({ categoria, quantidade }));
}

export async function eventosDeHoje() {
  const hoje = new Date().toISOString().split('T')[0];
  const auto = await gerarEventosCalendario();
  const extras = await buscarTodos('eventosExtras');
  const prot = (await buscarTodos('eventosCalendario')).map((e) => ({ ...e, date: e.data }));

  const animais = await buscarAnimais();
  const etapas = [];
  animais.forEach((a) => {
    if (a.protocoloAtivo && a.protocoloAtivo.status === 'ativo') {
      (a.protocoloAtivo.etapasProgramadas || []).forEach((et) => {
        if (et.data === hoje) {
          etapas.push({
            title: `${et.acao}${et.subtipo ? ' — ' + et.subtipo : ''} (Vaca ${a.numero})`,
            date: et.data,
            tipo: 'protocolo',
            vaca: a.numero,
            acao: et.acao,
            principioAtivo: et.subtipo,
            status: et.status,
            prioridadeVisual: true,
          });
        }
      });
    }
  });

  const todos = [...auto, ...extras, ...prot, ...etapas];
  return todos.filter((ev) => (ev.date || ev.data) === hoje);
}

export async function resumoEventosHoje() {
  const eventos = await eventosDeHoje();
  const resumo = { partos: 0, vacinacoes: 0, secagens: 0 };
  eventos.forEach((ev) => {
    if (ev.tipo === 'parto') resumo.partos += 1;
    else if (ev.tipo === 'vacina') resumo.vacinacoes += 1;
    else if (ev.tipo === 'secagem') resumo.secagens += 1;
  });
  return resumo;
}

export async function eventosDoMes() {
  const todos = [
    ...(await gerarEventosCalendario()),
    ...((await buscarTodos('eventosCalendario')).map(e => ({ ...e, date: e.data })))
  ];
  const hoje = new Date();
  const mes = hoje.getMonth();
  const ano = hoje.getFullYear();
  return todos
    .filter((ev) => {
      const d = new Date(ev.date);
      return d.getMonth() === mes && d.getFullYear() === ano;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

export async function producaoLeiteUltimos7Dias() {
  const hoje = new Date();
  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - i);
    dias.push(d.toISOString().split('T')[0]);
  }
  const medicoes = await buscarTodos('medicaoLeite');
  return dias.map((data) => {
    const registro = medicoes.find(m => (m.id || m.data) === data) || {};
    const total = Object.values(registro.dados || {}).reduce(
      (acc, val) => acc + parseFloat(val.total || 0),
      0
    );
    return { data, total: Number(total.toFixed(1)) };
  });
}

export async function produtosVencendo() {
  const hoje = new Date();
  const limite = new Date();
  limite.setDate(limite.getDate() + 7);
  const produtos = await buscarTodos('estoque');
  const lista = Array.isArray(produtos) ? produtos : [];
  return lista.filter((p) => {
    const dv = parseDate(p.validade);
    return dv && dv >= hoje && dv <= limite;
  });
}

export async function consumoVsEstoque() {
  const produtos = await buscarTodos('estoque');
  const lista = Array.isArray(produtos) ? produtos : [];
  return lista.map((p) => ({
    produto: p.nomeComercial,
    estoque: parseFloat(p.quantidade || 0),
    consumoDiario: calcularConsumoDiario(p.nomeComercial, p.unidade),
  }));
}

export async function consumoPorProtocolo() {
  const produtos = await buscarTodos('estoque');
  const listaProd = Array.isArray(produtos) ? produtos : [];
  return listaProd
    .map((p) => ({
      produto: p.nomeComercial,
      demanda: calcularDemandaProtocolos(p.nomeComercial),
    }))
    .filter((p) => p.demanda > 0);
}
