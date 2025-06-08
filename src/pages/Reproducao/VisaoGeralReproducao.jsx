import React, { useState, useEffect } from 'react';
import { carregarAnimaisDoLocalStorage, calcularDEL } from '../Animais/utilsAnimais';
import ModalHistoricoCompleto from "../Animais/ModalHistoricoCompleto";
import ModalConfiguracaoPEV from "./ModalConfiguracaoPEV";
import { getStatusVaca, getAcoesDisponiveis, filtrarAnimaisAtivos } from './utilsReproducao';
import '../../styles/tabelaModerna.css';
import '../../styles/botoes.css';

export default function VisaoGeralReproducao() {
  const [vacas, setVacas] = useState([]);
  const [animalFicha, setAnimalFicha] = useState(null);
  const [mostrarFicha, setMostrarFicha] = useState(false);
  const [colunaHover, setColunaHover] = useState(null);
  const [mostrarModalPEV, setMostrarModalPEV] = useState(false);
  const [configPEV, setConfigPEV] = useState({
    diasPEV: 60,
    permitirPreSincronizacao: false,
    permitirSecagem: true
  });

  useEffect(() => {
    const animais = carregarAnimaisDoLocalStorage();
    const ativos = filtrarAnimaisAtivos(animais);
    setVacas(ativos);

    const config = JSON.parse(localStorage.getItem("configPEV") || "{}");
    setConfigPEV({
      diasPEV: config.diasPEV || 60,
      permitirPreSincronizacao: config.permitirPreSincronizacao || false,
      permitirSecagem: config.permitirSecagem || true,
    });
  }, []);

  const abrirFicha = (vaca) => {
    setAnimalFicha(vaca);
    setMostrarFicha(true);
  };

  const aplicarConfiguracoesPEV = (config) => {
    setConfigPEV(config);
    localStorage.setItem("configPEV", JSON.stringify(config));
    setMostrarModalPEV(false);
  };

  const titulos = [
    "Número", "Brinco", "DEL", "Status Atual", "Última Ação", "Próxima Ação", "Data Prevista", "Ações", "Ficha"
  ];

  const obterStatus = (vaca, del) => {
    const statusBase = (vaca.statusReprodutivo || '').toLowerCase();
    if (statusBase === 'prenhe') return '✅ Prenhe confirmada';
    if (statusBase === 'seca') return '🔴 Seca';
    const statusPEV = getStatusVaca(del);
    return statusPEV === 'Liberada' ? '🟢 Liberada' : '🔵 Pós-parto (PEV)';
  };

  const obterProximaAcao = (vaca) => {
    return vaca.proximaAcao?.tipo || '—';
  };

  const obterDataProximaAcao = (vaca) => {
    return vaca.proximaAcao?.dataPrevista || '—';
  };

  const renderizarMenuAcoes = (vaca, del) => {
    const opcoes = getAcoesDisponiveis(del);

    return (
      <select
        onChange={(e) => {
          const acao = e.target.value;
          if (acao !== "—") alert(`Selecionado: ${acao} para a vaca ${vaca.numero}`);
          e.target.selectedIndex = 0;
        }}
        style={{ width: "100%", padding: "0.4rem", borderRadius: "0.5rem", border: "1px solid #ccc" }}
      >
        <option>—</option>
        {opcoes.map((opcao, i) => (
          <option key={i}>{opcao}</option>
        ))}
      </select>
    );
  };

  return (
    <div className="w-full px-8 py-6 font-sans">
      <div style={{ marginBottom: "1rem", textAlign: "right" }}>
        <button
          onClick={() => setMostrarModalPEV(true)}
          className="botao-acao"
        >
          ⚙️ Configurar PEV
        </button>
      </div>

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
          {vacas.map((vaca, index) => {
            const del = calcularDEL(vaca.ultimoParto || vaca.dataParto);
            const statusAtual = obterStatus(vaca, del);
            const proximaAcao = obterProximaAcao(vaca);
            const dataProximaAcao = obterDataProximaAcao(vaca);

            const dados = [
              vaca.numero,
              vaca.brinco || '—',
              del,
              statusAtual,
              vaca.ultimaAcao?.tipo || '—',
              proximaAcao,
              dataProximaAcao,
              renderizarMenuAcoes(vaca, del),
              <button
                onClick={() => abrirFicha(vaca)}
                className="botao-acao pequeno"
              >
                📁 Ficha
              </button>
            ];

            return (
              <tr key={index} className={statusAtual.includes('Prenhe') ? 'tr-prenha' : ''}>
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

      {mostrarFicha && animalFicha && (
        <ModalHistoricoCompleto
          animal={animalFicha}
          onClose={() => {
            setMostrarFicha(false);
            setAnimalFicha(null);
          }}
        />
      )}

      {mostrarModalPEV && (
        <ModalConfiguracaoPEV
          onClose={() => setMostrarModalPEV(false)}
          onAplicar={aplicarConfiguracoesPEV}
        />
      )}
    </div>
  );
}
