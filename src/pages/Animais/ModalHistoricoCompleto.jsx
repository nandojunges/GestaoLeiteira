import React, { useEffect, useState } from 'react';
import FichaAnimalLeite from './FichaAnimalLeite';
import FichaAnimalPesagens from './FichaAnimalPesagens';
import FichaAnimalEventos from './FichaAnimalEventos';
import FichaAnimalReproducao from './FichaAnimalReproducao';
import { buscarColecaoGenericaSQLite } from '../../utils/apiFuncoes.js';
import { carregarRegistroFirestore } from '../../utils/registroReproducao';

export default function ModalHistoricoCompleto({ animal, onClose }) {
  const [pesagens, setPesagens] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [tratamentos, setTratamentos] = useState([]);
  const [producaoLeite, setProducaoLeite] = useState([]);
  const [lactacoes, setLactacoes] = useState([]);
  const [lactacaoSelecionada, setLactacaoSelecionada] = useState(0);
  const [inseminacoes, setInseminacoes] = useState([]);
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [partos, setPartos] = useState([]);
  const [secagens, setSecagens] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState('reproducao');

  function calcularDias(dataInicio, dataFim) {
    if (!dataInicio || !dataFim) return '—';
    const inicio = new Date(dataInicio.split('/').reverse().join('-'));
    const fim = new Date(dataFim.split('/').reverse().join('-'));
    const diff = (fim - inicio) / (1000 * 60 * 60 * 24);
    return Math.round(diff);
  }

  useEffect(() => {
    (async () => {
      const p = await buscarColecaoGenericaSQLite('pesagens');
      const o = await buscarColecaoGenericaSQLite('ocorrencias');
      const registro = await carregarRegistroFirestore(animal.numero);
      const ocorrProt = registro.ocorrencias || [];
      const t = await buscarColecaoGenericaSQLite('tratamentos');
      const l = await buscarColecaoGenericaSQLite('leite');
      const pts = await buscarColecaoGenericaSQLite('partos');
      const ias = await buscarColecaoGenericaSQLite('inseminacoes');
      const dxs = await buscarColecaoGenericaSQLite('diagnosticos');
      const secs = await buscarColecaoGenericaSQLite('secagens');

      const filtrar = (arr) => (arr || []).filter((ev) => ev.numeroAnimal === animal.numero);

      setPesagens(filtrar(p));
      setOcorrencias(ocorrProt);
      setTratamentos(filtrar(t));
      setInseminacoes(filtrar(ias));
      setDiagnosticos(filtrar(dxs));
      setPartos(filtrar(pts));
      setSecagens(filtrar(secs));

      const listaLeite = filtrar(l);
      const partosAnimal = filtrar(pts).sort((a, b) =>
        new Date(a.data.split('/').reverse().join('-')) -
        new Date(b.data.split('/').reverse().join('-'))
      );

      const grupos = partosAnimal.map((p, index) => {
        const inicio = p.data;
        const proximo = partosAnimal[index + 1];
        const fim = proximo ? proximo.data : null;

        const producoes = listaLeite.filter((l) => {
          const d = new Date(l.data.split('/').reverse().join('-'));
          const ini = new Date(inicio.split('/').reverse().join('-'));
          const fimDate = fim ? new Date(fim.split('/').reverse().join('-')) : null;
          return d >= ini && (!fimDate || d < fimDate);
        });

        const total = producoes.reduce((acc, cur) => acc + Number(cur.litros), 0);

        return {
          parto: inicio,
          secagem: fim || '—',
          dias: fim ? calcularDias(inicio, fim) : '—',
          volume: total,
          producoes,
        };
      });

      setProducaoLeite(listaLeite);
      setLactacoes(grupos);
    setLactacaoSelecionada(0);
  })();
  }, [animal]);


  useEffect(() => {
    const escFunction = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', escFunction);
    return () => document.removeEventListener('keydown', escFunction);
  }, [onClose]);

  if (!animal) return null;

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        {/* Cabeçalho */}
        <div style={header}>
          📋 Histórico completo: {animal.nome || animal.numero}
          <button onClick={onClose} style={botaoFechar}>×</button>
        </div>

        {/* Abas com estilo refinado */}
        <div style={abas}>
          {[
            { id: 'reproducao', label: '🔬 Reprodução' },
            { id: 'leite', label: '🧀 Leite' },
            { id: 'pesagens', label: '⚖️ Pesagens' },
            { id: 'eventos', label: '🚨 Ocorrências' }
          ].map((aba) => (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              style={{
                padding: '0.6rem 1.4rem',
                fontWeight: '500',
                fontSize: '0.95rem',
                borderRadius: '0.75rem 0.75rem 0 0',
                background: abaAtiva === aba.id ? '#ffffff' : '#f1f5f9',
                border: '1px solid #dbeafe',
                borderBottom: abaAtiva === aba.id ? 'none' : '1px solid #d1d5db',
                color: abaAtiva === aba.id ? '#1e40af' : '#6b7280',
                boxShadow: abaAtiva === aba.id ? 'inset 0 2px 0 #2563eb' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {aba.label}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: '#f9fafb' }}>
          {abaAtiva === 'leite' && (
            <FichaAnimalLeite
              animal={animal}
              lactacoes={lactacoes}
              lactacaoSelecionada={lactacaoSelecionada}
              setLactacaoSelecionada={setLactacaoSelecionada}
            />
          )}
          {abaAtiva === 'pesagens' && (
            <FichaAnimalPesagens animal={animal} pesagens={pesagens} />
          )}
          {abaAtiva === 'eventos' && (
            <FichaAnimalEventos animalId={animal.id} />
          )}
          {abaAtiva === 'reproducao' && (
            <FichaAnimalReproducao
              animal={animal}
              partos={partos}
              inseminacoes={inseminacoes}
              diagnosticos={diagnosticos}
              secagens={secagens}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Estilos externos
const overlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999
};

const modal = {
  background: '#fff',
  borderRadius: '1rem',
  width: '96vw',
  height: '92vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'Poppins, sans-serif',
  boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
};

const header = {
  background: '#1e40af',
  color: 'white',
  padding: '1rem 1.5rem',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const botaoFechar = {
  background: 'none',
  border: 'none',
  color: 'white',
  fontSize: '1.5rem',
  cursor: 'pointer'
};

const abas = {
  display: 'flex',
  background: '#e0e7ff',
  paddingLeft: '1.5rem',
  paddingTop: '0.5rem',
  gap: '0.5rem',
  borderBottom: '1px solid #cbd5e1'
};
