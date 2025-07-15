import React, { useEffect, useState, useRef } from 'react';
import TabelaOcorrencias from './TabelaOcorrencias';
import TabelaTratamentos from './TabelaTratamentos';
import { formatarDataDigitada } from '../Animais/utilsAnimais';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Scatter,
  Legend,
} from 'recharts';

function parseData(str) {
  if (!str || !str.includes('/')) return null;
  const [d, m, y] = str.split('/');
  return new Date(y, m - 1, d);
}

function formatarData(date) {
  if (!date) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export default function Saude() {
  const [animais, setAnimais] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [aba, setAba] = useState('ocorrencias');
  const [ocorrencias, setOcorrencias] = useState([]);
  const [tratamentos, setTratamentos] = useState([]);
  const [mostrarOcorrencia, setMostrarOcorrencia] = useState(false);
  const [mostrarTratamento, setMostrarTratamento] = useState(false);

  useEffect(() => {
    const lista = JSON.parse(localStorage.getItem('animais') || '[]');
    setAnimais(lista);
  }, []);

  const abrir = (animal) => {
    setSelecionado(animal);
    const dados = JSON.parse(localStorage.getItem(`saude_${animal.numero}`) || '{}');
    setOcorrencias(dados.ocorrencias || []);
    setTratamentos(dados.tratamentos || []);
  };

  const salvarDados = (novasOc, novosTr) => {
    if (!selecionado) return;
    const obj = { ocorrencias: novasOc, tratamentos: novosTr };
    localStorage.setItem(`saude_${selecionado.numero}`, JSON.stringify(obj));
  };

  const adicionarOcorrencia = (dados) => {
    const lista = [...ocorrencias, dados];
    setOcorrencias(lista);
    salvarDados(lista, tratamentos);
  };

  const adicionarTratamento = (dados) => {
    const lista = [...tratamentos, dados];
    setTratamentos(lista);
    salvarDados(ocorrencias, lista);
  };

  const fecharModal = () => {
    setSelecionado(null);
    setAba('ocorrencias');
  };

  const carenciaAtiva = (animalNum) => {
    const dados = JSON.parse(localStorage.getItem(`saude_${animalNum}`) || '{}');
    const trs = dados.tratamentos || [];
    const hoje = new Date();
    return trs.some((t) => {
      const dt = parseData(t.data);
      const dias = parseInt(t.carenciaCarne || t.carenciaLeite || t.carencia || 0);
      if (!dt || !dias) return false;
      const fim = new Date(dt);
      fim.setDate(fim.getDate() + dias);
      return fim >= hoje;
    });
  };

  const obterStatus = (animalNum) => {
    const dados = JSON.parse(localStorage.getItem(`saude_${animalNum}`) || '{}');
    const oc = dados.ocorrencias || [];
    const tr = dados.tratamentos || [];
    const hoje = new Date();
    const ultimoTr = tr[tr.length - 1];
    if (ultimoTr) {
      const dt = parseData(ultimoTr.data);
      const dias = parseInt(ultimoTr.carenciaCarne || ultimoTr.carenciaLeite || ultimoTr.carencia || 0);
      if (dt && dias) {
        const fim = new Date(dt);
        fim.setDate(fim.getDate() + dias);
        if (fim >= hoje) return 'em tratamento';
      }
    }
    const ultimaOc = oc[oc.length - 1];
    if (ultimaOc) {
      const dt = parseData(ultimaOc.data);
      if (dt) {
        const diff = (hoje - dt) / (1000 * 60 * 60 * 24);
        if (diff <= 7) return 'observação';
      }
    }
    return 'normal';
  };

  const ultimaData = (lista) => (lista && lista.length ? lista[lista.length - 1].data : '—');

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Saúde dos Animais</h2>
      <div style={{ overflowX: 'auto' }}>
        <table className="tabela-padrao">
          <thead>
            <tr>
              <th>Número / Nome</th>
              <th>Grupo / Lote</th>
              <th>Última ocorrência</th>
              <th>Último tratamento</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {animais.map((a, i) => {
              const dados = JSON.parse(localStorage.getItem(`saude_${a.numero}`) || '{}');
              const oc = dados.ocorrencias || [];
              const tr = dados.tratamentos || [];
              return (
                <tr key={i} onClick={() => abrir(a)} style={{ cursor: 'pointer' }}>
                  <td>{a.numero} {a.nome ? ' - ' + a.nome : ''}</td>
                  <td>{a.grupo || '—'} / {a.lote || '—'}</td>
                  <td>{ultimaData(oc)}</td>
                  <td>{ultimaData(tr)}</td>
                  <td>
                    {obterStatus(a.numero)}{' '}
                    {carenciaAtiva(a.numero) && <span style={{ color: 'red' }}>⚠️</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selecionado && (
        <ModalAnimal
          animal={selecionado}
          aba={aba}
          setAba={setAba}
          ocorrencias={ocorrencias}
          tratamentos={tratamentos}
          onFechar={fecharModal}
          onNovaOcorrencia={adicionarOcorrencia}
          onNovoTratamento={adicionarTratamento}
          mostrarOcorrencia={mostrarOcorrencia}
          setMostrarOcorrencia={setMostrarOcorrencia}
          mostrarTratamento={mostrarTratamento}
          setMostrarTratamento={setMostrarTratamento}
        />
      )}
    </div>
  );
}

function ModalAnimal({ animal, aba, setAba, ocorrencias, tratamentos, onFechar, onNovaOcorrencia, onNovoTratamento, mostrarOcorrencia, setMostrarOcorrencia, mostrarTratamento, setMostrarTratamento }) {
  const escFunction = (e) => {
    if (e.key === 'Escape') onFechar();
  };
  useEffect(() => {
    document.addEventListener('keydown', escFunction);
    return () => document.removeEventListener('keydown', escFunction);
  });

  const dadosGrafico = React.useMemo(() => {
    const eventos = [];
    (animal.pesagens || []).forEach((p) => {
      const dt = parseData(p.data);
      if (dt) eventos.push({ tipo: 'peso', data: dt, valor: Number(p.peso) });
    });
    ocorrencias.forEach((o) => {
      const dt = parseData(o.data);
      if (dt) eventos.push({ tipo: 'oc', data: dt });
    });
    tratamentos.forEach((t) => {
      const dt = parseData(t.data);
      if (dt) eventos.push({ tipo: 'tr', data: dt });
    });
    eventos.sort((a,b)=>a.data-b.data);
    return eventos.map((e)=>({
      ...e,
      dataNum: e.data.getTime(),
    }));
  }, [animal, ocorrencias, tratamentos]);

  return (
    <div style={overlay} onClick={onFechar}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          🩺 Saúde: {animal.numero} {animal.nome ? '- ' + animal.nome : ''}
        </div>
        <div style={abas}>
          {[
            { id: 'ocorrencias', label: '🦠 Ocorrências' },
            { id: 'tratamentos', label: '💉 Tratamentos' },
            { id: 'grafico', label: '📊 Gráfico' },
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => setAba(b.id)}
              style={aba === b.id ? abaAtivaStyle : abaStyle}
            >
              {b.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {aba === 'ocorrencias' && (
            <>
              <button className="botao-acao mb-2" onClick={() => setMostrarOcorrencia(true)}>＋ Nova ocorrência</button>
              <TabelaOcorrencias lista={ocorrencias} onExcluir={(idx)=>{ const l=ocorrencias.filter((_,i)=>i!==idx); onNovaOcorrencia && setOcorrencias(l); }} />
            </>
          )}
          {aba === 'tratamentos' && (
            <>
              <button className="botao-acao mb-2" onClick={() => setMostrarTratamento(true)}>＋ Novo tratamento</button>
              <TabelaTratamentos lista={tratamentos} onExcluir={(idx)=>{ const l=tratamentos.filter((_,i)=>i!==idx); onNovoTratamento && setTratamentos(l); }} />
            </>
          )}
          {aba === 'grafico' && (
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <LineChart data={dadosGrafico} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dataNum" type="number" domain={['auto','auto']} tickFormatter={(v)=>{const d=new Date(v);return `${d.getDate()}/${d.getMonth()+1}`;}} />
                  <YAxis yAxisId="peso" orientation="left" dataKey="valor" allowDecimals={false} />
                  <Tooltip labelFormatter={(v)=>formatarData(new Date(v))} />
                  <Line yAxisId="peso" dataKey="valor" type="monotone" stroke="#3b82f6" dot={false} />
                  <Scatter dataKey="dataNum" fill="#dc2626" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <div style={rodape}>
          <button onClick={onFechar} className="botao-cancelar">Fechar</button>
        </div>
      </div>
      {mostrarOcorrencia && (
        <ModalOcorrenciaForm onSalvar={(d)=>{onNovaOcorrencia(d);setMostrarOcorrencia(false);}} onFechar={()=>setMostrarOcorrencia(false)} />
      )}
      {mostrarTratamento && (
        <ModalTratamentoForm onSalvar={(d)=>{onNovoTratamento(d);setMostrarTratamento(false);}} onFechar={()=>setMostrarTratamento(false)} />
      )}
    </div>
  );
}

function ModalOcorrenciaForm({ onSalvar, onFechar }) {
  const [data, setData] = useState('');
  const [tipo, setTipo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const campos = useRef([]);

  const handleEnter = (i) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      campos.current[i + 1]?.focus();
    }
  };

  const salvar = () => {
    if (!data || data.length !== 10) return alert('Data inválida');
    onSalvar({ data, tipo, descricao, responsavel });
  };

  return (
    <div style={overlay} onClick={onFechar}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={header}>Nova Ocorrência</div>
        <div style={conteudo}>
          <div>
            <label>Data</label>
            <input ref={(el) => (campos.current[0] = el)} value={data} onChange={(e)=>setData(formatarDataDigitada(e.target.value))} onKeyDown={handleEnter(0)} style={input} placeholder="dd/mm/aaaa" />
          </div>
          <div>
            <label>Tipo</label>
            <input ref={(el) => (campos.current[1] = el)} value={tipo} onChange={(e)=>setTipo(e.target.value)} onKeyDown={handleEnter(1)} style={input} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Descrição</label>
            <textarea ref={(el) => (campos.current[2] = el)} value={descricao} onChange={(e)=>setDescricao(e.target.value)} onKeyDown={handleEnter(2)} style={{ ...input, height: '80px' }} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Responsável</label>
            <input ref={(el) => (campos.current[3] = el)} value={responsavel} onChange={(e)=>setResponsavel(e.target.value)} onKeyDown={handleEnter(3)} style={input} />
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

function ModalTratamentoForm({ onSalvar, onFechar }) {
  const [data, setData] = useState('');
  const [principioAtivo, setPrincipioAtivo] = useState('');
  const [nomeComercial, setNomeComercial] = useState('');
  const [dose, setDose] = useState('');
  const [via, setVia] = useState('');
  const [carenciaCarne, setCarenciaCarne] = useState('');
  const [carenciaLeite, setCarenciaLeite] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const campos = useRef([]);

  const handleEnter = (i) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      campos.current[i + 1]?.focus();
    }
  };

  const salvar = () => {
    if (!data || data.length !== 10) return alert('Data inválida');
    onSalvar({ data, principioAtivo, nomeComercial, dose, via, carenciaCarne, carenciaLeite, responsavel, observacoes });
  };

  return (
    <div style={overlay} onClick={onFechar}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={header}>Novo Tratamento</div>
        <div style={conteudo}>
          <div>
            <label>Data</label>
            <input ref={(el) => (campos.current[0] = el)} value={data} onChange={(e)=>setData(formatarDataDigitada(e.target.value))} onKeyDown={handleEnter(0)} style={input} placeholder="dd/mm/aaaa" />
          </div>
          <div>
            <label>Substância ativa</label>
            <input ref={(el) => (campos.current[1] = el)} value={principioAtivo} onChange={(e)=>setPrincipioAtivo(e.target.value)} onKeyDown={handleEnter(1)} style={input} />
          </div>
          <div>
            <label>Nome comercial</label>
            <input ref={(el) => (campos.current[2] = el)} value={nomeComercial} onChange={(e)=>setNomeComercial(e.target.value)} onKeyDown={handleEnter(2)} style={input} />
          </div>
          <div>
            <label>Dose e via</label>
            <input ref={(el) => (campos.current[3] = el)} value={dose} onChange={(e)=>setDose(e.target.value)} onKeyDown={handleEnter(3)} style={input} placeholder="Ex: 10 mL IM" />
          </div>
          <div>
            <label>Carência carne (dias)</label>
            <input ref={(el) => (campos.current[4] = el)} value={carenciaCarne} onChange={(e)=>setCarenciaCarne(e.target.value)} onKeyDown={handleEnter(4)} style={input} type="number" />
          </div>
          <div>
            <label>Carência leite (dias)</label>
            <input ref={(el) => (campos.current[5] = el)} value={carenciaLeite} onChange={(e)=>setCarenciaLeite(e.target.value)} onKeyDown={handleEnter(5)} style={input} type="number" />
          </div>
          <div>
            <label>Responsável</label>
            <input ref={(el) => (campos.current[6] = el)} value={responsavel} onChange={(e)=>setResponsavel(e.target.value)} onKeyDown={handleEnter(6)} style={input} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Observações</label>
            <textarea ref={(el) => (campos.current[7] = el)} value={observacoes} onChange={(e)=>setObservacoes(e.target.value)} onKeyDown={handleEnter(7)} style={{ ...input, height: '80px' }} />
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
const modal = { background: '#fff', borderRadius: '1rem', width: 'min(90vw, 650px)', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' };
const header = { background: '#1e40af', color: 'white', padding: '1rem', fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center' };
const abas = { display: 'flex', gap: '0.5rem', padding: '0.5rem', background: '#f1f5f9' };
const abaStyle = { padding: '0.4rem 0.8rem', borderRadius: '0.5rem', background: '#e5e7eb', cursor: 'pointer' };
const abaAtivaStyle = { ...abaStyle, background: '#fff', borderBottom: '2px solid #1e40af' };
const conteudo = { padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };
const rodape = { display: 'flex', justifyContent: 'flex-end', gap: '1rem', padding: '1rem' };
const input = { width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '0.5rem', fontSize: '0.95rem' };

