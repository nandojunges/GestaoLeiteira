import React, { useEffect, useState } from 'react';

export default function TarefasDiarias() {
  const [tarefas, setTarefas] = useState([]);
  const [atrasadas, setAtrasadas] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const hoje = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const carregar = () => {
      const dados = JSON.parse(localStorage.getItem('tarefasDiarias') || '{}');
      const porData = dados.tarefasPorData || {};
      let listaAtrasadas = dados.tarefasAtrasadas || [];
      Object.keys(porData).forEach((data) => {
        if (data < hoje) {
          listaAtrasadas = listaAtrasadas.concat(
            (porData[data] || []).filter((t) => !t.concluida)
          );
          delete porData[data];
        }
      });
      const doDia = porData[hoje] || [];
      setTarefas(doDia);
      setAtrasadas(listaAtrasadas);
      setHistorico(dados.tarefasConcluidas || []);
      localStorage.setItem(
        'tarefasDiarias',
        JSON.stringify({
          tarefasPorData: porData,
          tarefasConcluidas: dados.tarefasConcluidas || [],
          tarefasAtrasadas: listaAtrasadas,
        })
      );
    };

    carregar();
    window.addEventListener('tarefasAtualizadas', carregar);
    return () => window.removeEventListener('tarefasAtualizadas', carregar);
  }, [hoje]);

  const salvar = (dados) => {
    localStorage.setItem('tarefasDiarias', JSON.stringify(dados));
    window.dispatchEvent(new Event('tarefasAtualizadas'));
  };

  const concluirTarefa = (tarefa) => {
    const dados = JSON.parse(localStorage.getItem('tarefasDiarias') || '{}');
    const porData = dados.tarefasPorData || {};
    const concluidas = dados.tarefasConcluidas || [];

    porData[hoje] = (porData[hoje] || []).filter((t) => t.id !== tarefa.id);
    tarefa.concluida = true;
    concluidas.push(tarefa);

    if (tarefa.tipo === 'estoque') {
      const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
      const nome = (tarefa.produto || '').toLowerCase();
      const ok = produtos.some((p) =>
        (p.nomeComercial || '').toLowerCase().includes(nome)
      );
      if (!ok) alert('Produto ainda não foi adicionado ao estoque!');
    }

    salvar({
      tarefasPorData: porData,
      tarefasConcluidas: concluidas,
      tarefasAtrasadas: dados.tarefasAtrasadas || [],
    });
  };

  const remarcarHoje = (tarefa) => {
    const dados = JSON.parse(localStorage.getItem('tarefasDiarias') || '{}');
    const porData = dados.tarefasPorData || {};
    const atras = (dados.tarefasAtrasadas || []).filter((t) => t.id !== tarefa.id);
    porData[hoje] = [...(porData[hoje] || []), tarefa];
    salvar({
      tarefasPorData: porData,
      tarefasConcluidas: dados.tarefasConcluidas || [],
      tarefasAtrasadas: atras,
    });
  };

  const toggleHistorico = () => setMostrarHistorico((v) => !v);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">📌 Tarefas do Dia</h2>

      {tarefas.length === 0 && (
        <p className="text-gray-500 italic">Nenhuma tarefa para hoje.</p>
      )}

      {tarefas.map((tarefa, i) => (
        <div
          key={i}
          className="flex justify-between items-center border-b border-gray-100 py-2"
        >
          <span>{tarefa.texto}</span>
          <button
            onClick={() => concluirTarefa(tarefa)}
            className="bg-blue-600 text-white font-semibold rounded px-3 py-1 hover:bg-blue-700"
          >
            Concluir
          </button>
        </div>
      ))}

      {atrasadas.length > 0 && (
        <div className="mt-6">
          <h3 className="text-red-600 font-semibold mb-2">⚠️ Atrasadas</h3>
          {atrasadas.map((t, i) => (
            <div
              key={i}
              className="flex justify-between items-center text-sm text-red-700"
            >
              <span>{t.texto}</span>
              <button
                onClick={() => remarcarHoje(t)}
                className="text-blue-500 font-semibold hover:underline"
              >
                Remarcar
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={toggleHistorico}
          className="text-sm text-gray-600 hover:underline"
        >
          {mostrarHistorico ? '🔙 Ocultar Histórico' : '🕓 Ver Histórico'}
        </button>
        {mostrarHistorico && (
          <ul className="mt-2 text-green-600 text-sm list-disc pl-5">
            {historico.map((h, i) => (
              <li key={i}>✅ {h.texto}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
