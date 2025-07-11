import React from 'react';
import Select from 'react-select';
import '../styles/filtros.css';

export default function FiltrosLinha({
  filtro,
  setFiltro,
  opcoesTipo = [],
  opcoesCategoria = []
}) {
  const handleInicio = e =>
    setFiltro({ ...filtro, dataInicio: e.target.value });
  const handleFim = e =>
    setFiltro({ ...filtro, dataFim: e.target.value });

  return (
    <div className="filtros-linha">
      <div className="campo-filtro">
        <label>Data início</label>
        <input type="date" value={filtro.dataInicio} onChange={handleInicio} />
      </div>

      <div className="campo-filtro">
        <label>Data fim</label>
        <input type="date" value={filtro.dataFim} onChange={handleFim} />
      </div>

      <div className="campo-filtro-select">
        <label>Tipo</label>
        <Select
          options={opcoesTipo}
          value={filtro.tipo}
          onChange={opcao => setFiltro({ ...filtro, tipo: opcao })}
          placeholder="Todos"
          classNamePrefix="react-select"
        />
      </div>

      <div className="campo-filtro-select">
        <label>Categoria</label>
        <Select
          options={opcoesCategoria}
          value={filtro.categoria}
          onChange={opcao => setFiltro({ ...filtro, categoria: opcao })}
          placeholder="Selecione a categoria"
          classNamePrefix="react-select"
        />
      </div>

    </div>
  );
}
