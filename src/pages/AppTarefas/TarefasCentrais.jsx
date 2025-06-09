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

export default function TarefasCentrais() {
  const [tarefas, setTarefas] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState(() => new Date().toISOString().split('T')[0]);
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
      const existe = produtos.some((p) => tarefa.descricao.toLowerCase().includes((p.nomeComercial || '').toLowerCase()));
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

  const tarefasDoDia = tarefas.filter((t) => t.data === dataSelecionada && t.status === 'pendente');
  const atrasadas = tarefas.filter((t) => t.status === 'atrasado');
  const feitas = tarefas.filter((t) => t.status === 'feito');

  return (
    <div className="bg-white rounded-xl shadow p-4 max-w-xl w-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold">📋 Tarefas</h3>
        <input
          type="date"
          className="border rounded px-2 py-1 text-sm"
          value={dataSelecionada}
          onChange={(e) => setDataSelecionada(e.target.value)}
        />
      </div>
      <ul className="space-y-2">
        {tarefasDoDia.length === 0 ? (
          <li className="text-gray-500 italic">Nenhuma tarefa para esta data.</li>
        ) : (
          tarefasDoDia.map((t) => (
            <li key={t.id} className="flex justify-between items-center bg-gray-50 rounded-md p-2 shadow">
              <span className="text-sm">{t.descricao}</span>
              {t.status === 'pendente' && (
                <button className="text-green-600 text-sm" onClick={() => concluirTarefa(t.id)}>
                  ✅ Concluir
                </button>
              )}
            </li>
          ))
        )}
      </ul>
      <div className="flex gap-4 mt-4 text-sm">
        <button className="text-yellow-700 hover:underline" onClick={() => setShowAtrasadas(true)}>
          ⚠️ Atrasadas ({atrasadas.length})
        </button>
        <button className="text-blue-700 hover:underline" onClick={() => setShowFeitas(true)}>
          📁 Histórico ({feitas.length})
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
