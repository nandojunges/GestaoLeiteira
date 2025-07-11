import React, { useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import { formatarDataDigitada } from '../Animais/utilsAnimais';

export default function ModalOcorrencia({ animais = [], onFechar, onSalvar, dados }) {
  const [animal, setAnimal] = useState(dados?.animal || null);
  const [data, setData] = useState(dados?.data || '');
  const [diagnostico, setDiagnostico] = useState(dados?.diagnostico || '');
  const [gravidade, setGravidade] = useState(dados?.gravidade || 'Leve');
  const [responsavel, setResponsavel] = useState(dados?.responsavel || '');
  const [observacoes, setObservacoes] = useState(dados?.observacoes || '');

  const camposRef = useRef([]);

  useEffect(() => {
    const esc = e => e.key === 'Escape' && onFechar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onFechar]);

  const handleEnter = index => e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      camposRef.current[index + 1]?.focus();
    }
  };

  const salvar = () => {
    if (!animal) return alert('Selecione o animal');
    if (!data || data.length !== 10) return alert('Data inválida');
    const registro = { animal: animal.value, data, diagnostico, gravidade, responsavel, observacoes };
    onSalvar && onSalvar(registro);
    onFechar && onFechar();
  };

  const opcoesAnimais = animais.map(a => ({ value: a.numero, label: a.numero + (a.nome ? ' - ' + a.nome : '') }));
  const sugeridos = ['Mastite', 'Diarréia', 'Febre', 'Outros'];

  return (
    <div style={overlay} onClick={onFechar}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <div style={header}>Registrar Ocorrência</div>
        <div style={conteudo}>
          <div>
            <label>Animal</label>
            <Select
              options={opcoesAnimais}
              value={animal}
              onChange={setAnimal}
              placeholder="Selecione..."
              classNamePrefix="react-select"
              className="react-select-container"
              ref={el => (camposRef.current[0] = el)}
            />
          </div>
          <div>
            <label>Data da ocorrência</label>
            <input
              ref={el => (camposRef.current[1] = el)}
              value={data}
              onChange={e => setData(formatarDataDigitada(e.target.value))}
              onKeyDown={handleEnter(1)}
              placeholder="dd/mm/aaaa"
              style={input}
            />
          </div>
          <div>
            <label>Diagnóstico</label>
            <input
              list="sugestoesDiag"
              value={diagnostico}
              onChange={e => setDiagnostico(e.target.value)}
              onKeyDown={handleEnter(2)}
              style={input}
            />
            <datalist id="sugestoesDiag">
              {sugeridos.map((s, i) => <option key={i} value={s} />)}
            </datalist>
          </div>
          <div>
            <label>Gravidade</label>
            <select
              ref={el => (camposRef.current[3] = el)}
              value={gravidade}
              onChange={e => setGravidade(e.target.value)}
              onKeyDown={handleEnter(3)}
              style={input}
            >
              <option>Leve</option>
              <option>Moderada</option>
              <option>Grave</option>
            </select>
          </div>
          <div>
            <label>Responsável</label>
            <input
              ref={el => (camposRef.current[4] = el)}
              value={responsavel}
              onChange={e => setResponsavel(e.target.value)}
              onKeyDown={handleEnter(4)}
              style={input}
            />
          </div>
          <div>
            <label>Observações</label>
            <textarea
              ref={el => (camposRef.current[5] = el)}
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              onKeyDown={handleEnter(5)}
              style={{ ...input, height: '80px' }}
            />
          </div>
        </div>
        <div style={rodape}>
          <button onClick={onFechar} className="botao-cancelar">Cancelar</button>
          <button onClick={salvar} className="botao-acao">Salvar</button>
        </div>
      </div>
    </div>
  );
}

const overlay = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modal = { background: '#fff', borderRadius: '1rem', width: 'min(90vw, 600px)', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' };
const header = { background: '#1e40af', color: 'white', padding: '1rem', fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center' };
const conteudo = { padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };
const rodape = { display: 'flex', justifyContent: 'flex-end', gap: '1rem', padding: '1rem' };
const input = { width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '0.5rem', fontSize: '0.95rem' };
