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
  const [produto, setProduto] = useState(ciclo?.produto || null);
  const [quantidade, setQuantidade] = useState(ciclo?.quantidade || "");
  const [unidade, setUnidade] = useState(ciclo?.unidade || "mL");
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    const lista = JSON.parse(localStorage.getItem("produtos") || "[]");
    const higienicos = lista.filter(p => p && p.agrupamento === "Higiene e Limpeza");
    setProdutos(higienicos.map(p => ({ value: p.nomeComercial, label: p.nomeComercial })));
  }, []);

  const toggleDia = (d) => {
    setDiasSemana(diasSemana.includes(d) ? diasSemana.filter(x => x !== d) : [...diasSemana, d]);
  };

  const salvar = () => {
    if (!nome || !tipo || !produto || !diasSemana.length || !quantidade) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    const registro = {
      nome,
      tipo,
      diasSemana,
      frequencia: parseInt(frequencia),
      frequenciaCond,
      produto,
      quantidade: parseFloat(quantidade),
      unidade
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
            <label>Produto *</label>
            <Select
              options={produtos}
              value={produto ? { value: produto, label: produto } : null}
              onChange={op => setProduto(op?.value || null)}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Selecione..."
            />
          </div>
          <div>
            <label>Quantidade por aplicação</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input type="number" value={quantidade} onChange={e => setQuantidade(e.target.value)} style={{ ...input(), width: "100px" }} />
              <select value={unidade} onChange={e => setUnidade(e.target.value)} style={{ ...input(), width: "100px" }}>
                <option value="mL">mL</option>
                <option value="litros">litros</option>
              </select>
            </div>
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
