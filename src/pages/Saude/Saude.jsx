import React, { useState, useMemo } from 'react';

function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function Saude() {
  // Dados mockados de animais e eventos de saúde
  const [animais] = useState([
    {
      id: 1,
      numero: 'A001',
      nome: 'Luna',
      grupo: 'Lote 1',
      ocorrencias: [{ data: '2024-06-01', descricao: 'Mastite' }],
      tratamentos: [{ data: '2024-06-02', medicamento: 'Antibiótico', ativo: true }],
      status: 'Tratamento ativo'
    },
    {
      id: 2,
      numero: 'A002',
      nome: 'Estrela',
      grupo: 'Lote 2',
      ocorrencias: [],
      tratamentos: [],
      status: 'Saudável'
    },
    {
      id: 3,
      numero: 'A003',
      nome: 'Sol',
      grupo: 'Lote 1',
      ocorrencias: [{ data: '2024-05-15', descricao: 'Casco' }],
      tratamentos: [],
      status: 'Pendente'
    },
    {
      id: 4,
      numero: 'A004',
      nome: 'Aurora',
      grupo: 'Lote 2',
      ocorrencias: [{ data: '2024-06-03', descricao: 'Febre' }],
      tratamentos: [{ data: '2024-06-04', medicamento: 'Antitérmico', ativo: false }],
      status: 'Saudável'
    },
    {
      id: 5,
      numero: 'A005',
      nome: 'Nuvem',
      grupo: 'Lote 3',
      ocorrencias: [],
      tratamentos: [],
      status: 'Saudável'
    }
  ]);

  const [busca, setBusca] = useState('');
  const [grupoFiltro, setGrupoFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');

  const grupos = useMemo(() => Array.from(new Set(animais.map(a => a.grupo))), [animais]);

  const animaisFiltrados = animais.filter(a => {
    const buscaNormalizada = busca.toLowerCase();
    const correspondeBusca =
      a.numero.toLowerCase().includes(buscaNormalizada) ||
      a.nome.toLowerCase().includes(buscaNormalizada);
    const correspondeGrupo = !grupoFiltro || a.grupo === grupoFiltro;
    const correspondeStatus = !statusFiltro || a.status === statusFiltro;
    return correspondeBusca && correspondeGrupo && correspondeStatus;
  });

  const mesAtual = new Date().toISOString().slice(0, 7);
  const totalOcorrenciasMes = animais.reduce(
    (acc, a) => acc + a.ocorrencias.filter(o => o.data.startsWith(mesAtual)).length,
    0
  );
  const totalTratamentoAtivo = animais.filter(a => a.status === 'Tratamento ativo').length;

  const cards = [
    {
      id: 'total',
      label: 'Animais monitorados',
      valor: animais.length,
      icone: '🐄'
    },
    {
      id: 'tratamento',
      label: 'Tratamento ativo',
      valor: totalTratamentoAtivo,
      icone: '✏️'
    },
    {
      id: 'ocorrencias',
      label: 'Ocorrências no mês',
      valor: totalOcorrenciasMes,
      icone: '📅'
    }
  ];

  const mapaStatus = {
    Saudável: { icone: '✅', cor: 'text-green-600' },
    'Tratamento ativo': { icone: '🟠', cor: 'text-orange-500' },
    Pendente: { icone: '🕒', cor: 'text-yellow-600' }
  };

  return (
    <div className="p-4 space-y-6 font-poppins">
      <h1 className="text-2xl font-semibold">Saúde dos Animais</h1>

      <div className="flex flex-col gap-4">
        {/* Filtros e ação */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Buscar por nome ou número"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
            <select
              value={grupoFiltro}
              onChange={e => setGrupoFiltro(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Grupo</option>
              {grupos.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <select
              value={statusFiltro}
              onChange={e => setStatusFiltro(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Status</option>
              <option value="Saudável">Saudável</option>
              <option value="Tratamento ativo">Tratamento ativo</option>
              <option value="Pendente">Pendente</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
            + Registrar Evento de Saúde
          </button>
        </div>

        {/* Cards resumo */}
        <div className="flex gap-4">
          {cards.map(c => (
            <div key={c.id} className="bg-white shadow-sm rounded-md p-4 flex items-center gap-3 w-full max-w-xs">
              <span className="text-2xl">{c.icone}</span>
              <div>
                <div className="text-sm font-medium">{c.label}</div>
                <div className="text-xl font-bold">{c.valor}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-md shadow-sm">
        <table className="table-fixed w-full text-sm">
          <thead className="bg-blue-100 text-blue-900">
            <tr>
              <th className="p-2 text-left">Número/Nome</th>
              <th className="p-2 text-left">Grupo</th>
              <th className="p-2 text-left">Última Ocorrência</th>
              <th className="p-2 text-left">Último Tratamento</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {animaisFiltrados.map(a => {
              const ultimaOc = a.ocorrencias.sort((b, c) => c.data.localeCompare(b.data))[0];
              const ultimoTr = a.tratamentos.sort((b, c) => c.data.localeCompare(b.data))[0];
              const infoStatus = mapaStatus[a.status] || mapaStatus['Pendente'];
              return (
                <tr key={a.id} className="even:bg-gray-50 hover:bg-gray-100">
                  <td className="p-2 truncate">{a.numero} - {a.nome}</td>
                  <td className="p-2">{a.grupo}</td>
                  <td className="p-2">{ultimaOc ? formatarData(ultimaOc.data) : '—'}</td>
                  <td className="p-2">
                    {ultimoTr ? `${formatarData(ultimoTr.data)} - ${ultimoTr.medicamento}` : '—'}
                  </td>
                  <td className="p-2">
                    <span className="flex items-center gap-1">
                      <span className={infoStatus.cor}>{infoStatus.icone}</span>
                      {a.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
