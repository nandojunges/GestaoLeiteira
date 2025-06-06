import React, { useState, useEffect } from "react";
import ModalMediçãoLeite from "./ModalMediçãoLeite";
import ModalRegistroLeite from "./ModalRegistroLeite";
import { carregarAnimaisDoLocalStorage, calcularDEL } from "../Animais/utilsAnimais";
import "../../styles/tabelaModerna.css";
import "../../styles/botoes.css";

export default function ControleLeiteiro() {
  const [vacas, setVacas] = useState([]);
  const [modalMedicaoAberto, setModalMedicaoAberto] = useState(false);
  const [vacaSelecionada, setVacaSelecionada] = useState(null);
  const [colunaHover, setColunaHover] = useState(null);
  const [dataAtual, setDataAtual] = useState(() => {
    const hoje = new Date();
    return hoje.toISOString().split("T")[0]; // yyyy-MM-dd
  });

  const atualizarListaVacas = () => {
    const todosAnimais = carregarAnimaisDoLocalStorage();
    const emLactacao = todosAnimais.filter((a) => a.status === "lactacao");
    setVacas(emLactacao);
  };

  useEffect(() => {
    atualizarListaVacas();
  }, []);

  useEffect(() => {
    const atualizar = () => atualizarListaVacas();
    window.addEventListener("animaisAtualizados", atualizar);
    return () => window.removeEventListener("animaisAtualizados", atualizar);
  }, []);

  const getDatasComMedicao = () => {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith("medicaoLeite_"))
      .map((key) => key.replace("medicaoLeite_", ""))
      .sort((a, b) => new Date(a) - new Date(b));
  };

  const irParaAnterior = () => {
    const todas = getDatasComMedicao();
    const anterior = todas
      .filter((d) => new Date(d) < new Date(dataAtual))
      .pop();
    if (anterior) setDataAtual(anterior);
  };

  const irParaProxima = () => {
    const todas = getDatasComMedicao();
    const proxima = todas.find((d) => new Date(d) > new Date(dataAtual));
    if (proxima) setDataAtual(proxima);
  };

  const abrirModalMedicao = () => setModalMedicaoAberto(true);
  const fecharModalMedicao = () => setModalMedicaoAberto(false);

  const abrirModalRegistroLeite = (vaca) => setVacaSelecionada(vaca);
  const fecharModalRegistroLeite = () => setVacaSelecionada(null);

  const titulos = [
    "Número", "Brinco", "DEL", "Manhã", "Tarde", "3ª", "Total", "Última Medição", "Lote", "Ação"
  ];

  const chave = `medicaoLeite_${dataAtual}`;
  const registro = JSON.parse(localStorage.getItem(chave) || "{}");
  const medicoesDoDia = registro.dados || {};

  const datasDisponiveis = getDatasComMedicao();
  const temAnterior = datasDisponiveis.some(
    (d) => new Date(d) < new Date(dataAtual)
  );
  const temProxima = datasDisponiveis.some(
    (d) => new Date(d) > new Date(dataAtual)
  );

  return (
    <div className="w-full px-8 py-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h2 className="titulo-secao">📊 Controle Leiteiro</h2>
        <button className="botao-acao" onClick={abrirModalMedicao}>➕ Nova Medição</button>
      </div>

      {/* Campo de data com navegação */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={dataAtual || new Date().toISOString().split("T")[0]}
            onChange={(e) => setDataAtual(e.target.value)}
            className="border border-gray-300 text-base font-medium shadow-sm"
            style={{
              width: "200px",
              height: "42px",
              padding: "0 12px",
              borderRadius: "8px",
            }}
          />

          {[
            { dir: "left", action: irParaAnterior, disabled: !temAnterior },
            { dir: "right", action: irParaProxima, disabled: !temProxima },
          ].map(({ dir, action, disabled }, idx) => (
            <button
              key={idx}
              onClick={action}
              disabled={disabled}
              style={{
                width: "42px",
                height: "42px",
                backgroundColor: "#2563eb",
                color: "white",
                fontSize: "18px",
                border: "none",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
                opacity: disabled ? 0.6 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1e40af")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
            >
              <span
                style={{
                  display: "inline-block",
                  transform: dir === "left" ? "rotate(180deg)" : "none",
                  fontSize: "18px",
                  lineHeight: "1",
                }}
              >
                ▶
              </span>
            </button>
          ))}
        </div>
      </div>

      <table className="tabela-padrao">
        <thead>
          <tr>
            {titulos.map((titulo, index) => (
              <th
                key={index}
                onMouseEnter={() => setColunaHover(index)}
                onMouseLeave={() => setColunaHover(null)}
                className={colunaHover === index ? "coluna-hover" : ""}
              >
                {titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vacas.map((vaca, index) => {
            const numeroStr = String(vaca.numero);
            const dados = medicoesDoDia[numeroStr] || {};

            const total = (
              parseFloat(dados.manha || 0) +
              parseFloat(dados.tarde || 0) +
              parseFloat(dados.terceira || 0)
            ).toFixed(1);

            const del = calcularDEL(vaca.ultimoParto);
            const loteFinal = dados.loteSugerido || vaca.lote || "—"; // ✅ Aqui é onde atualiza corretamente

            const linha = [
              vaca.numero,
              vaca.brinco,
              del,
              dados.manha || "—",
              dados.tarde || "—",
              dados.terceira || "—",
              dados.total || total || "—",
              dados.total ? dataAtual.split("-").reverse().join("/") : "—",
              loteFinal,
              <div className="flex justify-center">
                <button
                  className="botao-editar"
                  onClick={() => abrirModalRegistroLeite(vaca)}
                >
                  🔬 Registrar
                </button>
              </div>
            ];

            return (
              <tr key={index}>
                {linha.map((conteudo, colIdx) => (
                  <td key={colIdx} className={colunaHover === colIdx ? "coluna-hover" : ""}>
                    {conteudo}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {modalMedicaoAberto && vacas.length > 0 && (
        <ModalMediçãoLeite
          vacas={vacas}
          data={dataAtual}
          onFechar={fecharModalMedicao}
          onSalvar={() => {
            atualizarListaVacas(); // recarrega os dados ao salvar
            fecharModalMedicao();
          }}
        />
      )}

      {vacaSelecionada && (
        <ModalRegistroLeite vaca={vacaSelecionada} onFechar={fecharModalRegistroLeite} />
      )}
    </div>
  );
}
