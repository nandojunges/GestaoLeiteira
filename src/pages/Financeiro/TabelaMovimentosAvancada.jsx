import { useEffect, useState } from 'react';
import { adicionarMovimentacao, removerMovimentacao } from '../../utils/financeiro';
import { utils, writeFile } from 'xlsx';
import '../../styles/tabelaModerna.css';

export default function TabelaMovimentosAvancada({ movs = [], onFiltradosChange }) {
  const listaSegura = Array.isArray(movs) ? movs : [];
  const hoje = new Date();
  const ini = new Date();
  ini.setDate(hoje.getDate() - 59);
  const padraoInicio = ini.toISOString().slice(0,10);
  const padraoFim = hoje.toISOString().slice(0,10);
  const [filtros, setFiltros] = useState({ dataInicio: padraoInicio, dataFim: padraoFim, tipo: '', categoria: '' });
  const [periodo, setPeriodo] = useState('60');
  const [pagina, setPagina] = useState(1);
  const TAMANHO = 15;
  const [mostrarModal, setMostrarModal] = useState(false);
  const [novo, setNovo] = useState({
    data: new Date().toISOString().slice(0, 10),
    descricao: '',
    tipo: 'Saída',
    categoria: '',
    subcategoria: '',
    valor: '',
    origem: 'Manual',
  });

  const categorias = Array.from(new Set(listaSegura.map(m => m.categoria).filter(Boolean)));

  const aplicarFiltros = lista => {
    return lista.filter(m => {
      if (filtros.dataInicio && m.data < filtros.dataInicio) return false;
      if (filtros.dataFim && m.data > filtros.dataFim) return false;
      if (filtros.tipo && m.tipo !== filtros.tipo) return false;
      if (filtros.categoria && m.categoria !== filtros.categoria) return false;
      return true;
    });
  };

  const filtrados = aplicarFiltros(listaSegura).sort((a,b) => b.data.localeCompare(a.data));
  useEffect(() => {
    onFiltradosChange && onFiltradosChange(filtrados);
  }, [filtrados, onFiltradosChange]);
  const totalPaginas = Math.ceil(filtrados.length / TAMANHO) || 1;
  const paginaAtual = filtrados.slice((pagina - 1) * TAMANHO, pagina * TAMANHO);

  const totalEntradas = filtrados
    .filter(m => m.tipo === 'Entrada')
    .reduce((s, m) => s + m.valor, 0);
  const totalSaidas = filtrados
    .filter(m => m.tipo === 'Saída')
    .reduce((s, m) => s + m.valor, 0);

  const formatarValor = v => v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
  const formatarData = iso => {
    const d = new Date(iso);
    return isNaN(d) ? iso : d.toLocaleDateString('pt-BR');
  };

  const exportarExcel = () => {
    const ws = utils.json_to_sheet(filtrados);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Movimentos');
    writeFile(wb, 'movimentos.xlsx');
  };

  const abrirModal = () => {
    setNovo({
      data: new Date().toISOString().slice(0, 10),
      descricao: '',
      tipo: 'Saída',
      categoria: '',
      subcategoria: '',
      valor: '',
      origem: 'Manual',
    });
    setMostrarModal(true);
  };

  const salvarManual = () => {
    const valorNum =
      parseFloat(String(novo.valor).replace(/\./g, '').replace(',', '.')) || 0;
    adicionarMovimentacao({ ...novo, valor: valorNum });
    setMostrarModal(false);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8 border-t">
      <h2 className="text-xl font-semibold mb-4">Livro Caixa</h2>
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <select value={periodo} onChange={e=>{
          const val = e.target.value;
          setPeriodo(val);
          if(val === 'todos') {
            setFiltros(f=>({ ...f, dataInicio:'', dataFim:'' }));
          } else {
            const h = new Date();
            const i = new Date();
            i.setDate(h.getDate() - 59);
            setFiltros(f=>({ ...f, dataInicio:i.toISOString().slice(0,10), dataFim:h.toISOString().slice(0,10) }));
          }
        }} className="border p-1 rounded">
          <option value="60">Últimos 60 dias</option>
          <option value="todos">Todos os registros</option>
        </select>
        <input type="date" value={filtros.dataInicio} onChange={e=>setFiltros(f=>({ ...f, dataInicio:e.target.value }))} className="border p-1 rounded" />
        <input type="date" value={filtros.dataFim} onChange={e=>setFiltros(f=>({ ...f, dataFim:e.target.value }))} className="border p-1 rounded" />
        <select value={filtros.tipo} onChange={e=>setFiltros(f=>({ ...f, tipo:e.target.value }))} className="border p-1 rounded">
          <option value="">Tipo</option>
          <option value="Entrada">Entrada</option>
          <option value="Saída">Saída</option>
        </select>
        <select value={filtros.categoria} onChange={e=>setFiltros(f=>({ ...f, categoria:e.target.value }))} className="border p-1 rounded">
          <option value="">Categoria</option>
          {categorias.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex gap-2 ml-auto">
          <button onClick={exportarExcel} className="bg-blue-500 text-white px-3 rounded flex items-center gap-1">📥 Exportar Excel</button>
          <button onClick={abrirModal} className="bg-blue-600 text-white px-3 rounded flex items-center gap-1">➕ Adicionar lançamento manual</button>
        </div>
      </div>
      <div className="text-sm text-gray-600 mb-2">
        🔍 Mostrando: {filtrados.length} lançamentos | {formatarValor(totalEntradas)} em receitas | {formatarValor(totalSaidas)} em despesas
      </div>
      <div className="overflow-x-auto">
        <table className="tabela-padrao w-full table-fixed whitespace-nowrap">
          <thead>
            <tr>
              <th className="w-20">Data</th>
              <th className="w-64">Descrição</th>
              <th className="w-20">Tipo</th>
              <th className="w-36">Categoria</th>
              <th className="w-36">Subcategoria</th>
              <th className="w-24">Valor</th>
              <th className="w-32">Origem</th>
              <th className="w-10">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginaAtual.length ? (
              paginaAtual.map(m => (
                <tr key={m.id} className={m.tipo === 'Entrada' ? 'bg-green-50' : 'bg-red-50'}>
                  <td>{formatarData(m.data)}</td>
                  <td>{m.descricao}</td>
                  <td>{m.tipo === 'Entrada' ? '🟢 Entrada' : '🔴 Saída'}</td>
                  <td>{m.categoria || (m.tipo === 'Saída' && m.origem === 'estoque' ? 'Compra geral' : '-')}</td>
                  <td>{m.subcategoria || '-'}</td>
                  <td className={m.tipo === 'Entrada' ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>{formatarValor(m.valor)}</td>
                  <td>{m.origem || '—'}</td>
                  <td>
                    <button onClick={() => removerMovimentacao(m.id)} title="Excluir" className="hover:text-red-600">🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-gray-400 py-6">Sem dados para exibir</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPaginas }, (_, i) => (
          <button key={i} onClick={() => setPagina(i + 1)} className={`px-3 py-1 rounded ${pagina === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{i + 1}</button>
        ))}
      </div>
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow w-80 space-y-2">
            <h3 className="font-semibold text-lg">Novo lançamento</h3>
            <input type="date" value={novo.data} onChange={e=>setNovo(n=>({...n, data:e.target.value}))} className="border p-1 rounded w-full" />
            <input type="text" placeholder="Descrição" value={novo.descricao} onChange={e=>setNovo(n=>({...n, descricao:e.target.value}))} className="border p-1 rounded w-full" />
            <select value={novo.tipo} onChange={e=>setNovo(n=>({...n, tipo:e.target.value}))} className="border p-1 rounded w-full">
              <option value="Entrada">Entrada</option>
              <option value="Saída">Saída</option>
            </select>
            <input type="text" placeholder="Categoria" value={novo.categoria} onChange={e=>setNovo(n=>({...n, categoria:e.target.value}))} className="border p-1 rounded w-full" />
            <input type="text" placeholder="Subcategoria" value={novo.subcategoria} onChange={e=>setNovo(n=>({...n, subcategoria:e.target.value}))} className="border p-1 rounded w-full" />
            <input type="text" placeholder="Valor" value={novo.valor} onChange={e=>setNovo(n=>({...n, valor:e.target.value}))} className="border p-1 rounded w-full" />
            <input type="text" placeholder="Origem" value={novo.origem} onChange={e=>setNovo(n=>({...n, origem:e.target.value}))} className="border p-1 rounded w-full" />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setMostrarModal(false)} className="px-3 py-1 bg-gray-300 rounded">Cancelar</button>
              <button onClick={salvarManual} className="px-3 py-1 bg-blue-600 text-white rounded">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
