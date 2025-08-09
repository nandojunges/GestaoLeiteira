import React, { useContext } from 'react';
import { ConfiguracaoContext } from '../../context/ConfiguracaoContext';
const estoqueIcone = new URL('/icones/estoque.png', import.meta.url).href;
const lotesIcone = new URL('/icones/lotes.png', import.meta.url).href;
const dietaIcone = new URL('/icones/dieta.png', import.meta.url).href;
const limpezaIcone = new URL('/icones/limpeza.png', import.meta.url).href;
const calendarioSanitarioIcone = new URL('/icones/calendariosanitario.png', import.meta.url).href;

export default function SubAbasConsumoReposicao({
  abaAtiva,
  setAbaAtiva,
  larguraAba = '160px',
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
    { id: 'estoque', icone: estoqueIcone, label: 'Estoque' },
    { id: 'cadastroLotes', icone: lotesIcone, label: 'Cadastro de Lotes' },
    { id: 'dietas', icone: dietaIcone, label: 'Dietas' },
    { id: 'limpeza', icone: limpezaIcone, label: 'Limpeza' },
    { id: 'calendarioSanitario', icone: calendarioSanitarioIcone, label: 'Calendário Sanitário' },
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
