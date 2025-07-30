import React, { useState, useEffect } from "react";
import ModalMedicaoLeite from "./ModalMedicaoLeite";
import ModalRegistroLeite from "./ModalRegistroLeite";
import { calcularDEL } from "../Animais/utilsAnimais";
import { buscarTodosAnimais } from "../../sqlite/animais";
import { buscarTodos } from"../../utils/apiFuncoes.js";
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

  const atualizarListaVacas = async () => {
    const dados = await buscarTodosAnimais();
    const ativos = dados.filter((animal) => animal.status !== "Inativo");
    setVacas(ativos);
  };

  useEffect(() => {
    async function carregarAnimais() {
      const dados = await buscarTodosAnimais();
      const ativos = dados.filter((animal) => animal.status !== "Inativo");
      setVacas(ativos);
    }
    carregarAnimais();
  }, []);

  useEffect(() => {
    const atualizar = () => atualizarListaVacas();
    window.addEventListener("animaisAtualizados", atualizar);
    return () => window.removeEventListener("animaisAtualizados", atualizar);
  }, []);

  const getDatasComMedicao = async () => {
    const lista = await buscarTodos("medicaoLeite");
    return lista
      .map((l) => l.id)
      .sort((a, b) => new Date(a) - new Date(b));
  };

  const irParaAnterior = async () => {
    const todas = await getDatasComMedicao();
    const anterior = todas
      .filter((d) => new Date(d) < new Date(dataAtual))
      .pop();
    if (anterior) setDataAtual(anterior);
  };

  const irParaProxima = async () => {
    const todas = await getDatasComMedicao();
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
 const [registro, setRegistro] = useState({});
  const [datasDisponiveis, setDatasDisponiveis] = useState([]);

  useEffect(() => {
    (async () => {
      const docs = await buscarTodos("medicaoLeite");
      const reg = docs.find((d) => d.id === dataAtual) || {};
      setRegistro(reg);
      setDatasDisponiveis(docs.map((d) => d.id).sort((a, b) => new Date(a) - new Date(b)));
    })();
    const atualizar = async () => {
      const docs = await buscarTodos("medicaoLeite");
      const reg = docs.find((d) => d.id === dataAtual) || {};
      setRegistro(reg);
      setDatasDisponiveis(docs.map((d) => d.id).sort((a, b) => new Date(a) - new Date(b)));
    };
    window.addEventListener("medicaoLeiteAtualizada", atualizar);
    return () => window.removeEventListener("medicaoLeiteAtualizada", atualizar);
  }, [dataAtual]);

    const medicoesDoDia = registro.dados || {};

  const temAnterior = datasDisponiveis.some(
    (d) => new Date(d) < new Date(dataAtual)
  );
  const temProxima = datasDisponiveis.some(
    (d) => new Date(d) > new Date(dataAtual)
  );

  return (
    <div className="w-full px-8 py-6 font-sans">
       <div className="flex justify-end items-center mb-4">
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
         <ModalMedicaoLeite
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
