import React from 'react';

export default function CardReposicao({ tarefa, onComprar }) {
  return (
    <div className="card-alerta border-red-500 p-4 rounded-lg shadow">
      <h3 className="font-bold mb-1">Reposição necessária</h3>
      <p>{tarefa.descricao}</p>
      <p className="text-sm text-red-600">
        Faltando {tarefa.faltando} mL · Produtos: {tarefa.produtos.join(', ') || 'nenhum'}
      </p>
      <button className="btn-secundario mt-2" onClick={() => onComprar?.(tarefa)}>
        Comprar produto
      </button>
    </div>
  );
}
