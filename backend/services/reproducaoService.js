const Tarefas = require('../models/tarefasModel');
const Estoque = require('../models/estoqueModel');
/**
 * Serviço responsável por acionar outras funcionalidades (tarefas, estoque, etc.)
 * quando uma inseminação ou diagnóstico reprodutivo é registrado.
 * Exemplo: agenda uma tarefa de checagem futura e deduz itens do estoque.
 */
function handleReproducao(db, dados, idProdutor) {
  // Agenda uma tarefa de checar gestação 30 dias após a data informada
  if (dados.data) {
    const checkDate = new Date(dados.data);
    checkDate.setDate(checkDate.getDate() + 30);
    Tarefas.create(
      db,
      {
        descricao: `Checar gestação do animal ${dados.numero}`,
        data: checkDate.toISOString().slice(0, 10),
        concluida: false,
      },
      idProdutor,
    );
  }
  // Deduz do estoque os itens utilizados no protocolo (se fornecidos)
  if (Array.isArray(dados.itensUsados)) {
    dados.itensUsados.forEach((itemUso) => {
      const current = Estoque.getById(db, itemUso.idItem, idProdutor);
      if (current) {
        const novaQtd = current.quantidade - itemUso.quantidade;
        Estoque.update(
          db,
          current.id,
          {
            item: current.item,
            quantidade: novaQtd < 0 ? 0 : novaQtd,
            unidade: current.unidade,
          },
          idProdutor,
        );
      }
    });
  }
}

module.exports = { handleReproducao };

