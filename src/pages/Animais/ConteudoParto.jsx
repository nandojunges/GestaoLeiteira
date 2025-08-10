import React, { useState } from 'react';
import ModalRegistrarParto from './ModalRegistrarParto';
import '../../styles/botoes.css';
import '../../styles/tabelaModerna.css';
import { parseBRDate, diffDias } from '@/utils/dateUtils';
import { buscarAnimais } from '../../utils/apiFuncoes';
import { toast } from 'react-toastify';

export default function ConteudoParto({ vacas = [], onAtualizar }) {
  const [colunasVisiveis, setColunasVisiveis] = useState({
    numero: true, brinco: true, lactacoes: true, del: true,
    categoria: true, idade: true, ultimaIA: true, ultimoParto: true,
    raca: true, pai: true, mae: true, previsaoParto: true, acoes: true
  });

  const [mostrarModalParto, setMostrarModalParto] = useState(false);
  const [vacaSelecionada, setVacaSelecionada] = useState(null);
  const [colunaHover, setColunaHover] = useState(null);
  const [mostrarInfo, setMostrarInfo] = useState(false);

  // ⏬ Atualiza local ao montar e após evento de parto
  const vacasFiltradas = (Array.isArray(vacas) ? vacas : []).filter(v => {
    const previsao = parseBRDate(v.previsaoParto);
    const dif = previsao ? diffDias(previsao) : null;
    return dif !== null && dif <= 0;
  });

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
    { chave: 'previsaoParto', titulo: 'Previsão de Parto' },
    { chave: 'acoes', titulo: 'Ações' }
  ];

  return (
    <div className="w-full px-8 py-6 font-sans">
      <div className="flex justify-between mb-2">
        <img
          src="/icones/informacoes.png"
          alt="Informações"
          style={{
            width: 28,
            height: 28,
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            boxShadow: 'none',
          }}
          onClick={() => setMostrarInfo(!mostrarInfo)}
        />
        <span className="text-sm text-gray-600">🍼 {vacasFiltradas.length} vacas encontradas</span>
      </div>

      {mostrarInfo && (
        <div className="text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded p-3 mb-4">
          Esta aba mostra automaticamente as vacas com parto previsto nos próximos 10 dias.
          Vacas com parto atrasado também permanecem visíveis até que o parto seja lançado manualmente.
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
        <ModalRegistrarParto
          animal={vacaSelecionada}
          onClose={() => setMostrarModalParto(false)}
          onRegistrado={async () => {
            try {
              const lista = await buscarAnimais();
              onAtualizar && onAtualizar(lista);
            } catch (err) {
              console.error('Erro ao atualizar lista de animais:', err);
              toast.error('Erro ao atualizar lista de animais');
            }
          }}
        />
      )}
    </div>
  );
}
