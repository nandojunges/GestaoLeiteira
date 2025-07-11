import React, { useEffect, useState } from 'react';
import verificarAlertaEstoque from '../../../utils/verificarAlertaEstoque';
import { db } from '../../../utils/db';

export default function ResumoEstoqueCritico() {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    const atualizar = async () => {
      const lista = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM produtos', [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
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
              <img src="/icones/avisos.png" alt="Alerta" style={{ width: '22px', height: '22px', marginRight: '8px' }} />
              <span>{p.nome} {p.alerta.mensagem ? `- ${p.alerta.mensagem}` : ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
