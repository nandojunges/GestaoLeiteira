import { useState } from 'react';

export default function LivroCaixaTabs() {
  const [abaAtiva, setAbaAtiva] = useState('receitas');

  const estiloBotao = (aba) => ({
    border: '1px solid #ccc',
    borderRadius: '12px',
    padding: '0.4rem 1.2rem',
    backgroundColor: abaAtiva === aba ? '#7c4dff' : '#fff',
    color: abaAtiva === aba ? '#fff' : '#000',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: abaAtiva === aba ? 'inset 0 0 3px rgba(0,0,0,0.2)' : 'none',
    cursor: 'pointer',
    transition: '0.2s'
  });

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📒 Livro Caixa</h2>

      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <button onClick={() => setAbaAtiva('despesas')} style={estiloBotao('despesas')}>
          🧾 <span>Despesas</span>
        </button>
        <button onClick={() => setAbaAtiva('receitas')} style={estiloBotao('receitas')}>
          💵 <span>Receitas</span>
        </button>
      </div>

      {abaAtiva === 'receitas' && (
        <div>
          <h3>Receitas</h3>
        </div>
      )}

      {abaAtiva === 'despesas' && (
        <div>
          <h3>Despesas</h3>
        </div>
      )}
    </div>
  );
}
