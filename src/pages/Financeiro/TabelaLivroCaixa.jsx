import { useState } from 'react';
import { removerMovimentacao, atualizarMovimentacao } from '../../utils/financeiro';
import '../../styles/tabelaModerna.css';
import '../../styles/botoes.css';

export default function TabelaLivroCaixa({ dados = [] }) {
  const listaSegura = Array.isArray(dados) ? dados : [];
  const [editando, setEditando] = useState(null);

  const salvar = () => {
    if (!editando) return;
    atualizarMovimentacao(editando.id, editando);
    setEditando(null);
  };

  const formatarValor = v => v.toLocaleString('pt-BR',{ style:'currency', currency:'BRL' });

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="overflow-x-auto">
        <table className="tabela-padrao w-full table-fixed whitespace-nowrap">
          <thead>
            <tr>
              <th className="w-20">Data</th>
              <th className="w-28">Categoria</th>
              <th className="w-56">Descrição</th>
              <th className="w-20">Tipo</th>
              <th className="w-24">Valor</th>
              <th className="w-32">Forma</th>
              <th className="w-28">Centro</th>
              <th className="w-16">Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaSegura.map((m, index) => (
              <tr key={`fin-${m.data}-${m.timestamp ?? m.id ?? 'item'}-${index}`} className="hover:bg-gray-100">
                <td>{m.data}</td>
                <td>{m.categoria || '-'}</td>
                <td>
                  {m.descricao}
                  {m.observacao && (
                    <span className="ml-1" title={m.observacao}>📝</span>
                  )}
                </td>
                <td className={m.tipo === 'Entrada' ? 'text-green-700' : 'text-red-700'}>{m.tipo}</td>
                <td className={m.tipo === 'Entrada' ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>{formatarValor(m.valor)}</td>
                <td>{m.formaPagamento || '-'}</td>
                <td>{m.centroCusto || '-'}</td>
                <td className="coluna-acoes">
                  <div className="botoes-tabela">
                    <button className="botao-editar" onClick={() => setEditando(m)}>✏️</button>
                    <button className="botao-excluir" onClick={() => removerMovimentacao(m.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
            {!listaSegura.length && (
              <tr>
                <td colSpan="7" className="text-center text-gray-500 py-8">Nenhum lançamento encontrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {editando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 rounded shadow w-full max-w-sm space-y-2">
            <h3 className="font-semibold text-lg text-center">Editar lançamento</h3>
            <input type="date" value={editando.data} onChange={e=>setEditando(n=>({ ...n, data:e.target.value }))} className="border p-1 rounded w-full" />
            <input type="text" value={editando.categoria} onChange={e=>setEditando(n=>({ ...n, categoria:e.target.value }))} className="border p-1 rounded w-full" />
            <input type="text" value={editando.descricao} onChange={e=>setEditando(n=>({ ...n, descricao:e.target.value }))} className="border p-1 rounded w-full" />
            <select value={editando.tipo} onChange={e=>setEditando(n=>({ ...n, tipo:e.target.value }))} className="border p-1 rounded w-full">
              <option value="Entrada">Entrada</option>
              <option value="Saída">Saída</option>
            </select>
            <input type="number" value={editando.valor} onChange={e=>setEditando(n=>({ ...n, valor:e.target.value }))} className="border p-1 rounded w-full" />
            <input type="text" value={editando.formaPagamento} onChange={e=>setEditando(n=>({ ...n, formaPagamento:e.target.value }))} className="border p-1 rounded w-full" />
            <input type="text" value={editando.centroCusto} onChange={e=>setEditando(n=>({ ...n, centroCusto:e.target.value }))} className="border p-1 rounded w-full" />
            <input type="text" value={editando.observacao} onChange={e=>setEditando(n=>({ ...n, observacao:e.target.value }))} className="border p-1 rounded w-full" placeholder="Observações" />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={()=>setEditando(null)} className="botao-cancelar pequeno">Cancelar</button>
              <button onClick={salvar} className="botao-acao pequeno">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
