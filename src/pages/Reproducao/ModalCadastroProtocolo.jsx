import React, { useState } from "react";

export default function ModalCadastroProtocolo({ onFechar, onSalvar }) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [etapas, setEtapas] = useState([]);

  const [dia, setDia] = useState("");
  const [dispositivo, setDispositivo] = useState(false);
  const [usoDispositivo, setUsoDispositivo] = useState("1º uso");

  const [hormôniosSelecionados, setHormôniosSelecionados] = useState([]);

  // Exemplo de análogos e doses simulados (no futuro -> buscar do estoque)
  const análogosDisponíveis = {
    BE: ["Sincrodiol", "Gonadiol"],
    GnRH: ["Cystorelin", "Sincroforte"],
    PGF2α: ["Lutalyse", "Sincrocio"],
  };

  const adicionarHormônio = (hormônio) => {
    if (!hormôniosSelecionados.some((h) => h.nome === hormônio)) {
      setHormôniosSelecionados([
        ...hormôniosSelecionados,
        { nome: hormônio, análogo: "", dose: "" },
      ]);
    }
  };

  const removerHormônio = (hormônio) => {
    setHormôniosSelecionados(
      hormôniosSelecionados.filter((h) => h.nome !== hormônio)
    );
  };

  const atualizarHormônio = (nome, campo, valor) => {
    setHormôniosSelecionados(
      hormôniosSelecionados.map((h) =>
        h.nome === nome ? { ...h, [campo]: valor } : h
      )
    );
  };

  const adicionarEtapa = () => {
    if (!dia) {
      alert("Selecione o dia!");
      return;
    }
    if (hormôniosSelecionados.length === 0 && !dispositivo) {
      alert("Adicione pelo menos um hormônio ou selecione o dispositivo.");
      return;
    }

    const novaEtapa = {
      dia,
      dispositivo: dispositivo ? usoDispositivo : null,
      hormonios: hormôniosSelecionados,
    };
    setEtapas([...etapas, novaEtapa]);

    // Resetar campos
    setDia("");
    setDispositivo(false);
    setUsoDispositivo("1º uso");
    setHormôniosSelecionados([]);
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
      <div style={modal} onClick={(e) => e.stopPropagation()}>
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
          value={dia}
          onChange={(e) => setDia(e.target.value)}
          style={input}
        >
          <option value="">Selecione</option>
          {[...Array(22).keys()].map((d) => (
            <option key={d} value={d}>{`D${d}`}</option>
          ))}
        </select>

        <label>Dispositivo de Progesterona:</label>
        <div style={{ marginBottom: "0.5rem" }}>
          <input
            type="checkbox"
            checked={dispositivo}
            onChange={(e) => setDispositivo(e.target.checked)}
          />{" "}
          Usar Dispositivo
          {dispositivo && (
            <select
              value={usoDispositivo}
              onChange={(e) => setUsoDispositivo(e.target.value)}
              style={{ ...input, marginTop: "0.5rem" }}
            >
              <option>1º uso</option>
              <option>2º uso</option>
              <option>3º uso (novilhas / pré-sincro)</option>
            </select>
          )}
        </div>

        <label>Hormônios:</label>
        {["BE", "GnRH", "PGF2α"].map((h, i) => (
          <div key={i} style={{ marginBottom: "0.5rem" }}>
            <label>
              <input
                type="checkbox"
                checked={hormôniosSelecionados.some((ho) => ho.nome === h)}
                onChange={(e) =>
                  e.target.checked
                    ? adicionarHormônio(h)
                    : removerHormônio(h)
                }
              />{" "}
              {h}
            </label>
            {hormôniosSelecionados.some((ho) => ho.nome === h) && (
              <div style={{ marginLeft: "1rem", marginTop: "0.2rem" }}>
                <select
                  value={
                    hormôniosSelecionados.find((ho) => ho.nome === h)?.análogo
                  }
                  onChange={(e) =>
                    atualizarHormônio(h, "análogo", e.target.value)
                  }
                  style={{ ...input, marginBottom: "0.2rem" }}
                >
                  <option value="">Análogo</option>
                  {análogosDisponíveis[h].map((a, idx) => (
                    <option key={idx} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Dose"
                  value={
                    hormôniosSelecionados.find((ho) => ho.nome === h)?.dose
                  }
                  onChange={(e) =>
                    atualizarHormônio(h, "dose", e.target.value)
                  }
                  style={{ ...input, width: "150px" }}
                />
              </div>
            )}
          </div>
        ))}

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
                  {etapa.dispositivo && `| Dispositivo: ${etapa.dispositivo}`}{" "}
                  {etapa.hormonios
                    .map(
                      (h) =>
                        `| ${h.nome}: ${h.análogo || "—"} (${h.dose || "—"})`
                    )
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
