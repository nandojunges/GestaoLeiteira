import React, { useMemo, useState } from 'react';
import CabecalhoSaude from './CabecalhoSaude';

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
      ocorrencias: [{ data: '2023-05-01', descricao: 'Mastite' }],
      tratamentos: [{ data: '2023-05-02', medicamento: 'Antibiótico', ativo: true }],
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
      ocorrencias: [{ data: '2023-04-15', descricao: 'Casco' }],
      tratamentos: [],
      status: 'Pendente'
    },
    {
      id: 4,
      numero: 'A004',
      nome: 'Aurora',
      grupo: 'Lote 2',
      ocorrencias: [{ data: '2023-05-03', descricao: 'Febre' }],
      tratamentos: [{ data: '2023-05-04', medicamento: 'Antitérmico', ativo: false }],
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
      icone: '🐄',
      cor: 'text-blue-700'
    },
    {
      id: 'tratamento',
      label: 'Tratamento ativo',
      valor: totalTratamentoAtivo,
      icone: '✏️',
      cor: 'text-orange-600'
    },
    {
      id: 'ocorrencias',
      label: 'Ocorrências no mês',
      valor: totalOcorrenciasMes,
      icone: '📅',
      cor: 'text-gray-700'
    }
  ];

  const mapaStatus = {
    'Tratamento ativo': { icone: '🟧', cor: 'text-orange-500' },
    Pendente: { icone: '⏳', cor: 'text-gray-500' },
    Saudável: { icone: '✅', cor: 'text-green-600' }
  };

  return (
    <div className="p-4 font-poppins">
      <h1 className="text-2xl font-bold mb-4">Saúde dos Animais</h1>

      <CabecalhoSaude
        busca={busca}
        setBusca={setBusca}
        grupos={grupos}
        grupoFiltro={grupoFiltro}
        setGrupoFiltro={setGrupoFiltro}
        statusFiltro={statusFiltro}
        setStatusFiltro={setStatusFiltro}
        cards={cards}
      />

      {/* Tabela com dados dos animais */}
      <div className="overflow-x-auto mt-6">
        <table className="table-auto w-full text-sm">
          <thead className="bg-blue-100 text-gray-800">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Número/Nome</th>
              <th className="px-3 py-2 text-left font-semibold">Grupo</th>
              <th className="px-3 py-2 text-left font-semibold">Última Ocorrência</th>
              <th className="px-3 py-2 text-left font-semibold">Último Tratamento</th>
              <th className="px-3 py-2 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {animaisFiltrados.map(a => {
              const ultimaOc = a.ocorrencias.sort((b, c) => c.data.localeCompare(b.data))[0];
              const ultimoTr = a.tratamentos.sort((b, c) => c.data.localeCompare(b.data))[0];
              const infoStatus = mapaStatus[a.status] || mapaStatus['Pendente'];
              return (
                <tr key={a.id} className="border-b odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2">{a.numero} - {a.nome}</td>
                  <td className="px-3 py-2">{a.grupo}</td>
                  <td className="px-3 py-2">{ultimaOc ? formatarData(ultimaOc.data) : '—'}</td>
                  <td className="px-3 py-2">
                    {ultimoTr ? `${formatarData(ultimoTr.data)} - ${ultimoTr.medicamento}` : '—'}
                  </td>
                  <td className="px-3 py-2">
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
