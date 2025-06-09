import React, { useEffect, useState } from 'react';
import verificarAlertaEstoque from '../../../utils/verificarAlertaEstoque';

export default function ResumoEstoqueCritico() {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    const atualizar = () => {
      const lista = JSON.parse(localStorage.getItem('produtos') || '[]');
      const criticos = lista
        .map((p) => ({ nome: p.nomeComercial, alerta: verificarAlertaEstoque(p) }))
        .filter((p) => p.alerta.status !== 'ok');
      setProdutos(criticos);
    };

    atualizar();
    window.addEventListener('produtosAtualizados', atualizar);
    return () => window.removeEventListener('produtosAtualizados', atualizar);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="text-lg font-bold mb-2">📦 Estoque Crítico</h3>
      {produtos.length === 0 ? (
        <p className="text-gray-500 italic">Nenhum produto crítico.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {produtos.map((p, i) => (
            <div
              key={i}
              className="bg-red-50 rounded-lg p-2 text-sm flex items-center gap-2 shadow"
            >
              <span>⚠️</span>
              <span>{p.nome} {p.alerta.mensagem ? `- ${p.alerta.mensagem}` : ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
