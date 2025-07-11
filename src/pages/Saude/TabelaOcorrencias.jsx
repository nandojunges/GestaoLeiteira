import React from 'react';
import '../../styles/tabelaModerna.css';

export default function TabelaOcorrencias({ lista = [], onEditar, onExcluir }) {
  const titulos = ['Data', 'Animal', 'Diagnóstico', 'Gravidade', 'Responsável', 'Observações', 'Ações'];

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
                Nenhuma ocorrência registrada.
              </td>
            </tr>
          ) : (
            lista.map((o, idx) => (
              <tr key={idx}>
                <td>{o.data}</td>
                <td>{o.animal}</td>
                <td>{o.diagnostico}</td>
                <td>{o.gravidade}</td>
                <td>{o.responsavel}</td>
                <td>{o.observacoes}</td>
                <td className="coluna-acoes">
                  <div className="botoes-tabela">
                    <button className="botao-editar" onClick={() => onEditar && onEditar(o, idx)}>Editar</button>
                    <button className="botao-excluir" onClick={() => onExcluir && onExcluir(idx)}>Excluir</button>
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
