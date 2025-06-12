import { addDays } from 'date-fns';

export default function gerarTarefasProtocolo(protocolo) {
  const tarefas = [];

  protocolo.etapas.forEach((etapa, idx) => {
    const data = addDays(new Date(), etapa.dia).toISOString().slice(0, 10);

    if (etapa.hormonio) {
      tarefas.push({
        id: `h-${idx}-${data}`,
        tipo: 'Aplicação Hormonal',
        data,
        descricao: `Aplicar ${etapa.hormonio}`,
        status: 'pendente',
      });
    }

    if (etapa.acao) {
      if (etapa.acao.includes('Dispositivo')) {
        tarefas.push({
          id: `d-${idx}-${data}`,
          tipo: 'Manejo de Dispositivo',
          data,
          descricao: etapa.acao,
          status: 'pendente',
        });
      } else if (etapa.acao === 'Inseminação') {
        tarefas.push({
          id: `i-${idx}-${data}`,
          tipo: 'Inseminação',
          data,
          descricao: 'Realizar inseminação',
          status: 'pendente',
        });
      }
    }
  });

  localStorage.setItem('tarefasDia', JSON.stringify(tarefas));
  window.dispatchEvent(new Event('tarefasAtualizadas'));
}
