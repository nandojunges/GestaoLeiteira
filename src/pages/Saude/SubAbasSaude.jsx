import React, { useContext } from 'react';
import { ConfiguracaoContext } from '../../context/ConfiguracaoContext';

export default function SubAbasSaude({ abaAtiva, setAbaAtiva }) {
  const { config } = useContext(ConfiguracaoContext);
  const subAbas = [
    { id: 'ocorrencias', label: 'Ocorrências', icone: '📝' },
    { id: 'tratamentos', label: 'Tratamentos', icone: '💉' },
    { id: 'alertas', label: 'Alertas', icone: '🚨' },
  ];

  return (
    <div
      className="w-full flex justify-center flex-wrap gap-6 py-4"
    >
      {subAbas.map((aba) => (
        <button
          key={aba.id}
          onClick={() => setAbaAtiva(aba.id)}
          className={`flex flex-col items-center w-24 p-2 hover:scale-105 active:scale-95 transition-transform ${abaAtiva === aba.id ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}
        >
          <div
            className="mb-1"
            style={{ fontSize: `${config?.tamanhoIcones?.sub || 45}px` }}
          >
            {aba.icone}
          </div>
          <span className="text-sm text-center">{aba.label}</span>
        </button>
      ))}
    </div>
  );
}
