import React, { useState, useMemo } from 'react';
import ModalRegistrarEvento from './ModalRegistrarEvento';

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
  const [modalAberto, setModalAberto] = useState(false);

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
    { id: 'total', label: 'Animais monitorados', valor: animais.length, cor: 'bg-blue-100 text-blue-700', icone: '🐄' },
    { id: 'tratamento', label: 'Tratamento ativo', valor: totalTratamentoAtivo, cor: 'bg-yellow-100 text-yellow-700', icone: '💊' },
    { id: 'ocorrencias', label: 'Ocorrências no mês', valor: totalOcorrenciasMes, cor: 'bg-red-100 text-red-700', icone: '🗓️' }
  ];

  const mapaStatus = {
    'Saudável': { cor: 'text-green-600', icone: '✅' },
    'Tratamento ativo': { cor: 'text-orange-600', icone: '⚠️' },
    Pendente: { cor: 'text-gray-600', icone: '⏳' }
  };

  return (
    <div className="p-4 space-y-6 font-poppins">
      <h1 className="text-2xl font-semibold">Saúde dos Animais</h1>

      {/* Filtros */}
      <div className="bg-white p-4 rounded shadow flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Buscar por nome ou número"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 flex-1"
        />
        <select
          value={grupoFiltro}
          onChange={e => setGrupoFiltro(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">Todos os grupos</option>
          {grupos.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select
          value={statusFiltro}
          onChange={e => setStatusFiltro(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">Todos os status</option>
          <option value="Saudável">Saudável</option>
          <option value="Tratamento ativo">Tratamento ativo</option>
          <option value="Pendente">Pendente</option>
        </select>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.id} className={`flex items-center p-4 rounded shadow ${c.cor}`}>
            <span className="text-3xl mr-4">{c.icone}</span>
            <div>
              <div className="text-sm">{c.label}</div>
              <div className="text-xl font-bold">{c.valor}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Botão para registrar evento */}
      <div className="flex justify-end">
        <button
          onClick={() => setModalAberto(true)}
          className="mb-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Registrar Evento de Saúde
        </button>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Número/Nome</th>
              <th className="text-left p-2">Grupo</th>
              <th className="text-left p-2">Última Ocorrência</th>
              <th className="text-left p-2">Último Tratamento</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {animaisFiltrados.map(a => {
              const ultimaOc = a.ocorrencias.sort((b, c) => c.data.localeCompare(b.data))[0];
              const ultimoTr = a.tratamentos.sort((b, c) => c.data.localeCompare(b.data))[0];
              const infoStatus = mapaStatus[a.status] || mapaStatus['Pendente'];
              return (
                <tr key={a.id} className="border-t">
                  <td className="p-2">{a.numero} - {a.nome}</td>
                  <td className="p-2">{a.grupo}</td>
                  <td className="p-2">{ultimaOc ? formatarData(ultimaOc.data) : '—'}</td>
                  <td className="p-2">
                    {ultimoTr ? `${formatarData(ultimoTr.data)} - ${ultimoTr.medicamento}` : '—'}
                  </td>
                  <td className="p-2">
                    <span className={`flex items-center gap-1 ${infoStatus.cor}`}>
                      <span>{infoStatus.icone}</span>
                      {a.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ModalRegistrarEvento aberto={modalAberto} onClose={() => setModalAberto(false)} />
    </div>
  );
}
