import React, { useEffect, useState } from 'react';
import { FileWarning, Syringe, Bell } from 'lucide-react';
import TabelaOcorrencias from './TabelaOcorrencias.jsx';
import TabelaTratamentos from './TabelaTratamentos.jsx';
import ModalOcorrencia from './ModalOcorrencia.jsx';
import ModalTratamento from './ModalTratamento.jsx';

function parseData(d) {
  if (!d) return null;
  const [dia, mes, ano] = d.split('/');
  return new Date(ano, mes - 1, dia);
}

function formatarData(dt) {
  const dia = String(dt.getDate()).padStart(2, '0');
  const mes = String(dt.getMonth() + 1).padStart(2, '0');
  const ano = dt.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function gerarAlertas(ocorrencias, tratamentos) {
  const hoje = new Date();
  const lista = [];

  tratamentos.forEach((t) => {
    const inicio = parseData(t.data);
    const car = parseInt(t.carencia);
    if (inicio && !isNaN(car)) {
      const fim = new Date(inicio);
      fim.setDate(fim.getDate() + car);
      if (fim >= hoje) {
        lista.push(
          `Animal ${t.animal} em carência de ${t.medicacao} até ${formatarData(fim)}`
        );
      }
    }
  });

  const mapa = {};
  ocorrencias.forEach((o) => {
    if (o.diagnostico && o.diagnostico.toLowerCase().includes('mastite')) {
      const arr = mapa[o.animal] || [];
      arr.push(parseData(o.data));
      mapa[o.animal] = arr;
    }
  });
  Object.entries(mapa).forEach(([animal, datas]) => {
    datas.sort((a, b) => b - a);
    for (let i = 0; i < datas.length - 1; i++) {
      const diff = (datas[i] - datas[i + 1]) / (1000 * 60 * 60 * 24);
      if (diff <= 30) {
        lista.push(`Recorrência de mastite no animal ${animal}`);
        break;
      }
    }
  });

  return lista;
}

export default function Saude() {
  const [aba, setAba] = useState('ocorrencias');
  const [ocorrencias, setOcorrencias] = useState([]);
  const [tratamentos, setTratamentos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [showOcorrencia, setShowOcorrencia] = useState(false);
  const [showTratamento, setShowTratamento] = useState(false);

  useEffect(() => {
    setAlertas(gerarAlertas(ocorrencias, tratamentos));
  }, [ocorrencias, tratamentos]);

  const adicionarOcorrencia = (dados) => {
    setOcorrencias((prev) => [...prev, dados]);
  };

  const adicionarTratamento = (dados) => {
    setTratamentos((prev) => [...prev, dados]);
  };

  const excluirOcorrencia = (idx) => {
    setOcorrencias((prev) => prev.filter((_, i) => i !== idx));
  };

  const excluirTratamento = (idx) => {
    setTratamentos((prev) => prev.filter((_, i) => i !== idx));
  };

  const tabs = [
    { id: 'ocorrencias', label: 'Ocorrências', icon: FileWarning },
    { id: 'tratamentos', label: 'Tratamentos', icon: Syringe },
    { id: 'alertas', label: 'Alertas', icon: Bell },
  ];

  const renderiza = () => {
    switch (aba) {
      case 'ocorrencias':
        return (
          <div className="space-y-2">
            <button
              onClick={() => setShowOcorrencia(true)}
              className="bg-blue-500 text-white rounded px-3 py-1"
            >
              + Nova Ocorrência
            </button>
            <TabelaOcorrencias
              lista={ocorrencias}
              onExcluir={excluirOcorrencia}
            />
            {showOcorrencia && (
              <ModalOcorrencia
                onFechar={() => setShowOcorrencia(false)}
                onSalvar={adicionarOcorrencia}
              />
            )}
          </div>
        );
      case 'tratamentos':
        return (
          <div className="space-y-2">
            <button
              onClick={() => setShowTratamento(true)}
              className="bg-blue-500 text-white rounded px-3 py-1"
            >
              + Novo Tratamento
            </button>
            <TabelaTratamentos
              lista={tratamentos}
              onExcluir={excluirTratamento}
            />
            {showTratamento && (
              <ModalTratamento
                onFechar={() => setShowTratamento(false)}
                onSalvar={adicionarTratamento}
              />
            )}
          </div>
        );
      case 'alertas':
        return (
          <div className="space-y-2">
            {alertas.length === 0 ? (
              <p>Nenhum alerta.</p>
            ) : (
              <ul className="list-disc pl-4 space-y-1">
                {alertas.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full p-4 text-blue-900 space-y-4">
      <div className="flex justify-center gap-4">
        {tabs.map((t) => {
          const Icon = t.icon;
          const ativo = aba === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setAba(t.id)}
              className={`flex flex-col items-center p-2 rounded-md border transition-colors ${ativo ? 'bg-white border-blue-500 text-blue-900' : 'text-blue-900/60 border-transparent'}`}
            >
              <Icon size={28} />
              <span className="text-sm mt-1">{t.label}</span>
            </button>
          );
        })}
      </div>
      {renderiza()}
    </div>
  );
}
