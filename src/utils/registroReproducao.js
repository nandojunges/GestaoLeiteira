import { addDays } from 'date-fns';
import { formatarDataBR } from '../pages/Animais/utilsAnimais';

export function carregarRegistro(numero) {
  const raw = localStorage.getItem(`registroReprodutivo_${numero}`);
  if (!raw) return { ocorrencias: [] };
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return { ocorrencias: parsed };
    return parsed || { ocorrencias: [] };
  } catch {
    return { ocorrencias: [] };
  }
}

export function salvarRegistro(numero, dados) {
  localStorage.setItem(`registroReprodutivo_${numero}`, JSON.stringify(dados));
}

export function adicionarOcorrencia(numero, ocorrencia) {
  const registro = carregarRegistro(numero);
  if (!Array.isArray(registro.ocorrencias)) registro.ocorrencias = [];
  registro.ocorrencias.push(ocorrencia);
  salvarRegistro(numero, registro);
  window.dispatchEvent(new Event('registroReprodutivoAtualizado'));
}

export function calcularProximaEtapa(protocolo, inicio) {
  if (!protocolo || !inicio) return null;
  const [d, m, a] = inicio.split('/');
  const dataBase = new Date(`${a}-${m}-${d}`);
  const hoje = new Date();
  const etapas = protocolo.etapas.sort((a, b) => a.dia - b.dia);
  for (const et of etapas) {
    const data = addDays(dataBase, et.dia);
    if (data >= hoje) {
      const nome = et.hormonio || et.acao || 'Etapa';
      return { nome, data: formatarDataBR(data) };
    }
  }
  return null;
}

export function calcularEtapasOcorrencia(ocorrencia) {
  if (!ocorrencia || !Array.isArray(ocorrencia.etapas)) {
    return { ultima: null, proxima: null };
  }

  const [d, m, a] = ocorrencia.data.split('/');
  const inicio = new Date(`${a}-${m}-${d}`);
  const hoje = new Date();
  const etapasOrdenadas = [...ocorrencia.etapas].sort((x, y) => x.dia - y.dia);

  let ultima = { tipo: ocorrencia.tipo, data: ocorrencia.data };
  let proxima = null;

  for (const et of etapasOrdenadas) {
    const dataEtapa = addDays(inicio, et.dia);
    const nome = et.acao || et.hormonio || 'Etapa';
    if (dataEtapa <= hoje) {
      ultima = { tipo: nome, data: formatarDataBR(dataEtapa) };
    } else if (!proxima) {
      proxima = { tipo: nome, dataPrevista: formatarDataBR(dataEtapa) };
    }
  }

  if (!proxima) proxima = { tipo: 'Protocolo concluído', dataPrevista: '—' };

  return { ultima, proxima };
}

export function listarAnimaisPorProtocolo(protocolId) {
  if (!protocolId) return [];
  const animais = JSON.parse(localStorage.getItem('animais') || '[]');
  return animais.reduce((acc, a) => {
    const registro = carregarRegistro(a.numero);
    const r = (registro.ocorrencias || []).find(t => t.protocoloId === protocolId && !t.concluido);
    if (r) acc.push({ numero: a.numero, nome: a.brinco || a.nome || '', dataInicio: r.data, status: r.concluido ? 'Concluído' : 'Em andamento' });
    return acc;
  }, []);
}
