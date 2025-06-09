import React, { useEffect, useState } from 'react';

function ModalLista({ titulo, tarefas, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-xl max-w-md w-full">
        <h3 className="text-lg font-bold mb-2">{titulo}</h3>
        {tarefas.length === 0 ? (
          <p className="text-gray-500 italic">Nenhuma tarefa.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1 max-h-60 overflow-auto">
            {tarefas.map((t) => (
              <li key={t.id}>{t.descricao}</li>
            ))}
          </ul>
        )}
        <div className="text-right mt-4">
          <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CardTarefasDoDia() {
  const [tarefas, setTarefas] = useState([]);
  const [showAtrasadas, setShowAtrasadas] = useState(false);
  const [showFeitas, setShowFeitas] = useState(false);

  useEffect(() => {
    const hoje = new Date().toISOString().split('T')[0];
    let lista = JSON.parse(localStorage.getItem('tarefas') || '[]');
    let mudou = false;
    lista = lista.map((t) => {
      if (t.status === 'pendente' && t.data < hoje) {
        mudou = true;
        return { ...t, status: 'atrasado' };
      }
      return t;
    });
    if (mudou) localStorage.setItem('tarefas', JSON.stringify(lista));
    setTarefas(lista);
  }, []);

  const concluirTarefa = (id) => {
    let lista = [...tarefas];
    const idx = lista.findIndex((t) => t.id === id);
    if (idx === -1) return;
    const tarefa = lista[idx];
    if (tarefa.tipo === 'estoque') {
      const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
      const existe = produtos.some((p) =>
        tarefa.descricao.toLowerCase().includes((p.nomeComercial || '').toLowerCase())
      );
      if (existe) {
        lista.splice(idx, 1);
      } else {
        lista[idx] = { ...tarefa, status: 'feito' };
      }
    } else {
      lista[idx] = { ...tarefa, status: 'feito' };
    }
    localStorage.setItem('tarefas', JSON.stringify(lista));
    setTarefas(lista);
  };

  const hoje = new Date().toISOString().split('T')[0];
  const pendentesHoje = tarefas.filter((t) => t.status === 'pendente' && t.data === hoje);
  const atrasadas = tarefas.filter((t) => t.status === 'atrasado');
  const feitas = tarefas.filter((t) => t.status === 'feito');

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">\u{1F4CC} Tarefas do Dia</h3>
        <div className="text-sm space-x-2">
          <span>\u{1F7E1} {pendentesHoje.length}</span>
          <span>\u{1F534} {atrasadas.length}</span>
          <span>\u{2705} {feitas.length}</span>
        </div>
      </div>
      <ul className="space-y-2">
        {pendentesHoje.length === 0 ? (
          <li className="text-gray-500 italic">Nenhuma tarefa para hoje.</li>
        ) : (
          pendentesHoje.map((t) => (
            <li key={t.id} className="flex justify-between items-center bg-gray-50 rounded-md p-2 shadow">
              <span className="text-sm">{t.descricao}</span>
              {t.status === 'pendente' && (
                <button className="text-green-600 text-sm" onClick={() => concluirTarefa(t.id)}>
                  \u2714\uFE0F Concluir
                </button>
              )}
            </li>
          ))
        )}
      </ul>
      <div className="flex gap-4 mt-4">
        <button className="text-yellow-700 hover:underline" onClick={() => setShowAtrasadas(true)}>
          \u26A0\uFE0F Ver Atrasadas
        </button>
        <button className="text-blue-700 hover:underline" onClick={() => setShowFeitas(true)}>
          \u{1F4C1} Histórico
        </button>
      </div>
      {showAtrasadas && (
        <ModalLista titulo="Tarefas Atrasadas" tarefas={atrasadas} onClose={() => setShowAtrasadas(false)} />
      )}
      {showFeitas && (
        <ModalLista titulo="Histórico de Tarefas" tarefas={feitas} onClose={() => setShowFeitas(false)} />
      )}
    </div>
  );
}
