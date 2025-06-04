import React, { useState, useEffect } from 'react';
import { carregarAnimaisDoLocalStorage, calcularDEL } from '../Animais/utilsAnimais';
import ModalHistoricoCompleto from "../Animais/ModalHistoricoCompleto";
import ModalConfiguracaoPEV from "./ModalConfiguracaoPEV";
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
    setVacas(animais);

    const config = JSON.parse(localStorage.getItem("configPEV") || "{}");
    setConfigPEV({
      diasPEV: config.diasPEV || 60,
      permitirPreSincronizacao: config.permitirPreSincronizacao || false,
      permitirSecagem: config.permitirSecagem || true
    });
  }, []);

  const abrirFicha = (vaca) => {
    setAnimalFicha(vaca);
    setMostrarFicha(true);
  };

  const aplicarConfiguracoesPEV = (config) => {
    console.log("🔥 CONFIG PEV APLICADA!", config);

    setConfigPEV(config);

    const novasVacas = vacas.map((vaca) => {
      console.log("🐮 Avaliando vaca:", vaca.numero);
      if (vaca.statusReprodutivo === "pos-parto") {
        const del = calcularDEL(vaca.ultimoParto || vaca.dataParto);
        console.log("📌 DEL:", del, "diasPEV:", config.diasPEV);
        if (del >= config.diasPEV) {
          console.log("✅ LIBERADA!");
          return {
            ...vaca,
            statusReprodutivo: "liberada",
            proximaAcao: {
              tipo: config.permitirPreSincronizacao ? "Iniciar Pré-sincronização" : "Iniciar Protocolo",
              dataPrevista: "—"
            },
          };
        } else {
          console.log("⏳ Ainda no PEV");
          return {
            ...vaca,
            statusReprodutivo: "pos-parto",
            proximaAcao: { tipo: "Aguardar", dataPrevista: "—" }
          };
        }
      }
      return vaca;
    });

    console.log("🔄 NOVAS VACAS:", novasVacas);

    // 🚀 Garante nova cópia para forçar re-render
    setVacas([...novasVacas]);
    localStorage.setItem("animais", JSON.stringify(novasVacas));
    setMostrarModalPEV(false);
  };

  const titulos = [
    "Número", "Brinco", "DEL", "Status Atual", "Última Ação", "Próxima Ação", "Data Prevista", "Ações", "Ficha"
  ];

  const obterStatus = (vaca) => {
    const status = (vaca.statusReprodutivo || '').toLowerCase();
    if (status === 'prenhe') return '✅ Prenhe confirmada';
    if (status === 'liberada') return '🟢 Liberada';
    if (status === 'pos-parto') return '🔵 Pós-parto (PEV)';
    if (status === 'protocolo') return '🟠 Em protocolo';
    if (status === 'diagnostico') return '🟡 Aguardando diagnóstico';
    if (status === 'vazia') return '❌ Vazia';
    return '—';
  };

  const obterProximaAcao = (vaca) => {
    return vaca.proximaAcao?.tipo || '—';
  };

  const obterDataProximaAcao = (vaca) => {
    return vaca.proximaAcao?.dataPrevista || '—';
  };

  const renderizarMenuAcoes = (vaca, del, statusAtual) => {
    const opcoes = [];
    if (statusAtual.includes('pós-parto') && del <= configPEV.diasPEV && configPEV.permitirPreSincronizacao) {
      opcoes.push("Iniciar Pré-sincronização");
    }
    if (statusAtual.includes('liberada')) {
      opcoes.push("Registrar CIO", "Iniciar Protocolo");
    }
    if (configPEV.permitirSecagem && del > 280) {
      opcoes.push("Registrar Secagem");
    }
    opcoes.push("Registrar Ocorrência Clínica");

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
            const statusAtual = obterStatus(vaca);
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
              renderizarMenuAcoes(vaca, del, statusAtual),
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
