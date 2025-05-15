import React, { useState } from 'react';
import AcaoParto from './AcaoParto';
import '../../styles/botoes.css';
import '../../styles/tabelaModerna.css';

export default function ConteudoParto({ vacas }) {
  const [colunasVisiveis, setColunasVisiveis] = useState({
    numero: true,
    brinco: true,
    lactacoes: true,
    del: true,
    categoria: true,
    idade: true,
    ultimaIA: true,
    ultimoParto: true,
    raca: true,
    pai: true,
    mae: true,
    dataPrevistaParto: true,
    acoes: true
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarModalParto, setMostrarModalParto] = useState(false);
  const [vacaSelecionada, setVacaSelecionada] = useState(null);
  const [colunaHover, setColunaHover] = useState(null);
  const [mostrarInfo, setMostrarInfo] = useState(false);

  const hoje = new Date();

  const vacasFiltradas = vacas.filter(v => {
    if ((v.sexo || '').toLowerCase() !== 'femea' || !v.dataPrevistaParto) return false;
    const [dia, mes, ano] = v.dataPrevistaParto.split('/').map(Number);
    const dataParto = new Date(ano, mes - 1, dia);
    const diff = Math.floor((dataParto - hoje) / (1000 * 60 * 60 * 24));
    return diff <= 10; // mostra até 10 dias antes e também atrasadas
  });

  const alternarColuna = (coluna) => {
    setColunasVisiveis({ ...colunasVisiveis, [coluna]: !colunasVisiveis[coluna] });
  };

  const abrirModalParto = (vaca) => {
    setVacaSelecionada(vaca);
    setMostrarModalParto(true);
  };

  const colunas = [
    { chave: 'numero', titulo: 'Número' },
    { chave: 'brinco', titulo: 'Brinco' },
    { chave: 'lactacoes', titulo: 'Lactações' },
    { chave: 'del', titulo: 'DEL' },
    { chave: 'categoria', titulo: 'Categoria' },
    { chave: 'idade', titulo: 'Idade' },
    { chave: 'ultimaIA', titulo: 'Última IA' },
    { chave: 'ultimoParto', titulo: 'Último Parto' },
    { chave: 'raca', titulo: 'Raça' },
    { chave: 'pai', titulo: 'Pai' },
    { chave: 'mae', titulo: 'Mãe' },
    { chave: 'dataPrevistaParto', titulo: 'Previsão de Parto' },
    { chave: 'acoes', titulo: 'Ações' }
  ];

  return (
    <div className="w-full px-8 py-6 font-sans">
      <div className="flex justify-between mb-2">
        <button
          onClick={() => setMostrarInfo(!mostrarInfo)}
          className="px-3 py-1 text-blue-600 text-lg hover:text-blue-800"
          title="Informação"
        >
          ℹ️
        </button>
        <span className="text-sm text-gray-600">🍼 {vacasFiltradas.length} vacas encontradas</span>
      </div>

      {mostrarInfo && (
        <div className="text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded p-3 mb-4">
          Esta aba mostra automaticamente as vacas com parto previsto nos próximos 10 dias. Vacas com parto atrasado também permanecem visíveis até que o parto seja lançado manualmente.
        </div>
      )}

      <table className="tabela-padrao">
        <thead>
          <tr>
            {colunas.map((col, index) =>
              colunasVisiveis[col.chave] && (
                <th
                  key={col.chave}
                  onMouseEnter={() => setColunaHover(index)}
                  onMouseLeave={() => setColunaHover(null)}
                  className={colunaHover === index ? 'coluna-hover' : ''}
                >
                  {col.titulo}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {vacasFiltradas.map((vaca, i) => {
            const dados = [
              vaca.numero,
              vaca.brinco,
              vaca.numeroPartos ?? '—',
              vaca.del,
              vaca.categoria,
              vaca.idade,
              vaca.ultimaIA || '—',
              vaca.ultimoParto || '—',
              vaca.raca,
              vaca.nomeTouro || vaca.pai || '—',
              vaca.nomeMae || vaca.mae || '—',
              vaca.dataPrevistaParto || '—'
            ];

            return (
              <tr key={i}>
                {colunas.map((col, index) => {
                  if (!colunasVisiveis[col.chave]) return null;

                  if (col.chave === 'acoes') {
                    return (
                      <td key={index} className={colunaHover === index ? 'coluna-hover' : ''}>
                        <button onClick={() => abrirModalParto(vaca)} className="botao-acao">
                          Parto
                        </button>
                      </td>
                    );
                  }

                  return (
                    <td key={index} className={colunaHover === index ? 'coluna-hover' : ''}>
                      {dados[index]}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {mostrarModalParto && vacaSelecionada && (
        <AcaoParto
          vaca={vacaSelecionada}
          onFechar={() => setMostrarModalParto(false)}
          onRegistrar={(dados) => {
            console.log('✅ Parto registrado:', dados);
            setMostrarModalParto(false);
          }}
        />
      )}
    </div>
  );
}
