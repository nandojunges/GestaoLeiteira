import verificarAlertaEstoque from './verificarAlertaEstoque';
import { eventosDeHoje } from '../pages/AppTarefas/utilsDashboard';

function parseData(data) {
  if (!data) return null;
  if (data.includes('-')) return new Date(data);
  const [d, m, y] = data.split('/');
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

export default function gerarTarefasAutomaticas() {
  const hojeISO = new Date().toISOString().slice(0, 10);
  const hoje = new Date(hojeISO);
  let tarefas = JSON.parse(localStorage.getItem('tarefas') || '[]');

  const adicionar = (id, descricao, tipo) => {
    if (!tarefas.some((t) => t.id === id)) {
      tarefas.push({ id, data: hojeISO, descricao, tipo, status: 'pendente' });
    }
  };

  // Tratamentos registrados
  const tratamentos = JSON.parse(localStorage.getItem('tratamentos') || '[]');
  tratamentos.forEach((tr, idx) => {
    const inicio = parseData(tr.dataInicio || tr.data);
    if (!inicio) return;
    const dur = parseInt(tr.duracao) || 1;
    for (let i = 0; i < dur; i++) {
      const d = new Date(inicio);
      d.setDate(d.getDate() + i);
      if (d.toDateString() === hoje.toDateString()) {
        const id = `trat-${idx}-${i}-${hojeISO}`;
        adicionar(id, `Aplicar ${tr.produto} na Vaca ${tr.numeroAnimal}`, 'tratamento');
      }
    }
  });

  // Alertas de carência
  const carencias = JSON.parse(localStorage.getItem('alertasCarencia') || '[]');
  carencias.forEach((c, idx) => {
    const leite = parseData(c.leiteAte);
    const carne = parseData(c.carneAte);
    if (leite && leite >= hoje) {
      const id = `car-leite-${c.numeroAnimal}-${idx}-${hojeISO}`;
      adicionar(id, `Carência da Vaca ${c.numeroAnimal} até ${c.leiteAte} (leite)`, 'carencia');
    }
    if (carne && carne >= hoje) {
      const id = `car-carne-${c.numeroAnimal}-${idx}-${hojeISO}`;
      adicionar(id, `Carência da Vaca ${c.numeroAnimal} até ${c.carneAte} (carne)`, 'carencia');
    }
  });

  // Alertas de estoque
  const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
  produtos.forEach((p) => {
    const alerta = verificarAlertaEstoque(p);
    const id = `estoque-${p.nomeComercial}`;
    if (alerta.status !== 'ok') {
      adicionar(id, `Comprar mais ${p.nomeComercial} (Estoque Crítico)`, 'estoque');
    } else {
      tarefas = tarefas.filter((t) => t.id !== id);
    }
  });

  // Validade de produtos
  const diasAlerta = parseInt(localStorage.getItem('diasAlertaValidade') || '10');
  produtos.forEach((p) => {
    if (!p.validade) return;
    const dv = parseData(p.validade);
    if (!dv) return;
    const diff = Math.ceil((dv - hoje) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff <= diasAlerta) {
      const id = `venc_prod_${p.nomeComercial}`;
      adicionar(id, `Validade próxima: ${p.nomeComercial} vence em ${p.validade}`, 'validade');
    }
  });

  // Eventos do dia (partos, vacinas etc.)
  eventosDeHoje().forEach((ev, i) => {
    const id = `evento-${i}-${hojeISO}`;
    adicionar(id, ev.title, 'evento');
  });

  localStorage.setItem('tarefas', JSON.stringify(tarefas));
}
