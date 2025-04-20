import React, { useState, useEffect } from 'react';

function AppTarefas() {
  const [tarefas, setTarefas] = useState([]);
  const [novaTarefa, setNovaTarefa] = useState('');
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [historico, setHistorico] = useState({});

  const hoje = new Date().toISOString().slice(0, 10);
  const ontem = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const tarefasDeExemplo = {
    [ontem]: [
      { id: 101, texto: 'Aplicar ferro nas bezerras (ontem)', concluida: true, remarcavel: true },
      { id: 102, texto: 'Inseminar vaca 33 (ontem)', concluida: false, remarcavel: true },
      { id: 103, texto: 'Mocha da bezerra 11 (ontem)', concluida: true, remarcavel: false }
    ],
    [hoje]: [
      { id: 201, texto: 'Aplicar ferro nas bezerras', concluida: false, remarcavel: false },
      { id: 202, texto: 'Inseminar vaca 42', concluida: false, remarcavel: false },
      { id: 203, texto: 'Remover implante de vaca 15', concluida: false, remarcavel: true }
    ]
  };

  useEffect(() => {
    try {
      const dados = JSON.parse(localStorage.getItem('tarefasPorData'));
      const precisaResetar = !dados || typeof dados !== 'object';

      if (precisaResetar || !dados[hoje]) {
        localStorage.setItem('tarefasPorData', JSON.stringify(tarefasDeExemplo));
        setHistorico(tarefasDeExemplo);
        setTarefas(tarefasDeExemplo[hoje]);
      } else {
        setHistorico(dados);
        setTarefas(dados[hoje] || []);
      }
    } catch (e) {
      localStorage.setItem('tarefasPorData', JSON.stringify(tarefasDeExemplo));
      setHistorico(tarefasDeExemplo);
      setTarefas(tarefasDeExemplo[hoje]);
    }
  }, []);

  useEffect(() => {
    const novoHistorico = { ...historico, [hoje]: tarefas };
    setHistorico(novoHistorico);
    localStorage.setItem('tarefasPorData', JSON.stringify(novoHistorico));
  }, [tarefas]);

  const marcarComoConcluida = (id) => {
    const novas = tarefas.map((t) =>
      t.id === id ? { ...t, concluida: !t.concluida } : t
    );
    setTarefas(novas);
  };

  const adicionarTarefa = () => {
    if (!novaTarefa.trim()) return;
    const nova = {
      id: Date.now(),
      texto: novaTarefa,
      concluida: false,
      remarcavel: true,
    };
    setTarefas([...tarefas, nova]);
    setNovaTarefa('');
  };

  const remarcarTarefa = (data, tarefa) => {
    const novas = [...tarefas, { ...tarefa, concluida: false }];
    const novoHistorico = { ...historico };
    novoHistorico[data] = novoHistorico[data].filter((t) => t.id !== tarefa.id);
    novoHistorico[hoje] = novas;
    setHistorico(novoHistorico);
    setTarefas(novas);
    localStorage.setItem('tarefasPorData', JSON.stringify(novoHistorico));
  };

  const feitas = tarefas.filter((t) => t.concluida).length;

  return (
    <div style={{
      fontFamily: 'Poppins, sans-serif',
      backgroundColor: '#f3f4f6',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      paddingTop: '4rem'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '1rem',
        boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
        padding: '2rem',
        width: '100%',
        maxWidth: '500px',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: '800',
          textAlign: 'center',
          color: '#1e3a8a',
          marginBottom: '1rem'
        }}>
          🔔 Tarefas do Dia
        </h2>

        <p style={{
          textAlign: 'center',
          color: feitas === tarefas.length ? '#10b981' : '#374151',
          marginBottom: '1.5rem',
          fontWeight: '700'
        }}>
          ✅ {feitas} de {tarefas.length} tarefas concluídas
        </p>

        {tarefas.map((t) => (
          <div key={t.id} style={{
            backgroundColor: '#f1f5f9',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            marginBottom: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{
              textDecoration: t.concluida ? 'line-through' : 'none',
              color: t.concluida ? '#9ca3af' : '#111827',
              fontWeight: '600'
            }}>{t.texto}</span>
            <button onClick={() => marcarComoConcluida(t.id)} style={{
              backgroundColor: t.concluida ? '#10b981' : '#3b82f6',
              color: '#fff',
              border: 'none',
              padding: '0.4rem 0.75rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '700'
            }}>
              {t.concluida ? 'Concluída' : 'Concluir'}
            </button>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
          <input
            type="text"
            placeholder="Digite nova tarefa..."
            value={novaTarefa}
            onChange={(e) => setNovaTarefa(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && adicionarTarefa()}
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontWeight: '600'
            }}
          />
          <button onClick={adicionarTarefa} style={{
            backgroundColor: '#22c55e',
            color: '#fff',
            fontWeight: '700',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}>
            Adicionar
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button onClick={() => setMostrarHistorico(!mostrarHistorico)} style={{
            backgroundColor: '#e5e7eb',
            fontWeight: '700',
            color: '#111827',
            padding: '0.4rem 0.75rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer'
          }}>
            {mostrarHistorico ? '🔙 Ocultar Histórico' : '🕓 Ver Histórico'}
          </button>
        </div>

        {mostrarHistorico && (
          <div style={{
            marginTop: '1rem',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {Object.entries(historico)
              .filter(([data]) => data !== hoje)
              .sort((a, b) => b[0].localeCompare(a[0]))
              .map(([data, lista]) => (
                <div key={data} style={{
                  marginBottom: '1rem',
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '0.5rem'
                }}>
                  <strong style={{ color: '#1e3a8a', fontSize: '1rem', fontWeight: '700' }}>📅 {data}</strong>
                  <ul style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
                    {lista.map((t) => (
                      <li key={t.id} style={{
                        color: t.concluida ? '#10b981' : '#ef4444',
                        textDecoration: t.concluida ? 'line-through' : 'none',
                        marginBottom: '0.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: '600'
                      }}>
                        <span>{t.concluida ? '✅' : '❌'} {t.texto}</span>
                        {!t.concluida && t.remarcavel && (
                          <button onClick={() => remarcarTarefa(data, t)} style={{
                            marginLeft: '0.5rem',
                            backgroundColor: '#f59e0b',
                            color: '#fff',
                            fontSize: '0.75rem',
                            borderRadius: '0.375rem',
                            padding: '0.2rem 0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '700'
                          }}>
                            🔁 Remarcar
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AppTarefas;