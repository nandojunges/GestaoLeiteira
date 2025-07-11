import React, { useEffect, useRef, useState } from "react";
import {
  db,
  buscarTodos,
  adicionarItem,
} from "../../utils/db";

export default function AjustesEstoqueModal({ onFechar }) {
  const [ajustes, setAjustes] = useState({});
  const categorias = [
    "Ração", "Suplementos Minerais", "Aditivos",
    "Detergentes", "Pré-dipping", "Pós-dipping", "Alcalino", "Ácido",
    "Amônia Quaternária", "Sanitizante", "Antibiótico",
    "AINE/AIE", "Hormônio", "Vitaminas", "Luvas", "Materiais Gerais"
  ];
  const refs = useRef([]);

  useEffect(() => {
    (async () => {
      try {
        const armazenado = await buscarTodos("ajustesEstoque");
        setAjustes(armazenado[0] || {});
        refs.current[0]?.focus();
      } catch (err) {
        console.error("Erro ao carregar ajustes:", err);
        setAjustes({});
      }
    })();

    const esc = (e) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onFechar]);

  const handleEnter = (e, index) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      refs.current[index + 1]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      refs.current[index - 1]?.focus();
    }
  };

  const atualizarAjuste = (categoria, valor) => {
    setAjustes((prev) => ({
      ...prev,
      [categoria]: valor
    }));
  };

  const salvar = async () => {
    await adicionarItem("ajustesEstoque", ajustes);
    alert("Ajustes salvos!");
    onFechar();
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>⚙️ Ajustes de Estoque</div>
        <div style={{ padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {categorias.map((cat, index) => (
            <div key={index} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <label style={{ flex: "1" }}>{cat}</label>
              <input
                ref={el => refs.current[index] = el}
                type="number"
                placeholder="Estoque Mínimo"
                value={ajustes[cat] || ""}
                onChange={e => atualizarAjuste(cat, e.target.value)}
                onKeyDown={e => handleEnter(e, index)}
                style={input()}
              />
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1.5rem" }}>
            <button onClick={onFechar} style={botaoCancelar}>Cancelar</button>
            <button onClick={salvar} style={botaoConfirmar}>Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Estilos
const overlay = {
  position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
  backgroundColor: "rgba(0,0,0,0.6)", display: "flex",
  justifyContent: "center", alignItems: "center", zIndex: 9999
};

const modal = {
  background: "#fff", borderRadius: "1rem", width: "640px",
  maxHeight: "90vh", overflow: "hidden", display: "flex",
  flexDirection: "column", fontFamily: "Poppins, sans-serif"
};

const header = {
  background: "#1e40af", color: "white", padding: "1rem 1.5rem",
  fontWeight: "bold", fontSize: "1.1rem", borderTopLeftRadius: "1rem",
  borderTopRightRadius: "1rem", textAlign: "center"
};

const input = () => ({
  width: "120px", padding: "0.6rem", fontSize: "0.95rem",
  borderRadius: "0.5rem", border: "1px solid #ccc"
});

const botaoCancelar = {
  background: "#f3f4f6", border: "1px solid #d1d5db",
  padding: "0.6rem 1.2rem", borderRadius: "0.5rem",
  cursor: "pointer", fontWeight: "500"
};

const botaoConfirmar = {
  background: "#2563eb", color: "#fff", border: "none",
  padding: "0.6rem 1.4rem", borderRadius: "0.5rem",
  cursor: "pointer", fontWeight: "600"
};
