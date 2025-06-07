import React, { useEffect, useState } from "react";
import Select from "react-select";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const TIPOS = ["Ordenhadeira", "Resfriador", "Tambo", "Outros"];

export default function ModalCadastroCiclo({ onFechar, onSalvar, ciclo = null, indice = null }) {
  const [nome, setNome] = useState(ciclo?.nome || "");
  const [tipo, setTipo] = useState(ciclo?.tipo || "");
  const [diasSemana, setDiasSemana] = useState(ciclo?.diasSemana || []);
  const [frequencia, setFrequencia] = useState(ciclo?.frequencia || 1);
  const [frequenciaCond, setFrequenciaCond] = useState(ciclo?.frequenciaCond || "");
  const [etapas, setEtapas] = useState(
    ciclo?.etapas ||
      (ciclo?.produto
        ? [
            {
              produto: ciclo.produto,
              quantidade: ciclo.quantidade || "",
              unidade: ciclo.unidade || "mL",
              condicaoTipo: "sempre",
              intervalo: ""
            }
          ]
        : [
            { produto: null, quantidade: "", unidade: "mL", condicaoTipo: "sempre", intervalo: "" }
          ])
  );
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    const lista = JSON.parse(localStorage.getItem("produtos") || "[]");
    const higienicos = lista.filter(p => p && p.agrupamento === "Higiene e Limpeza");
    setProdutos(higienicos.map(p => ({ value: p.nomeComercial, label: p.nomeComercial })));
  }, []);

  const toggleDia = (d) => {
    setDiasSemana(diasSemana.includes(d) ? diasSemana.filter(x => x !== d) : [...diasSemana, d]);
  };

  const atualizarEtapa = (index, campo, valor) => {
    setEtapas((prev) => {
      const novo = [...prev];
      novo[index] = { ...novo[index], [campo]: valor };
      return novo;
    });
  };

  const adicionarEtapa = () => {
    setEtapas((prev) => [
      ...prev,
      { produto: null, quantidade: "", unidade: "mL", condicaoTipo: "sempre", intervalo: "" }
    ]);
  };

  const removerEtapa = (index) => {
    setEtapas((prev) => prev.filter((_, i) => i !== index));
  };

  const salvar = () => {
    if (!nome || !tipo || !diasSemana.length) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    for (const e of etapas) {
      if (!e.produto || !e.quantidade) {
        alert("Preencha produto e quantidade de todas as etapas.");
        return;
      }
    }
    const registro = {
      nome,
      tipo,
      diasSemana,
      frequencia: parseInt(frequencia),
      frequenciaCond,
      etapas: etapas.map((e) => ({
        produto: e.produto,
        quantidade: parseFloat(e.quantidade),
        unidade: e.unidade,
        condicao:
          e.condicaoTipo === "sempre"
            ? "sempre"
            : `a cada ${e.intervalo} ordenhas`
      }))
    };
    onSalvar?.(registro, indice);
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>🧼 Cadastro de Ciclo</div>
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label>Nome do Ciclo *</label>
            <input value={nome} onChange={e => setNome(e.target.value)} style={input()} />
          </div>
          <div>
            <label>Tipo do Ciclo *</label>
            <Select
              options={TIPOS.map(t => ({ value: t, label: t }))}
              value={tipo ? { value: tipo, label: tipo } : null}
              onChange={op => setTipo(op?.value || "")}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Selecione..."
            />
          </div>
          <div>
            <label>Dias da Semana *</label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {DIAS.map((d, idx) => (
                <label key={idx} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <input type="checkbox" checked={diasSemana.includes(idx)} onChange={() => toggleDia(idx)} />
                  <span>{d}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label>Frequência por dia *</label>
            <select value={frequencia} onChange={e => setFrequencia(e.target.value)} style={input()}>
              {[1, 2, 3].map(v => (
                <option key={v} value={v}>{v}x</option>
              ))}
            </select>
          </div>
          <div>
            <label>Frequência condicional</label>
            <input value={frequenciaCond} onChange={e => setFrequenciaCond(e.target.value)} placeholder="Ex: a cada 3 ordenhas" style={input()} />
          </div>
          <div>
            <label className="mb-1 block">Etapas de Limpeza</label>
            {etapas.map((e, idx) => (
              <div key={idx} style={{ border: "1px solid #ddd", borderRadius: "0.5rem", padding: "0.8rem", marginBottom: "0.5rem" }}>
                <div style={{ fontWeight: "600", marginBottom: "0.5rem" }}>Etapa {idx + 1}</div>
                <div style={{ marginBottom: "0.5rem" }}>
                  <label>Produto *</label>
                  <Select
                    options={produtos}
                    value={e.produto ? { value: e.produto, label: e.produto } : null}
                    onChange={op => atualizarEtapa(idx, "produto", op?.value || null)}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Selecione..."
                  />
                </div>
                <div style={{ marginBottom: "0.5rem", display: "flex", gap: "0.5rem" }}>
                  <div style={{ flex: 1 }}>
                    <label>Quantidade *</label>
                    <input
                      type="number"
                      value={e.quantidade}
                      onChange={ev => atualizarEtapa(idx, "quantidade", ev.target.value)}
                      style={{ ...input(), width: "100%" }}
                    />
                  </div>
                  <div style={{ width: "110px" }}>
                    <label>Unidade</label>
                    <select
                      value={e.unidade}
                      onChange={ev => atualizarEtapa(idx, "unidade", ev.target.value)}
                      style={input()}
                    >
                      <option value="mL">mL</option>
                      <option value="litros">litros</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: "0.5rem" }}>
                  <label>Condição de aplicação</label>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <select
                      value={e.condicaoTipo}
                      onChange={ev => atualizarEtapa(idx, "condicaoTipo", ev.target.value)}
                      style={{ ...input(), width: "150px" }}
                    >
                      <option value="sempre">Sempre</option>
                      <option value="cada">A cada</option>
                    </select>
                    {e.condicaoTipo === "cada" && (
                      <>
                        <input
                          type="number"
                          value={e.intervalo}
                          onChange={ev => atualizarEtapa(idx, "intervalo", ev.target.value)}
                          style={{ ...input(), width: "80px" }}
                        />
                        <span>ordenhas</span>
                      </>
                    )}
                  </div>
                </div>
                {etapas.length > 1 && (
                  <button
                    onClick={() => removerEtapa(idx)}
                    style={{ ...botaoCancelar, marginTop: "0.5rem" }}
                  >
                    Remover Etapa
                  </button>
                )}
              </div>
            ))}
            <button onClick={adicionarEtapa} style={{ ...botaoConfirmar, marginTop: "0.5rem" }}>
              + Etapa de Limpeza
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <button onClick={onFechar} style={botaoCancelar}>Cancelar</button>
            <button onClick={salvar} style={botaoConfirmar}>Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999
};

const modal = {
  background: "#fff",
  borderRadius: "1rem",
  width: "600px",
  maxHeight: "90vh",
  overflowY: "auto",
  fontFamily: "Poppins, sans-serif",
  display: "flex",
  flexDirection: "column"
};

const header = {
  background: "#1e40af",
  color: "white",
  padding: "1rem 1.5rem",
  fontWeight: "bold",
  fontSize: "1.1rem",
  borderTopLeftRadius: "1rem",
  borderTopRightRadius: "1rem",
  textAlign: "center"
};

const input = () => ({
  padding: "0.6rem",
  border: "1px solid #ccc",
  borderRadius: "0.5rem",
  width: "100%"
});

const botaoCancelar = {
  background: "#f3f4f6",
  border: "1px solid #d1d5db",
  padding: "0.6rem 1.2rem",
  borderRadius: "0.5rem",
  cursor: "pointer",
  fontWeight: "500"
};

const botaoConfirmar = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "0.6rem 1.4rem",
  borderRadius: "0.5rem",
  cursor: "pointer",
  fontWeight: "600"
};
