import React from 'react';
import '../../styles/tabelaModerna.css';

export default function TabelaTratamentos({ lista = [], onEditar, onExcluir }) {
  const titulos = ['Data', 'Animal', 'Medicamento', 'Dose', 'Via', 'Carência', 'Aplicador', 'Ações'];

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
                Nenhum tratamento registrado.
              </td>
            </tr>
          ) : (
            lista.map((t, idx) => (
              <tr key={idx}>
                <td>{t.data}</td>
                <td>{t.animal}</td>
                <td>{t.medicamento}</td>
                <td>{t.dose} {t.unidade}</td>
                <td>{t.via}</td>
                <td>{t.carencia || '—'}</td>
                <td>{t.aplicador}</td>
                <td className="coluna-acoes">
                  <div className="botoes-tabela">
                    <button className="botao-editar" onClick={() => onEditar && onEditar(t, idx)}>Editar</button>
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
