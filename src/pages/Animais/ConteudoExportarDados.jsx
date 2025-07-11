import React, { useState } from "react";
import { exportarAnimaisSQLite } from "../../utils/apiFuncoes.js";
import { buscarTodosAnimais } from "../../sqlite/animais";
import { saveAs } from "file-saver";

const CHAVES = {
  animais: "Animais",
  livroCaixa: "Livro Caixa",
  estoque: "Estoque",
  vacinacoes: "Vacinacoes",
  reproducao: "Reproducao",
  protocolos: "Protocolos",
};

export default function ConteudoExportarDados() {
  const [log, setLog] = useState([]);

  const registrar = (msg) => setLog((l) => [...l, msg]);

  const exportarChave = async (chave) => {
    try {
      let dados = [];
      if (chave === 'animais') {
        dados = await exportarAnimaisSQLite();
      }
      const blob = new Blob([JSON.stringify(dados, null, 2)], {
        type: "application/json",
      });
      saveAs(blob, `${chave}.json`);
      registrar(`✅ Exportado ${chave}`);
    } catch (err) {
      console.error(err);
      registrar(`❌ Erro ao exportar ${chave}`);
    }
  };

  const exportarTodos = async () => {
    for (const chave of Object.keys(CHAVES)) await exportarChave(chave);
  };

  const verificar = async () => {
    try {
      const contagens = await Promise.all(
        Object.keys(CHAVES).map(async (c) => {
          let lista = [];
          if (c === 'animais') {
            lista = await buscarTodosAnimais();
          }
          return `${c}: ${lista.length}`;
        })
      );
      registrar(`Coleções: ${contagens.join(" | ")}`);
    } catch (err) {
      console.error(err);
      registrar("Erro ao verificar coleções");
    }
  };

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-bold">📦 Exportar Dados</h2>

      <div className="space-x-3">
        <button
          onClick={exportarTodos}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          📤 Exportar todas coleções
        </button>

        <button
          onClick={verificar}
          className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
        >
          🔍 Verificar coleções
        </button>
      </div>

      <div className="mt-4 bg-white border rounded p-3 max-h-60 overflow-y-auto text-sm font-mono text-left">
        {log.map((msg, idx) => (
          <div key={idx}>{msg}</div>
        ))}
      </div>
    </div>
  );
}
