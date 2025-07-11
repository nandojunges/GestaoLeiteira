import React, { useContext } from 'react';
import { ConfiguracaoContext } from '../../context/ConfiguracaoContext';

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
  const { config } = useContext(ConfiguracaoContext);
  const estiloIcone = {
    width: `${config?.tamanhoIcones?.sub || 45}px`,
    height: `${config?.tamanhoIcones?.sub || 45}px`,
    objectFit: 'contain',
    marginBottom: '6px'
  };

  const subAbas = [
     { id: 'plantel', label: 'Plantel', icone: '/icones/plantel.png' },
    { id: 'secagem', label: 'Secagem', icone: '/icones/secagem.png' },
    { id: 'pre-parto', label: 'Pré-parto', icone: '/icones/parto.png' },
    { id: 'parto', label: 'Parto', icone: '/icones/parto.png' },
  ];

  return (
    <div
      className="w-full transition-all duration-300"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px',
        padding: '16px 0',
        paddingTop: espacoVerticalSuperior,
        paddingBottom: espacoInferior,
      }}
    >
      {subAbas.map((aba) => (
          <button
            key={aba.id}
            onClick={() => setAbaSelecionada(aba.id)}
            style={{
              background: 'none',
              border: 'none',
              textAlign: 'center',
              width: '100px',
              padding: '12px 0',
              cursor: 'pointer',
            }}
            className="hover:scale-[1.02] active:scale-[0.98]"
          >
            <img src={aba.icone} alt={aba.label} style={estiloIcone} />
            <div
              style={{
                fontSize: '14px',
                fontWeight: abaSelecionada === aba.id ? 700 : 500,
                color: abaSelecionada === aba.id ? '#1e3a8a' : '#374151',
              }}
            >
              {aba.label}
            </div>
          </button>
        ))}
    </div>
  );
}
