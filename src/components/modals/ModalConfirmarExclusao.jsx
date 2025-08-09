import React, { useEffect } from "react";
import "../styles/botoes.css";

export default function ModalConfirmarExclusao({
  mensagem = "Deseja realmente excluir este item?",
  onConfirmar,
  onCancelar,
}) {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onCancelar?.();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onCancelar]);

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3 style={{ marginBottom: "0.75rem", fontSize: "1.1rem" }}>
          ❗ Confirmar Exclusão
        </h3>
        <p style={{ marginBottom: "1.25rem" }}>{mensagem}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button className="botao-cancelar" onClick={onCancelar}>Cancelar</button>
          <button className="botao-excluir" onClick={onConfirmar}>Excluir</button>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modal = {
  backgroundColor: "#fff",
  padding: "1.5rem",
  borderRadius: "0.75rem",
  width: "90%",
  maxWidth: "420px",
};
