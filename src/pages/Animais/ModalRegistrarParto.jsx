import { useEffect, useState } from 'react';
import { registrarParto } from '../../utils/apiFuncoes';
import { toast } from 'react-toastify';
import '../../styles/botoes.css';

export default function ModalRegistrarParto({ animal, onClose, onRegistrado }) {
  const [dataParto, setDataParto] = useState('');
  const [sexo, setSexo] = useState('femea');

  useEffect(() => {
    const esc = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  const salvar = async () => {
    try {
      await registrarParto(animal.id, dataParto, sexo);
      toast.success('Parto registrado com sucesso');
      onRegistrado && onRegistrado();
      onClose();
    } catch (err) {
      console.error('Erro ao registrar parto:', err);
      toast.error('Erro ao registrar parto');
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3 style={{ marginBottom: '1rem' }}>🐄 Registrar Parto — {animal.numero}</h3>
        <div className="flex flex-col gap-3">
          <label>Data do Parto</label>
          <input
            type="date"
            value={dataParto}
            onChange={e => setDataParto(e.target.value)}
            className="border rounded p-2"
          />
          <label>Sexo do Bezerro</label>
          <select
            value={sexo}
            onChange={e => setSexo(e.target.value)}
            className="border rounded p-2"
          >
            <option value="femea">Fêmea</option>
            <option value="macho">Macho</option>
          </select>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="botao-cancelar pequeno">Cancelar</button>
            <button onClick={salvar} className="botao-acao pequeno">Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
};

const modal = {
  background: '#fff',
  padding: '1.5rem',
  borderRadius: '1rem',
  width: '320px',
  fontFamily: 'Poppins, sans-serif',
};
