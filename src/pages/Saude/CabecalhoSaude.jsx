import React from 'react';

export default function CabecalhoSaude({
  busca,
  setBusca,
  grupos = [],
  grupoFiltro,
  setGrupoFiltro,
  statusFiltro,
  setStatusFiltro,
  cards = []
}) {
  return (
    <div className="w-full p-4 flex flex-col gap-6 bg-white rounded-lg shadow">
      {/* Linha de Filtros e Botão */}
      <div className="flex flex-wrap gap-4 justify-between items-end">
        {/* Filtros */}
        <div className="flex flex-wrap gap-4 items-end">
          {/* Busca */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-500 flex items-center gap-1">
              🔍 Buscar
            </label>
            <input
              type="text"
              placeholder="Nome ou número"
              className="border border-gray-300 px-3 py-1 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>

          {/* Grupo */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-500">Grupo</label>
            <select
              className="border border-gray-300 px-3 py-1 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
              value={grupoFiltro}
              onChange={e => setGrupoFiltro(e.target.value)}
            >
              <option value="">Todos</option>
              {grupos.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-500">Status</label>
            <select
              className="border border-gray-300 px-3 py-1 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
              value={statusFiltro}
              onChange={e => setStatusFiltro(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Saudável">Saudável</option>
              <option value="Pendente">Pendente</option>
              <option value="Tratamento ativo">Tratamento ativo</option>
            </select>
          </div>
        </div>

        {/* Botão Registrar */}
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md shadow flex items-center gap-2 transition">
          <span className="text-lg">➕</span> Registrar Evento de Saúde
        </button>
      </div>

      {/* Cards Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(card => (
          <div key={card.id || card.label} className="rounded-xl p-4 border shadow-sm flex flex-col items-center justify-center bg-gray-50">
            <div className="text-3xl">{card.icone}</div>
            <div className="text-sm text-gray-600 mt-2">{card.label}</div>
            <div className={`text-xl font-semibold mt-1 ${card.cor || ''}`}>{card.valor}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
