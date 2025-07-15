import { useState } from 'react';
import '../styles/botoes.css';

export default function ModalPlanoSelecionado({ plano, onConfirmar, onFechar }) {
  const [forma, setForma] = useState('pix');

  if (!plano) return null;

  return (
    <div style={overlay} onClick={onFechar}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-2 text-center">
          Confirmar plano {plano.nome}
        </h3>
        <select
          className="border rounded w-full p-2 mb-4"
          value={forma}
          onChange={(e) => setForma(e.target.value)}
        >
          <option value="pix">Pix</option>
          <option value="boleto">Boleto</option>
          <option value="cartao">Cartão</option>
        </select>
        <div className="flex justify-end gap-2">
          <button className="botao-cancelar pequeno" onClick={onFechar}>
            Cancelar
          </button>
          <button
            className="botao-acao pequeno"
            onClick={() => onConfirmar(forma)}
          >
            Confirmar
          </button>
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
  zIndex: 1000,
};

const modal = {
  background: '#fff',
  borderRadius: '0.75rem',
  width: 'min(90vw, 360px)',
  padding: '1rem',
};
