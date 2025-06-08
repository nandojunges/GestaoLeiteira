import React, { useEffect } from 'react';

export default function VisualizarEventosDia({
  data,
  eventos,
  mostrarRotineiros,
  onToggleRotineiros,
  onFechar
}) {
  // Converte corretamente a data sem problemas de fuso horário
  const [ano, mes, dia] = data.split('-');
  const dataLocal = new Date(Number(ano), Number(mes) - 1, Number(dia));
  const dataBr = dataLocal.toLocaleDateString('pt-BR');

  const eventosDia = eventos.filter(ev => ev.date === data);

  // ⌨️ ESC fecha o modal
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
          {eventosDia.filter(ev => ev.prioridadeVisual || mostrarRotineiros).map((ev, i) => (
            <li key={i} style={{ marginBottom: '0.5rem' }}>
              {ev.prioridadeVisual ? '✅' : '🔧'} {ev.title}
            </li>
          ))}
          {eventosDia.filter(ev => ev.prioridadeVisual || mostrarRotineiros).length === 0 && (
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
  maxWidth: '420px'
};

const botao = {
  background: '#e5e7eb',
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
  cursor: 'pointer',
  border: 'none'
};
