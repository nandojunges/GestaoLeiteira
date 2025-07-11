import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { buscarTodos, adicionarItem } from "../../utils/apiFuncoes.js";

export default function ModalRegistrarOcorrencia({ vaca, onClose, onSalvar }) {
  const TIPOS = [
    'Metrite',
    'Endometrite',
    'Infecção Subclínica',
    'Cio natural',
    'Descalcificação',
    'Cetose'
  ];

  const [tipo, setTipo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [iniciarTratamento, setIniciarTratamento] = useState(false);
  const [produto, setProduto] = useState(null);
  const [dose, setDose] = useState('');
  const [duracao, setDuracao] = useState('');
  const [carencia, setCarencia] = useState('');
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    (async () => {
      const lista = await buscarTodos('estoque');
      const arr = Array.isArray(lista) ? lista : [];
      const farm = arr.filter(p => p.agrupamento === 'Farmácia');
      setProdutos(farm.map(p => ({ value: p.nomeComercial, label: p.nomeComercial })));
    })();
    const esc = e => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  const salvar = () => {
    if (!tipo) {
      alert('Selecione o tipo de ocorrência');
      return;
    }
    const hoje = new Date().toISOString().substring(0, 10);
    const ocorrencia = {
      numeroAnimal: vaca.numero,
      data: hoje,
      tipo,
      observacoes
    };
    const listaOc = await buscarTodos('ocorrencias');
    await adicionarItem('ocorrencias', ocorrencia);
    window.dispatchEvent(new Event('ocorrenciasAtualizadas'));

    if (iniciarTratamento && produto) {
      const tratamento = {
        numeroAnimal: vaca.numero,
        data: hoje,
        produto,
        dose,
        duracao,
        carencia
      };
      const listaTr = await buscarTodos('tratamentos');
      await adicionarItem('tratamentos', tratamento);
      window.dispatchEvent(new Event('tratamentosAtualizados'));
    }
    onSalvar?.(ocorrencia);
    onClose?.();
  };

  const input = () => ({
    padding: '0.6rem',
    border: '1px solid #ccc',
    borderRadius: '0.5rem',
    width: '100%',
    fontSize: '0.95rem'
  });

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <div style={header}>Registrar Ocorrência - {vaca.numero}</div>
        <div style={conteudo}>
          <div>
            <label>Tipo de Ocorrência *</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)} style={input()}>
              <option value="">Selecione...</option>
              {TIPOS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Observações</label>
            <textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              style={{ ...input(), height: '80px' }}
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={iniciarTratamento}
                onChange={e => setIniciarTratamento(e.target.checked)}
              />{' '}
              Iniciar tratamento agora
            </label>
          </div>
          {iniciarTratamento && (
            <>
              <div>
                <label>Produto</label>
                <Select
                  options={produtos}
                  value={produto ? { value: produto, label: produto } : null}
                  onChange={opt => setProduto(opt?.value || null)}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Selecione..."
                />
              </div>
              <div>
                <label>Dose</label>
                <input value={dose} onChange={e => setDose(e.target.value)} style={input()} />
              </div>
              <div>
                <label>Duração (dias)</label>
                <input
                  type="number"
                  value={duracao}
                  onChange={e => setDuracao(e.target.value)}
                  style={{ ...input(), width: '120px' }}
                />
              </div>
              <div>
                <label>Carência (Leite/Carne)</label>
                <input value={carencia} onChange={e => setCarencia(e.target.value)} style={input()} />
              </div>
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={onClose} className="botao-cancelar">Cancelar</button>
            <button onClick={salvar} className="botao-acao">Salvar</button>
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
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999
};

const modal = {
  background: '#fff',
  borderRadius: '1rem',
  width: '420px',
  maxHeight: '90vh',
  overflowY: 'auto',
  fontFamily: 'Poppins, sans-serif',
  display: 'flex',
  flexDirection: 'column'
};

const header = {
  background: '#1e40af',
  color: 'white',
  padding: '1rem 1.5rem',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  borderTopLeftRadius: '1rem',
  borderTopRightRadius: '1rem',
  textAlign: 'center'
};

const conteudo = {
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
};
