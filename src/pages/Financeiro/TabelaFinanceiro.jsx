import { useState } from 'react';
import { removerMovimentacao, atualizarMovimentacao } from '../../utils/financeiro';
import '../../styles/tabelaModerna.css';

export default function TabelaFinanceiro({ movs = [], tipo }) {
  const listaSegura = Array.isArray(movs) ? movs : [];
  const [editar, setEditar] = useState(null);

  const vendas = listaSegura.filter(
    (l) => l.origem === 'animal' && l.tipo === 'Entrada'
  );

  const salvarEdicao = () => {
    if (!editar) return;
    atualizarMovimentacao(editar.id, editar);
    setEditar(null);
  };

  const formatarValor = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const totalEntradas = vendas.filter(m => m.tipo === 'Entrada').reduce((s,m) => s+m.valor,0);
  const totalSaidas = vendas.filter(m => m.tipo === 'Saída').reduce((s,m) => s+m.valor,0);

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="overflow-x-auto">
        <table className="tabela-padrao w-full table-fixed whitespace-nowrap">
          <thead>
            <tr>
              <th className="w-20">Data</th>
              <th className="w-64">Descrição</th>
              <th className="w-36">Categoria</th>
              <th className="w-24">Valor</th>
            </tr>
          </thead>
          <tbody>
            {vendas.map(m => (
              <tr key={m.id} className="hover:bg-gray-100">
                <td>{m.data}</td>
                <td>{m.descricao}</td>
                <td>{m.categoria || '-'}</td>
                <td className={m.tipo === 'Entrada' ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>{formatarValor(m.valor)}</td>
            </tr>
          ))}
            {!vendas.length && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">Nenhum lançamento encontrado</td>
              </tr>
            )}
            <tr className="font-semibold bg-gray-50">
              <td colSpan="4" className="text-center">
                Total no período: {formatarValor(totalEntradas)} em receitas | {formatarValor(totalSaidas)} em despesas
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {editar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow w-80 space-y-2">
            <h3 className="font-semibold text-lg">Editar lançamento</h3>
            <input type="date" value={editar.data} onChange={e => setEditar(n => ({ ...n, data: e.target.value }))} className="border p-1 rounded w-full" />
            <input type="text" value={editar.descricao} onChange={e => setEditar(n => ({ ...n, descricao: e.target.value }))} className="border p-1 rounded w-full" />
            <select value={editar.tipo} onChange={e => setEditar(n => ({ ...n, tipo: e.target.value }))} className="border p-1 rounded w-full">
              <option value="Entrada">Entrada</option>
              <option value="Saída">Saída</option>
            </select>
            <input type="text" value={editar.categoria} onChange={e => setEditar(n => ({ ...n, categoria: e.target.value }))} className="border p-1 rounded w-full" />
            <input type="text" value={editar.valor} onChange={e => setEditar(n => ({ ...n, valor: e.target.value }))} className="border p-1 rounded w-full" />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditar(null)} className="px-3 py-1 bg-gray-300 rounded">Cancelar</button>
              <button onClick={salvarEdicao} className="px-3 py-1 bg-blue-600 text-white rounded">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
