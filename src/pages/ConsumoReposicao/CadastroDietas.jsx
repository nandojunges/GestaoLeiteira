import React, { useEffect, useState } from "react";
import Select from "react-select";

export default function CadastroDietas({ onFechar, onSalvar }) {
  const [produtos, setProdutos] = useState([]);
  const [numVacas, setNumVacas] = useState("");
  const [ingredientes, setIngredientes] = useState([
    { produto: null, quantidade: "", unidade: "" }
  ]);
  const [custoTotal, setCustoTotal] = useState(0);
  const [custoVacaDia, setCustoVacaDia] = useState(0);

  useEffect(() => {
    const lista = JSON.parse(localStorage.getItem("produtos") || "[]");
    const filtrar = lista.filter(
      (p) => p && (p.categoria === "Cozinha" || p.agrupamento === "Cozinha")
    );
    setProdutos(filtrar);
  }, []);

  const atualizarIngrediente = (index, campo, valor) => {
    const novos = [...ingredientes];
    novos[index] = { ...novos[index], [campo]: valor };
    setIngredientes(novos);
  };

  const adicionarIngrediente = () => {
    setIngredientes([...ingredientes, { produto: null, quantidade: "", unidade: "" }]);
  };

  const removerIngrediente = (index) => {
    setIngredientes(ingredientes.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const vacas = parseFloat(numVacas);
    const total = ingredientes.reduce((acc, ing) => {
      if (!ing.produto) return acc;
      const prod = produtos.find((p) => p.nomeComercial === ing.produto);
      if (!prod) return acc;
      const unit = parseFloat(prod.valorUnitario);
      const valor =
        !isNaN(unit) && unit > 0
          ? unit
          : prod.valorTotal && prod.quantidade
          ? parseFloat(prod.valorTotal) / parseFloat(prod.quantidade)
          : 0;
      const qt = parseFloat(ing.quantidade);
      if (isNaN(valor) || isNaN(qt) || isNaN(vacas)) return acc;
      return acc + qt * vacas * valor;
    }, 0);
    setCustoTotal(total);
    setCustoVacaDia(!isNaN(vacas) && vacas > 0 ? total / vacas : 0);
  }, [ingredientes, numVacas, produtos]);

  const salvar = () => {
    onSalvar?.({ ingredientes, numVacas, custoTotal, custoVacaDia });
    onFechar?.();
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>🥣 Cadastro de Dieta</div>
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label>Nº de Vacas</label>
            <input
              type="number"
              value={numVacas}
              onChange={(e) => setNumVacas(e.target.value)}
              style={input()}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {ingredientes.map((ing, idx) => (
              <div key={idx} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <Select
                    options={produtos.map((p) => ({ value: p.nomeComercial, label: p.nomeComercial }))}
                    value={ing.produto ? { value: ing.produto, label: ing.produto } : null}
                    onChange={(op) => atualizarIngrediente(idx, "produto", op?.value || null)}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Ingrediente"
                  />
                </div>
                <input
                  type="number"
                  placeholder="Qtd/vaca"
                  value={ing.quantidade}
                  onChange={(e) => atualizarIngrediente(idx, "quantidade", e.target.value)}
                  style={{ ...input(), width: "90px" }}
                />
                <input
                  type="text"
                  placeholder="Unidade"
                  value={ing.unidade}
                  onChange={(e) => atualizarIngrediente(idx, "unidade", e.target.value)}
                  style={{ ...input(), width: "80px" }}
                />
                <div style={{ width: "100px", textAlign: "center" }}>
                  {(() => {
                    const prod = produtos.find((p) => p.nomeComercial === ing.produto);
                    if (!prod) return "—";
                    const unit = parseFloat(prod.valorUnitario);
                    const valor =
                      !isNaN(unit) && unit > 0
                        ? unit
                        : prod.valorTotal && prod.quantidade
                        ? parseFloat(prod.valorTotal) / parseFloat(prod.quantidade)
                        : 0;
                    return `R$ ${valor.toFixed(2)}`;
                  })()}
                </div>
                <button onClick={() => removerIngrediente(idx)} style={botaoRemover}>x</button>
              </div>
            ))}
            <button onClick={adicionarIngrediente} style={botaoAdicionar}>+ Ingrediente</button>
          </div>
          <div style={{ marginTop: "0.5rem" }}>
            <div>Custo Total: <strong>R$ {custoTotal.toFixed(2)}</strong></div>
            <div>Custo Vaca/dia: <strong>R$ {custoVacaDia.toFixed(2)}</strong></div>
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
  zIndex: 9999,
};

const modal = {
  backgroundColor: "#fff",
  borderRadius: "1rem",
  width: "520px",
  maxHeight: "90vh",
  overflowY: "auto",
  fontFamily: "Poppins, sans-serif",
  display: "flex",
  flexDirection: "column",
};

const header = {
  background: "#1e40af",
  color: "white",
  padding: "1rem 1.5rem",
  fontWeight: "bold",
  fontSize: "1.1rem",
  borderTopLeftRadius: "1rem",
  borderTopRightRadius: "1rem",
  textAlign: "center",
};

const input = () => ({
  padding: "0.6rem",
  border: "1px solid #ccc",
  borderRadius: "0.5rem",
  width: "100%",
});

const botaoCancelar = {
  background: "#f3f4f6",
  border: "1px solid #d1d5db",
  padding: "0.6rem 1.2rem",
  borderRadius: "0.5rem",
  cursor: "pointer",
  fontWeight: "500",
};

const botaoConfirmar = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "0.6rem 1.4rem",
  borderRadius: "0.5rem",
  cursor: "pointer",
  fontWeight: "600",
};

const botaoAdicionar = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "0.5rem 0.8rem",
  borderRadius: "0.5rem",
  cursor: "pointer",
  fontWeight: "600",
  alignSelf: "flex-start",
};

const botaoRemover = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: "0.4rem",
  cursor: "pointer",
  width: "32px",
  height: "32px",
};
