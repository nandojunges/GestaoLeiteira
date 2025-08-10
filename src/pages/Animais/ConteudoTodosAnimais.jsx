// src/pages/Animais/ConteudoTodosAnimais.jsx
import React, { useState, useEffect } from 'react';
import { getAnimais } from '../../api';
import SubAbasAnimais from './SubAbasAnimais';
import ConteudoPlantel from './ConteudoPlantel';
import ConteudoSecagem from './ConteudoSecagem';
import ConteudoPreParto from './ConteudoPreParto';
import ConteudoParto from './ConteudoParto';

export default function ConteudoTodosAnimais() {
  const [subAba, setSubAba] = useState('plantel');
  const [vacas, setVacas] = useState([]);

  useEffect(() => {
    async function carregar() {
      const map = {
        plantel: 'vazia',
        secagem: 'seca',
        'pre-parto': 'preparto',
        parto: 'lactante',
      };
      const estado = map[subAba];
      const lista = await getAnimais(estado ? { estado } : {});
      setVacas(lista);
    }
    carregar();
  }, [subAba]);

  const renderizarSubAba = () => {
    switch (subAba) {
      case 'plantel':
        return <ConteudoPlantel vacas={vacas} />;
      case 'secagem':
        return <ConteudoSecagem vacas={vacas} />;
      case 'pre-parto':
        return <ConteudoPreParto vacas={vacas} />;
      case 'parto':
        return <ConteudoParto vacas={vacas} />;
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
