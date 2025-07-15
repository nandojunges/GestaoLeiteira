import React, { useEffect, useRef, useState } from 'react';
import { formatarDataDigitada } from '../Animais/utilsAnimais';

export default function ModalExame({ onFechar, onSalvar, dados }) {
  const [tipo, setTipo] = useState(dados?.tipo || '');
  const [data, setData] = useState(dados?.data || '');
  const [resultado, setResultado] = useState(dados?.resultado || '');
  const [anexos, setAnexos] = useState(dados?.anexos || []);
  const [responsavel, setResponsavel] = useState(dados?.responsavel || '');
  const [observacoes, setObservacoes] = useState(dados?.observacoes || '');

  const camposRef = useRef([]);

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onFechar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onFechar]);

  const handleEnter = (i) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      camposRef.current[i + 1]?.focus();
    }
  };

  const handleFile = (files) => {
    const arr = [];
    Array.from(files || []).forEach((f) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        arr.push({ nome: f.name, dado: reader.result });
        if (arr.length === files.length) setAnexos(arr);
      };
      reader.readAsDataURL(f);
    });
  };

  const salvar = () => {
    if (!tipo || !data) return;
    onSalvar?.({ tipo, data, resultado, anexos, responsavel, observacoes });
    onFechar?.();
  };

  return (
    <div style={overlay} onClick={onFechar}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={header}>Registrar Exame</div>
        <div style={conteudo}>
          <div>
            <label>Tipo</label>
            <input
              ref={(el) => (camposRef.current[0] = el)}
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              onKeyDown={handleEnter(0)}
              style={input}
              list="tiposExame"
            />
            <datalist id="tiposExame">
              <option value="Sangue" />
              <option value="Fezes" />
              <option value="Leite" />
              <option value="Urina" />
              <option value="Imagem" />
              <option value="Outro" />
            </datalist>
          </div>
          <div>
            <label>Data</label>
            <input
              ref={(el) => (camposRef.current[1] = el)}
              value={data}
              onChange={(e) => setData(formatarDataDigitada(e.target.value))}
              onKeyDown={handleEnter(1)}
              placeholder="dd/mm/aaaa"
              style={input}
            />
          </div>
          <div>
            <label>Resultado</label>
            <input
              ref={(el) => (camposRef.current[2] = el)}
              value={resultado}
              onChange={(e) => setResultado(e.target.value)}
              onKeyDown={handleEnter(2)}
              style={input}
            />
          </div>
          <div>
            <label>Anexo</label>
            <input
              ref={(el) => (camposRef.current[3] = el)}
              type="file"
              onChange={(e) => handleFile(e.target.files)}
              onKeyDown={handleEnter(3)}
              style={input}
              accept="image/*,application/pdf"
            />
          </div>
          <div>
            <label>Responsável</label>
            <input
              ref={(el) => (camposRef.current[4] = el)}
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              onKeyDown={handleEnter(4)}
              style={input}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Observações</label>
            <textarea
              ref={(el) => (camposRef.current[5] = el)}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
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
