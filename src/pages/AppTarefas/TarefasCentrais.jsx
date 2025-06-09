import React, { useEffect, useState } from 'react';
import gerarTarefasAutomaticas from '../../utils/gerarTarefasAutomaticas';

export default function AppTarefas() {
  const hoje = new Date().toISOString().slice(0, 10);
  const [tarefas, setTarefas] = useState([]);
  const [historico, setHistorico] = useState({});
  const [mostrarHistorico, setMostrarHistorico] = useState(false);

  useEffect(() => {
    const carregar = () => {
      gerarTarefasAutomaticas();
      let armazenadas = JSON.parse(localStorage.getItem('tarefas') || '[]');
      const atualizadas = armazenadas.map((t) => {
        if (t.status === 'pendente' && t.data < hoje && t.tipo !== 'estoque') {
          return { ...t, status: 'atrasado' };
        }
        return t;
      });

      const agrupadas = {};
      atualizadas.forEach((t) => {
        if (!agrupadas[t.data]) agrupadas[t.data] = [];
        agrupadas[t.data].push(t);
      });

      setTarefas(agrupadas[hoje] || []);
      setHistorico(agrupadas);
      localStorage.setItem('tarefas', JSON.stringify(atualizadas));
    };

    carregar();
    const eventos = [
      'manejosSanitariosAtualizados',
      'tratamentosAtualizados',
      'produtosAtualizados',
      'alertasCarenciaAtualizados',
      'eventosExtrasAtualizados',
    ];
    eventos.forEach((ev) => window.addEventListener(ev, carregar));
    return () => eventos.forEach((ev) => window.removeEventListener(ev, carregar));
  }, []);

  const atualizarStorage = (novas) => {
    const todas = Object.values(novas).flat();
    localStorage.setItem('tarefas', JSON.stringify(todas));
  };

  const marcarComoConcluida = (id) => {
    const novas = tarefas.map((t) =>
      t.id === id ? { ...t, status: 'feito' } : t
    );
    const novoHist = { ...historico, [hoje]: novas };
    setTarefas(novas);
    setHistorico(novoHist);
    atualizarStorage(novoHist);
  };

  const remarcarTarefa = (dataAntiga, tarefa) => {
    const novoHist = { ...historico };
    novoHist[dataAntiga] = novoHist[dataAntiga].filter((t) => t.id !== tarefa.id);
    novoHist[hoje] = [...(novoHist[hoje] || []), { ...tarefa, status: 'pendente', data: hoje }];
    setHistorico(novoHist);
    if (dataAntiga === hoje) {
      setTarefas(novoHist[hoje]);
    }
    atualizarStorage(novoHist);
  };

  const feitas = tarefas.filter((t) => t.status === 'feito').length;

  return (
    <div style={{
      fontFamily: 'Poppins, sans-serif',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      paddingTop: '1rem',
      marginBottom: '2rem'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '1rem',
        boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
        padding: '2rem',
        width: '100%',
        maxWidth: '680px',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
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

        {tarefas.length === 0 ? (
          <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#9ca3af' }}>
            Nenhuma tarefa para hoje.
          </p>
        ) : (
          tarefas.map((t) => (
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
                textDecoration: t.status === 'feito' ? 'line-through' : 'none',
                color: t.status === 'feito' ? '#9ca3af' : '#111827',
                fontWeight: '600'
              }}>{t.descricao}</span>
              {t.status !== 'feito' && t.tipo !== 'estoque' && (
                <button onClick={() => marcarComoConcluida(t.id)} style={{
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}>
                  Concluir
                </button>
              )}
            </div>
          ))
        )}

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
            maxHeight: '250px',
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
                        color: t.status === 'feito' ? '#10b981' : '#ef4444',
                        textDecoration: t.status === 'feito' ? 'line-through' : 'none',
                        marginBottom: '0.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: '600'
                      }}>
                        <span>{t.status === 'feito' ? '✅' : '❌'} {t.descricao}</span>
                        {t.status === 'pendente' && t.tipo !== 'estoque' && (
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
