import { addDays } from 'date-fns';

export default function gerarTarefasProtocolo(protocolo, animaisSelecionados) {
  const tarefas = [];
  protocolo.etapas.forEach((etapa) => {
    const dataExecucao = addDays(new Date(), etapa.dia);
    const qtdAnimais = animaisSelecionados.length;

    Object.entries(etapa.hormônios || {}).forEach(([id, cfg]) => {
      if (!cfg.ativo) return;
      const qtdNecessaria = (parseFloat(cfg.dose) || 0) * qtdAnimais;
      const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
      const candidatos = produtos.filter((p) => p.principioAtivo === id);
      const totalDisponivel = candidatos.reduce(
        (soma, p) => soma + (parseFloat(p.volume) || 0),
        0
      );
      tarefas.push({
        tipo: 'Aplicação Hormonal',
        data: dataExecucao.toISOString().slice(0, 10),
        descricao: `${id.toUpperCase()} – aplicar ${cfg.dose} mL em ${qtdAnimais} animal(is)`,
        produtos: candidatos.map((p) => p.nomeComercial),
        qtdNecessaria,
        qtdDisponivel: totalDisponivel,
        pendenteReposicao: totalDisponivel < qtdNecessaria,
        faltando: Math.max(0, qtdNecessaria - totalDisponivel),
      });
    });
  });
  localStorage.setItem('tarefasDia', JSON.stringify(tarefas));
  window.dispatchEvent(new Event('tarefasAtualizadas'));
}
