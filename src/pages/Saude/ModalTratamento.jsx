import React, { useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import { formatarDataDigitada } from '../Animais/utilsAnimais';

export default function ModalTratamento({ animais = [], produtos = [], onFechar, onSalvar, dados }) {
  const [animal, setAnimal] = useState(dados?.animal || null);
  const [data, setData] = useState(dados?.data || '');
  const [produto, setProduto] = useState(dados?.produto || null);
  const [dose, setDose] = useState(dados?.dose || '');
  const [unidade, setUnidade] = useState(dados?.unidade || 'mL');
  const [via, setVia] = useState(dados?.via || 'intramuscular');
  const [carencia, setCarencia] = useState(dados?.carencia || '');
  const [aplicador, setAplicador] = useState(dados?.aplicador || '');
  const [observacoes, setObservacoes] = useState(dados?.observacoes || '');

  const camposRef = useRef([]);

  useEffect(() => {
    const esc = e => e.key === 'Escape' && onFechar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onFechar]);

  useEffect(() => {
    if (produto) {
      const info = produtos.find(p => p.value === produto.value);
      if (info && info.carencia) setCarencia(info.carencia);
    }
  }, [produto, produtos]);

  const handleEnter = index => e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      camposRef.current[index + 1]?.focus();
    }
  };

  const salvar = () => {
    if (!animal) return alert('Selecione o animal');
    if (!produto) return alert('Selecione o medicamento');
    if (!data || data.length !== 10) return alert('Data inválida');
    const reg = { animal: animal.value, data, medicamento: produto.label, principioAtivo: produto.principioAtivo, dose, unidade, via, carencia, aplicador, observacoes };
    if (dados?.ocorrenciaIdx !== undefined) reg.ocorrenciaIdx = dados.ocorrenciaIdx;
    onSalvar && onSalvar(reg);
    onFechar && onFechar();
  };

  const opcoesAnimais = animais.map(a => ({ value: a.numero, label: a.numero + (a.nome ? ' - ' + a.nome : '') }));
  const opcoesProdutos = produtos.map(p => ({ value: p.nomeComercial, label: p.nomeComercial, carencia: p.carencia || '', principioAtivo: p.principioAtivo || '' }));

  return (
    <div style={overlay} onClick={onFechar}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <div style={header}>Registrar Tratamento</div>
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
            <label>Data</label>
            <input
              ref={el => (camposRef.current[1] = el)}
              value={data}
              onChange={e => setData(formatarDataDigitada(e.target.value))}
              onKeyDown={handleEnter(1)}
              placeholder="dd/mm/aaaa"
              style={input}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Medicamento</label>
            <Select
              options={opcoesProdutos}
              value={produto}
              onChange={setProduto}
              placeholder="Selecione..."
              classNamePrefix="react-select"
              className="react-select-container"
              ref={el => (camposRef.current[2] = el)}
            />
          </div>
          <div>
            <label>Dose</label>
            <input
              ref={el => (camposRef.current[3] = el)}
              value={dose}
              onChange={e => setDose(e.target.value)}
              onKeyDown={handleEnter(3)}
              style={input}
              type="number"
            />
          </div>
          <div>
            <label>Unidade</label>
            <select
              ref={el => (camposRef.current[4] = el)}
              value={unidade}
              onChange={e => setUnidade(e.target.value)}
              onKeyDown={handleEnter(4)}
              style={input}
            >
              <option value="mL">mL</option>
              <option value="L">L</option>
              <option value="mg">mg</option>
              <option value="g">g</option>
            </select>
          </div>
          <div>
            <label>Via</label>
            <select
              ref={el => (camposRef.current[5] = el)}
              value={via}
              onChange={e => setVia(e.target.value)}
              onKeyDown={handleEnter(5)}
              style={input}
            >
              <option value="intramuscular">intramuscular</option>
              <option value="subcutânea">subcutânea</option>
              <option value="oral">oral</option>
              <option value="tópica">tópica</option>
            </select>
          </div>
          <div>
            <label>Carência (dias)</label>
            <input
              ref={el => (camposRef.current[6] = el)}
              value={carencia}
              onChange={e => setCarencia(e.target.value)}
              onKeyDown={handleEnter(6)}
              style={input}
              type="number"
            />
          </div>
          <div>
            <label>Aplicador</label>
            <input
              ref={el => (camposRef.current[7] = el)}
              value={aplicador}
              onChange={e => setAplicador(e.target.value)}
              onKeyDown={handleEnter(7)}
              style={input}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Observações</label>
            <textarea
              ref={el => (camposRef.current[8] = el)}
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              onKeyDown={handleEnter(8)}
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
const modal = { background: '#fff', borderRadius: '1rem', width: 'min(90vw, 640px)', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' };
const header = { background: '#1e40af', color: 'white', padding: '1rem', fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center' };
const conteudo = { padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };
const rodape = { display: 'flex', justifyContent: 'flex-end', gap: '1rem', padding: '1rem' };
const input = { width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '0.5rem', fontSize: '0.95rem' };
