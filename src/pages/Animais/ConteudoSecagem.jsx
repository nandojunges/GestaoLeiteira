// src/pages/Animais/ConteudoSecagem.jsx
import React, { useState } from 'react';
import AcaoSecagem from './AcaoSecagem';
import '../../styles/tabelaModerna.css';
import '../../styles/botoes.css';
import { buscarAnimais } from '../../utils/apiFuncoes';
import { toast } from 'react-toastify';

function calcularPrevisaoParto(dataIA) {
  if (!dataIA || dataIA.length !== 10) return null;
  const [dia, mes, ano] = dataIA.split('/');
  const data = new Date(`${ano}-${mes}-${dia}`);
  data.setDate(data.getDate() + 280);
  return data.toLocaleDateString('pt-BR');
}

export default function ConteudoSecagem({ vacas, onAtualizar }) {
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
  const [mostrarModalSecagem, setMostrarModalSecagem] = useState(false);
  const [vacaSelecionada, setVacaSelecionada] = useState(null);
  const [colunaHover, setColunaHover] = useState(null);

  const alternarColuna = (coluna) => {
    setColunasVisiveis({ ...colunasVisiveis, [coluna]: !colunasVisiveis[coluna] });
  };

  const abrirModalSecagem = (vaca) => {
    setVacaSelecionada(vaca);
    setMostrarModalSecagem(true);
  };

  const aplicarSecagem = async () => {
    setMostrarModalSecagem(false);
    try {
      const lista = await buscarAnimais();
      onAtualizar && onAtualizar(lista);
    } catch (err) {
      console.error('Erro ao atualizar lista de animais:', err);
      toast.error('Erro ao atualizar lista de animais');
    }
  };

  const vacasFiltradas = (Array.isArray(vacas) ? vacas : []).filter(
    (v) => v.status === 2
  );

  const titulos = [
    "Número", "Brinco", "Lactações", "DEL", "Categoria", "Idade",
    "Última IA", "Último Parto", "Raça", "Pai", "Mãe", "Previsão de Parto", "Ações"
  ];

  return (
    <div className="w-full px-8 py-6 font-sans">
      <div className="flex justify-between mb-4">
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-gray-300 shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-100 transition duration-150"
        >
          ⚙️ Ajustar colunas
        </button>
      </div>

      {mostrarFiltros && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-4 px-2">
          {Object.keys(colunasVisiveis).map((coluna) => (
            <label key={coluna} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={colunasVisiveis[coluna]}
                onChange={() => alternarColuna(coluna)}
              />
              <span>{coluna.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
            </label>
          ))}
        </div>
      )}

      <table className="tabela-padrao">
        <thead>
          <tr>
            {titulos.map((titulo, index) => (
              <th
                key={index}
                onMouseEnter={() => setColunaHover(index)}
                onMouseLeave={() => setColunaHover(null)}
                className={colunaHover === index ? 'coluna-hover' : ''}
              >
                {titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vacasFiltradas.map((vaca, i) => {
            const dados = [
              vaca.numero,
              vaca.brinco,
              vaca.nLactacoes ?? '—',
              vaca.del ?? '—',
              vaca.categoria,
              vaca.idade,
              vaca.ultimaIA || '—',
              vaca.ultimoParto || '—',
              vaca.raca,
              vaca.nomeTouro || vaca.pai || '—',
              vaca.nomeMae || vaca.mae || '—',
              calcularPrevisaoParto(vaca.ultimaIA) || '—',
              <button className="botao-editar" onClick={() => abrirModalSecagem(vaca)}>Secar</button>
            ];

            return (
              <tr key={i}>
                {dados.map((conteudo, colIdx) => (
                  <td key={colIdx} className={colunaHover === colIdx ? 'coluna-hover' : ''}>
                    {conteudo}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {mostrarModalSecagem && vacaSelecionada && (
        <AcaoSecagem
          vaca={vacaSelecionada}
          onFechar={() => setMostrarModalSecagem(false)}
          onAplicar={aplicarSecagem}
        />
      )}
    </div>
  );
}
