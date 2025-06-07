import React, { useEffect, useState } from "react";

export default function ModalExamesSanitarios({ onFechar }) {
  const [dados, setDados] = useState({
    nome: "",
    status: "nao",
    dataUltimo: "",
    comprovante: null,
    exameEntrada: false,
  });

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onFechar?.();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onFechar]);

  const atualizar = (campo, valor) => setDados((p) => ({ ...p, [campo]: valor }));

  const salvar = () => {
    const lista = JSON.parse(localStorage.getItem("examesSanitarios") || "[]");
    lista.push(dados);
    localStorage.setItem("examesSanitarios", JSON.stringify(lista));
    onFechar?.();
  };

  const input = () => ({
    padding: "0.6rem",
    border: "1px solid #ccc",
    borderRadius: "0.5rem",
    width: "100%",
    fontSize: "0.95rem",
  });

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>Controle de Exames</div>
        <div style={conteudo}>
          <div>
            <label>Nome do Exame</label>
            <input value={dados.nome} onChange={e => atualizar("nome", e.target.value)} style={input()} />
          </div>
          <div>
            <label>Status da Propriedade</label>
            <select value={dados.status} onChange={e => atualizar("status", e.target.value)} style={input()}>
              <option value="nao">Não certificada</option>
              <option value="sim">Certificada</option>
            </select>
          </div>
          <div>
            <label>Data do Último Exame</label>
            <input type="date" value={dados.dataUltimo} onChange={e => atualizar("dataUltimo", e.target.value)} style={input()} />
          </div>
          <div>
            <label>Comprovante</label>
            <input type="file" onChange={e => atualizar("comprovante", e.target.files[0])} style={input()} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input type="checkbox" checked={dados.exameEntrada} onChange={e => atualizar("exameEntrada", e.target.checked)} />
            <span>Exame de entrada para animal novo?</span>
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
  background: "#fff",
  borderRadius: "1rem",
  width: "480px",
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

const conteudo = {
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

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
