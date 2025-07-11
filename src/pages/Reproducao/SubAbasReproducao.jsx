import React, { useContext } from 'react';
import { ConfiguracaoContext } from '../../context/ConfiguracaoContext';

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
  const { config } = useContext(ConfiguracaoContext);
  const estiloIcone = {
    width: `${config?.tamanhoIcones?.sub || 45}px`,
    height: `${config?.tamanhoIcones?.sub || 45}px`,
    objectFit: 'contain',
    marginBottom: '6px'
  };

  const subAbas = [
     { id: 'visaoGeral', label: 'Visão Geral', icone: '/icones/historico.png' },
    { id: 'protocolos', label: 'Protocolos', icone: '/icones/protocoloIATF.png' },
    { id: 'diagnostico', label: 'Diagnóstico', icone: '/icones/diagnosticogestacao.png' },
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
            onClick={() => setAbaAtiva(aba.id)}
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
                fontWeight: abaAtiva === aba.id ? 700 : 500,
                color: abaAtiva === aba.id ? '#1e3a8a' : '#374151',
              }}
            >
              {aba.label}
            </div>
          </button>
        ))}
    </div>
  );
}
