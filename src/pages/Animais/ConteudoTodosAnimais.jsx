// src/pages/Animais/ConteudoTodosAnimais.jsx
import React, { useState } from 'react';
import SubAbasAnimais from './SubAbasAnimais';
import ConteudoPlantel from './ConteudoPlantel';
import ConteudoSecagem from './ConteudoSecagem';
import ConteudoPreParto from './ConteudoPreParto';
import ConteudoParto from './ConteudoParto';

export default function ConteudoTodosAnimais({ vacas, onAtualizar }) {
  const [subAba, setSubAba] = useState('plantel');

  const renderizarSubAba = () => {
    switch (subAba) {
      case 'plantel':
        return <ConteudoPlantel vacas={vacas} onAtualizar={onAtualizar} />;
      case 'secagem':
        return <ConteudoSecagem vacas={vacas} onAtualizar={onAtualizar} />;
      case 'pre-parto':
        return <ConteudoPreParto vacas={vacas} />;
      case 'parto':
        return <ConteudoParto vacas={vacas} onAtualizar={onAtualizar} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-center mt-4 mb-[-8px]">
        <SubAbasAnimais
          abaSelecionada={subAba}
          setAbaSelecionada={setSubAba}
          larguraAba="140px"
          alturaAba="32px"
          espacoEntreAbas="6px"
          espacoVerticalSuperior="8px"
          bordaArredondada="5px"
        />
      </div>

      <div className="mt-4 px-4">
        {renderizarSubAba()}
      </div>
    </div>
  );
}
