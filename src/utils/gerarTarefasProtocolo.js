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

    if (etapa.acaoDispositivo) {
      tarefas.push({
        id: `d-${idx}-${data}`,
        tipo: 'Manejo de Dispositivo',
        data,
        descricao:
          etapa.acaoDispositivo === 'Inserir'
            ? 'Inserir dispositivo'
            : 'Retirar dispositivo',
        status: 'pendente',
      });
    }
  });

  localStorage.setItem('tarefasDia', JSON.stringify(tarefas));
  window.dispatchEvent(new Event('tarefasAtualizadas'));
}
