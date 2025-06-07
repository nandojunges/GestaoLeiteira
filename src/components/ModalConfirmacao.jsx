import React from "react";

export default function ModalConfirmacao({
  titulo = "❗ Confirmar Exclusão",
  mensagem = "Deseja realmente excluir?",
  textoCancelar = "Cancelar",
  textoConfirmar = "Excluir",
  onCancelar,
  onConfirmar,
}) {
  return (
    <div style={estilos.overlay}>
      <div style={estilos.modal}>
        <h3 style={estilos.titulo}>{titulo}</h3>
        <p style={estilos.texto}>{mensagem}</p>
        <div style={estilos.botoes}>
          <button onClick={onCancelar} style={estilos.btnCancelar}>
            {textoCancelar}
          </button>
          <button onClick={onConfirmar} style={estilos.btnConfirmar}>
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

const estilos = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  },
  titulo: {
    fontSize: "1.2rem",
    marginBottom: "1rem",
  },
  texto: {
    fontSize: "1rem",
    marginBottom: "1.5rem",
  },
  botoes: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
  },
  btnCancelar: {
    backgroundColor: "#ccc",
    color: "#000",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  btnConfirmar: {
    backgroundColor: "#dc3545",
    color: "#fff",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
  },
};
