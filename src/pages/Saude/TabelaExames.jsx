import React from 'react';
import '../../styles/tabelaModerna.css';

const resultadoAlterado = (res) => {
  if (!res) return false;
  const txt = String(res).toLowerCase();
  if (txt.includes('alto') || txt.includes('alta')) return true;
  if (txt.includes('baixo') || txt.includes('baixa')) return true;
  if (txt.includes('positivo')) return true;
  const num = parseFloat(txt.replace(',', '.'));
  return !isNaN(num) && (num < 0 || num > 100);
};

export default function TabelaExames({ lista = [], onEditar, onExcluir, abrirAnexo }) {
  const titulos = ['Tipo', 'Data', 'Resultado', 'Anexo', 'Responsável', 'Observações', 'Ações'];

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="tabela-padrao">
        <thead>
          <tr>
            {titulos.map((t, i) => (
              <th key={i}>{t}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lista.length === 0 ? (
            <tr>
              <td colSpan={titulos.length} style={{ textAlign: 'center', padding: '1rem' }}>
                Nenhum exame registrado.
              </td>
            </tr>
          ) : (
            lista.map((e, idx) => (
              <tr key={idx}>
                <td>{e.tipo}</td>
                <td>{e.data}</td>
                <td>
                  {resultadoAlterado(e.resultado) && <span title="Resultado alterado" style={{ color: 'red', marginRight: '0.25rem' }}>🔴</span>}
                  {e.resultado}
                </td>
                <td>{e.anexos && e.anexos.length ? (
                  <button onClick={() => abrirAnexo && abrirAnexo(e.anexos)} title="Abrir anexo">📎</button>
                ) : '—'}</td>
                <td>{e.responsavel}</td>
                <td>{e.observacoes}</td>
                <td className="coluna-acoes">
                  <div className="botoes-tabela">
                    {onEditar && <button className="botao-editar" onClick={() => onEditar(e, idx)}>✏️</button>}
                    {onExcluir && <button className="botao-excluir" onClick={() => onExcluir(idx)}>🗑️</button>}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
