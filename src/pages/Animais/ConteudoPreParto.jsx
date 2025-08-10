import React, { useState } from 'react';
import '../../styles/tabelaModerna.css';
import '../../styles/botoes.css';
import { parseBRDate, diffDias } from '@/utils/dateUtils';

export default function ConteudoPreParto({ vacas }) {
  const [diasAntes, setDiasAntes] = useState(5);
  const [filtroDias, setFiltroDias] = useState(5);
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
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [colunaHover, setColunaHover] = useState(null);

  const vacasFiltradas = (Array.isArray(vacas) ? vacas : []).filter(v => {
    const dataParto = parseBRDate(v.previsaoParto);
    const dias = dataParto ? diffDias(dataParto) : null;
    return dias !== null && dias > 0 && dias <= filtroDias;
  });

  const alternarColuna = (coluna) => {
    setColunasVisiveis({ ...colunasVisiveis, [coluna]: !colunasVisiveis[coluna] });
  };

  const aplicarFiltro = () => setFiltroDias(diasAntes);
  const redefinirFiltro = () => {
    setDiasAntes(5);
    setFiltroDias(5);
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
    { chave: 'previsaoParto', titulo: 'Previsão Parto' }
  ];

  return (
    <div className="w-full px-8 py-6 font-sans">
      <div className="flex items-center gap-4 mb-4">
        <label className="text-sm font-medium">Mostrar vacas com parto previsto em até</label>
        <input
          type="number"
          value={diasAntes}
          onChange={(e) => setDiasAntes(Number(e.target.value))}
          className="border px-2 py-1 rounded w-[60px]"
        />
        <span className="text-sm">dias</span>
        <button onClick={aplicarFiltro} className="bg-blue-600 text-white px-3 py-1 rounded">Filtrar</button>
        <button onClick={redefinirFiltro} className="text-red-600 underline text-sm">Redefinir</button>
        <span className="ml-auto text-sm text-gray-600">🐄 {vacasFiltradas.length} vacas encontradas</span>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="mb-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        >
          ⚙️ Ajustar colunas
        </button>
        {mostrarFiltros && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-4">
            {Object.entries(colunasVisiveis).map(([key, visible]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={() => alternarColuna(key)}
                />
                <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
              </label>
            ))}
          </div>
        )}
      </div>

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
              vaca.nLactacoes ?? '—',
              vaca.del,
              vaca.categoria,
              vaca.idade,
              vaca.ultimaIA || '—',
              vaca.parto || vaca.ultimoParto || '—',
              vaca.raca,
              vaca.nomeTouro || vaca.pai || '—',
              vaca.nomeMae || vaca.mae || '—',
              vaca.previsaoParto || '—'
            ];

            return (
              <tr key={i}>
                {colunas.map((col, index) => (
                  colunasVisiveis[col.chave] && (
                    <td key={index} className={colunaHover === index ? 'coluna-hover' : ''}>
                      {dados[index]}
                    </td>
                  )
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
