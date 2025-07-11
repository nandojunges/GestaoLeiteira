import React, { useEffect, useState } from 'react';
import {
  salvarBezerrosSQLite,
  buscarTodosBezerrosSQLite,
  removerBezerraSQLite,
} from '../../utils/apiFuncoes.js';

export default function Bezerras() {
  const [lista, setLista] = useState([]);

  const carregar = async () => {
    try {
      const dados = await buscarTodosBezerrosSQLite();
      setLista(Array.isArray(dados) ? dados : []);
    } catch (err) {
      console.error('Erro ao buscar bezerras:', err);
      setLista([]);
    }
  };

  useEffect(() => {
    carregar();
    window.addEventListener('bezerrasAtualizadas', carregar);
    return () => window.removeEventListener('bezerrasAtualizadas', carregar);
  }, []);

  const adicionar = async () => {
    const nome = window.prompt('Nome da bezerra:');
    if (!nome) return;
    try {
      await salvarBezerrosSQLite([{ nome }]);
      window.dispatchEvent(new Event('bezerrasAtualizadas'));
    } catch (err) {
      console.error('Erro ao inserir bezerra:', err);
    }
  };

  const remover = async (id) => {
    if (!window.confirm('Deseja remover esta bezerra?')) return;
    try {
      await removerBezerraSQLite(id);
      window.dispatchEvent(new Event('bezerrasAtualizadas'));
    } catch (err) {
      console.error('Erro ao remover bezerra:', err);
    }
  };

  return (
    <div className="p-4 font-poppins">
      <button
        onClick={adicionar}
        className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        + Nova Bezerra
      </button>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Nome</th>
            <th className="border p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(lista) && lista.length > 0 ? (
            lista.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="border p-2 text-center">{b.id}</td>
                <td className="border p-2">{b.nome || '-'}</td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => remover(b.id)}
                    className="text-red-600 hover:underline"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="border p-2 text-center text-gray-500">
                Nenhuma bezerra cadastrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
