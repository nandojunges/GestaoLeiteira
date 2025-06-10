import React from 'react';

export default function SubAbasReproducao({
  abaAtiva,
  setAbaAtiva,
  larguraAba = '140px',
  alturaAba = '32px',
  espacoEntreAbas = '4px',
  espacoVerticalSuperior = '12px',
  espacoInferior = '-5px',
  bordaArredondada = '5px',
}) {
  const subAbas = [
    { id: 'visaoGeral', label: '📊 Visão Geral' },
    { id: 'protocolos', label: '📅 Protocolos Ativos' },
    { id: 'diagnosticos', label: '🩺 Diagnósticos' },
    { id: 'configPEV', label: '⚙️ Configurar PEV' },
    { id: 'historico', label: '📚 Histórico Completo' },
  ];

  return (
    <div
      className="w-full flex justify-center transition-all duration-300"
      style={{
        paddingTop: espacoVerticalSuperior,
        paddingBottom: espacoInferior,
      }}
    >
      <div className="flex flex-wrap gap-[6px] justify-center">
        {subAbas.map((aba) => (
          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            style={{
              width: larguraAba,
              height: alturaAba,
              borderRadius: bordaArredondada,
              marginRight: espacoEntreAbas,
              transition: 'all 0.2s ease',
              fontWeight: abaAtiva === aba.id ? '700' : '500',
              backgroundColor: abaAtiva === aba.id ? '#DBEAFE' : '#F3F4F6',
              color: abaAtiva === aba.id ? '#1e3a8a' : '#374151',
              boxShadow: abaAtiva === aba.id ? '0 2px 6px rgba(30, 58, 138, 0.3)' : 'none',
            }}
            className="text-sm hover:bg-blue-100 hover:scale-[1.02] active:scale-[0.98]"
          >
            {aba.label}
          </button>
        ))}
      </div>
    </div>
  );
}
