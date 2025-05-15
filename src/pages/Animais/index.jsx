import React, { useEffect, useState } from 'react';
import ModalLateralAnimais from './ModalLateralAnimais';
import ConteudoEntradaAnimal from './ConteudoEntradaAnimal';
import ConteudoSaidaAnimal from './ConteudoSaidaAnimal';
import ConteudoInativas from './ConteudoInativas';
import ConteudoRelatorio from './ConteudoRelatorio';
import ConteudoImportarPDF from './ConteudoImportarPDF';
import ConteudoExportarDados from './ConteudoExportarDados';
import ConteudoPlantel from './ConteudoPlantel';
import ConteudoSecagem from './ConteudoSecagem';
import ConteudoPreParto from './ConteudoPreParto';
import ConteudoParto from './ConteudoParto';
import ConteudoTodosAnimais from './ConteudoTodosAnimais';

export default function Animais() {
  const [abaLateral, setAbaLateral] = useState('todos');
  const [subAba, setSubAba] = useState('plantel');
  const [vacas, setVacas] = useState([]);
  const [expandido, setExpandido] = useState(false);

  const larguraExpandida = 140;
  const larguraRecolhida = 60;
  const espacoEntrePainelETabela = 24;

  const mostrarBarraLateral = abaLateral !== 'entrada' || subAba !== 'secagem';

  useEffect(() => {
    const salvas = JSON.parse(localStorage.getItem('animais') || '[]');
    setVacas(salvas);
  }, []);

  const atualizarAnimais = (novos) => {
    setVacas(novos);
    localStorage.setItem('animais', JSON.stringify(novos));
  };

  const renderizarConteudoPrincipal = () => {
    if (abaLateral === 'todos') {
      return <ConteudoTodosAnimais vacas={vacas} />;
    }

    if (abaLateral === 'entrada') {
      return (
        <div className="mt-2">
          <ConteudoEntradaAnimal animais={vacas} onAtualizar={atualizarAnimais} />
        </div>
      );
    }

    switch (abaLateral) {
      case 'saida':
        return <ConteudoSaidaAnimal animais={vacas} onAtualizar={atualizarAnimais} />;
      case 'inativas':
        return <ConteudoInativas animais={vacas} onAtualizar={atualizarAnimais} />;
      case 'relatorio':
        return <ConteudoRelatorio animais={vacas} />;
      case 'importar':
        return <ConteudoImportarPDF onImportar={(novos) => atualizarAnimais([...vacas, ...novos])} />;
      case 'exportar':
        return <ConteudoExportarDados animais={vacas} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative flex h-screen">
      {/* Barra lateral */}
      <div
        className="bg-[#1e3a8a] text-white shadow-lg h-full transition-all duration-300 ease-in-out z-50"
        onMouseEnter={() => mostrarBarraLateral && setExpandido(true)}
        onMouseLeave={() => mostrarBarraLateral && setExpandido(false)}
        style={{
          width: mostrarBarraLateral
            ? expandido
              ? `${larguraExpandida}px`
              : `${larguraRecolhida}px`
            : `${larguraRecolhida}px`,
          minWidth: `${larguraRecolhida}px`,
        }}
      >
        {mostrarBarraLateral && (
          <ModalLateralAnimais
            abaAtiva={abaLateral}
            setAbaAtiva={setAbaLateral}
            expandido={expandido}
          />
        )}
      </div>

      {/* Conteúdo Principal */}
      <div
        className="flex-1 overflow-auto"
        style={{
          paddingLeft: `${espacoEntrePainelETabela}px`,
          paddingTop: '16px',
        }}
      >
        {renderizarConteudoPrincipal()}
      </div>
    </div>
  );
}
