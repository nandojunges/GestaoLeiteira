import React, { useState } from "react";
import "../../styles/modalPadrao.css";
import {
  contarEstoqueImplantes,
  registrarAvisoInicial,
  movimentarImplanteEstoque,
} from "./utilsReproducao";

export default function ModalCadastroProtocolo({ onFechar, onSalvar }) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [etapas, setEtapas] = useState([]);
  const [erroImplante, setErroImplante] = useState("");

  const [etapa, setEtapa] = useState({
    dia: "",
    acao: "",
    dispositivo: false,
    hormônios: {},
    usoImplante: "1",
  });

  const hormoniosDisponiveis = [
    { id: "be", nome: "BE (Benzoato de Estradiol)" },
    { id: "gnrh", nome: "GnRH" },
    { id: "pgf2a", nome: "PGF₂α" },
    { id: "ecp", nome: "ECP (Cipionato de Estradiol)" },
  ];

  const toggleHormone = (id, checked) => {
    setEtapa((prev) => ({
      ...prev,
      hormônios: {
        ...prev.hormônios,
        [id]: {
          ...prev.hormônios[id],
          ativo: checked,
          dose: checked ? prev.hormônios[id]?.dose || "" : "",
        },
      },
    }));
  };

  const alterarDose = (id, valor) => {
    setEtapa((prev) => ({
      ...prev,
      hormônios: {
        ...prev.hormônios,
        [id]: { ...prev.hormônios[id], dose: valor },
      },
    }));
  };


  const adicionarEtapa = () => {
    if (etapa.dia === "") {
      alert("Selecione o dia!");
      return;
    }

    const algumHormoneAtivo = Object.values(etapa.hormônios).some((h) => h.ativo);
    if (!algumHormoneAtivo && !etapa.dispositivo && etapa.acao !== "Retirar Implante") {
      alert("Adicione pelo menos um hormônio ou selecione o dispositivo.");
      return;
    }

    if (etapa.acao === "Retirar Implante") {
      if (contarEstoqueImplantes(etapa.usoImplante) === 0) {
        setErroImplante(
          "Não há implantes de " + etapa.usoImplante + "º uso disponíveis."
        );
        registrarAvisoInicial(
          `Estoque zerado de implantes de ${etapa.usoImplante}º uso para protocolo ${nome}`
        );
        return;
      }
      setErroImplante("");
      movimentarImplanteEstoque(etapa.usoImplante);
    }

    setEtapas([...etapas, { ...etapa, dia: parseInt(etapa.dia, 10) }]);
    setEtapa({ dia: "", acao: "", dispositivo: false, hormônios: {}, usoImplante: "1" });
  };

  const removerEtapa = (index) => {
    setEtapas(etapas.filter((_, i) => i !== index));
  };

  const salvarProtocolo = () => {
    if (!nome || etapas.length === 0) {
      alert("Preencha o nome e adicione pelo menos uma etapa.");
      return;
    }
    const novoProtocolo = { nome, descricao, etapas };
    onSalvar(novoProtocolo);
    onFechar();
  };

  const overlay = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  };

  const modal = {
    background: "#fff",
    borderRadius: "1rem",
    width: "550px",
    maxWidth: "90vw",
    padding: "1.5rem",
    fontFamily: "Poppins, sans-serif",
  };

  const input = {
    width: "100%",
    margin: "0.5rem 0",
    padding: "0.5rem",
    borderRadius: "0.5rem",
    border: "1px solid #ccc",
  };

  return (
    <div style={overlay} onClick={onFechar}>
      <div style={modal} onClick={(e) => e.stopPropagation()} className="modal-content">
        <h2 style={{ marginBottom: "1rem" }}>📝 Cadastrar Protocolo IATF</h2>

        <label>Nome do Protocolo:</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={input}
        />

        <label>Descrição:</label>
        <input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          style={input}
        />

        <h4 style={{ marginTop: "1rem" }}>Nova Etapa:</h4>

        <label>Dia:</label>
        <select
          value={etapa.dia}
          onChange={(e) => setEtapa((p) => ({ ...p, dia: e.target.value }))}
          style={input}
        >
          <option value="">Selecione</option>
          {[...Array(22).keys()].map((d) => (
            <option key={d} value={d}>{`D${d}`}</option>
          ))}
        </select>

        <label>Ação:</label>
        <select
          value={etapa.acao}
          onChange={(e) =>
            setEtapa((p) => ({
              ...p,
              acao: e.target.value,
              dispositivo:
                e.target.value === "Retirar Implante" ? false : p.dispositivo,
              usoImplante:
                e.target.value === "Retirar Implante" ? "1" : p.usoImplante,
            }))
          }
          style={input}
        >
          <option value="">Selecione</option>
          <option value="Retirar Implante">Retirar Implante</option>
        </select>

        {etapa.acao === "Retirar Implante" && (
          <>
            <label>Uso do Implante:</label>
            <select
              value={etapa.usoImplante}
              onChange={(e) =>
                setEtapa((p) => ({ ...p, usoImplante: e.target.value }))
              }
              style={input}
            >
              {["1", "2", "3"].map((n) => (
                <option key={n} value={n}>{`${n}º uso (${contarEstoqueImplantes(n)} no estoque)`}</option>
              ))}
            </select>
            {erroImplante && (
              <div style={{ color: 'red', fontSize: '0.8rem' }}>{erroImplante}</div>
            )}
          </>
        )}

        <label>Dispositivo de Progesterona:</label>
        <div style={{ marginBottom: "0.5rem" }}>
          <input
            type="checkbox"
            checked={etapa.dispositivo}
            onChange={(e) =>
              setEtapa((p) => ({ ...p, dispositivo: e.target.checked }))
            }
          />{' '}Usar Dispositivo
        </div>

        {etapa.dia && (
          <>
            <label>Hormônios:</label>
            {hormoniosDisponiveis.map((h) => (
              <label key={h.id} className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={etapa.hormônios?.[h.id]?.ativo || false}
                  onChange={(e) => toggleHormone(h.id, e.target.checked)}
                />
                <span>{h.nome}</span>
                {etapa.hormônios?.[h.id]?.ativo && (
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="mL ou mg"
                    value={etapa.hormônios[h.id].dose}
                    className="input-dose"
                    onChange={(e) => alterarDose(h.id, e.target.value)}
                  />
                )}
              </label>
            ))}
          </>
        )}

        <button
          onClick={adicionarEtapa}
          className="botao-acao"
          style={{ margin: "1rem 0" }}
        >
          ➕ Adicionar Etapa
        </button>

        <h4>Etapas Cadastradas:</h4>
        {etapas.length === 0 ? (
          <p style={{ fontSize: "0.9rem", color: "#777" }}>Nenhuma etapa adicionada.</p>
        ) : (
          <ul style={{ marginBottom: "1rem" }}>
            {etapas.map((etapa, index) => (
              <li
                key={index}
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "0.2rem 0",
                  margin: "0.2rem 0",
                }}
              >
                <span>
                  Dia {etapa.dia}{" "}
                  {etapa.acao === "Retirar Implante" &&
                    `| Retirar Implante (${etapa.usoImplante}º uso)`}{" "}
                  {etapa.dispositivo && "| Dispositivo"}{" "}
                  {Object.entries(etapa.hormônios)
                    .filter(([, cfg]) => cfg.ativo)
                    .map(([id, cfg]) => `| ${id.toUpperCase()}: ${cfg.dose}`)
                    .join(" ")}
                </span>
                <button
                  onClick={() => removerEtapa(index)}
                  style={{
                    color: "red",
                    fontSize: "0.8rem",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    marginLeft: "1rem",
                  }}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          <button onClick={onFechar} className="botao-cancelar">
            Cancelar
          </button>
          <button onClick={salvarProtocolo} className="botao-acao">
            💾 Salvar Protocolo
          </button>
        </div>
      </div>
    </div>
  );
}
