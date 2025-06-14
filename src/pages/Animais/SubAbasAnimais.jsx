import React from 'react';

export default function SubAbasAnimais({
  abaSelecionada,
  setAbaSelecionada,
  larguraAba = '130px',
  alturaAba = '32px',
  espacoEntreAbas = '4px',
  espacoVerticalSuperior = '30px',
  espacoInferior = '-5px',
  bordaArredondada = '5px',
}) {
  const subAbas = [
    { id: 'plantel', label: '🐄 Plantel' },
    { id: 'secagem', label: '🧴 Secagem' },
    { id: 'pre-parto', label: '🔔 Pré-parto' },
    { id: 'parto', label: '👶 Parto' },
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
            onClick={() => setAbaSelecionada(aba.id)}
            style={{
              width: larguraAba,
              height: alturaAba,
              borderRadius: bordaArredondada,
              marginRight: espacoEntreAbas,
              transition: 'all 0.2s ease',
              fontWeight: abaSelecionada === aba.id ? '700' : '500',
              backgroundColor: abaSelecionada === aba.id ? '#DBEAFE' : '#F3F4F6',
              color: abaSelecionada === aba.id ? '#1e3a8a' : '#374151',
              boxShadow: abaSelecionada === aba.id ? '0 2px 6px rgba(30, 58, 138, 0.3)' : 'none',
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
