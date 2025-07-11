import React, { useEffect, useState } from 'react';
import { buscarTodos } from '../../utils/backendApi';

export default function VisualizarEventosDia({
  data,
  mostrarRotineiros,
  onToggleRotineiros,
  onFechar
}) {
  const [ano, mes, dia] = data.split('-');
  const dataLocal = new Date(Number(ano), Number(mes) - 1, Number(dia));
  const dataBr = dataLocal.toLocaleDateString('pt-BR');

  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    async function carregar() {
      try {
        const eventos = await buscarTodos(`eventos?data=${data}`);
        setEventos(Array.isArray(eventos) ? eventos : []);
      } catch (err) {
        console.error('Erro ao buscar eventos do dia:', err);
        setEventos([]);
      }
    }

    if (data) carregar();
  }, [data]);

  const eventosDia = eventos.filter(ev => (ev.date || ev.data) === data);

  const getIcone = (tipo) => {
    if (tipo === 'parto') return '/icones/parto.png';
    if (tipo === 'secagem') return '/icones/secagem.png';
    if (tipo === 'dispositivo') return '/icones/dispositivoIATF.png';
    if (tipo === 'hormonio') return '/icones/aplicacao.png';
    if (tipo === 'tratamento') return '/icones/tratamento.png';
    if (tipo === 'protocolo') return '/icones/protocoloIATF.png';
    if (tipo === 'vacina') return '/icones/aplicacao.png';
    return null;
  };

  // ESC fecha o modal
  useEffect(() => {
    const escFunction = (e) => {
      if (e.key === 'Escape') {
        onFechar();
      }
    };
    document.addEventListener('keydown', escFunction);
    return () => document.removeEventListener('keydown', escFunction);
  }, [onFechar]);

  return (
    <div style={overlay} onClick={onFechar}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
          📅 Eventos do dia {dataBr}:
        </h2>
        <ul style={{ marginBottom: '1rem' }}>
          {eventosDia.filter(ev => (ev.prioridadeVisual ?? true) || mostrarRotineiros).map((ev, i) => {
            const icone = getIcone(ev.tipo);
            const titulo = ev.title || ev.descricao || ev.subtipo || ev.tipo;
            return (
              <li key={i} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {icone ? (
                  <img src={icone} alt={ev.tipo} className="icone-tarefa" />
                ) : (
                  ev.prioridadeVisual ? '✅' : '🔧'
                )}
                <span>{titulo}</span>
              </li>
            );
          })}
          {eventosDia.filter(ev => (ev.prioridadeVisual ?? true) || mostrarRotineiros).length === 0 && (
            <li>Nenhum evento</li>
          )}
        </ul>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem'
        }}>
          <input type="checkbox" checked={mostrarRotineiros} onChange={onToggleRotineiros} />
          Ver eventos rotineiros
        </label>
        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
          <button onClick={onFechar} style={botao}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999
};

const modal = {
  background: '#fff',
  padding: '1.5rem',
  borderRadius: '0.75rem',
  width: '90%',
  maxWidth: '460px'
};

const botao = {
  background: '#e5e7eb',
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
  cursor: 'pointer',
  border: 'none'
};
