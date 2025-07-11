import React, { useEffect, useState } from "react";
import { db, buscarTodos, adicionarItem } from "../../utils/db";

export default function ModalRegistroAplicacao({ manejo, indice, onFechar }) {
  const [data, setData] = useState(() => {
    const hoje = new Date();
    return hoje.toISOString().substring(0, 10);
  });
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onFechar?.();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onFechar]);

  const salvar = async () => {
    const lista = await buscarTodos("manejosSanitarios");
    if (indice != null && lista[indice]) {
      const registro = lista[indice];
      registro.ultimaAplicacao = data;
      registro.observacoes = observacoes;
      const dias = parseInt(registro.frequencia);
      if (!isNaN(dias)) {
        const d = new Date(data);
        d.setDate(d.getDate() + dias);
        registro.proximaAplicacao = d.toISOString().substring(0, 10);
      }
      lista[indice] = registro;
      await adicionarItem("manejosSanitarios", lista);
      window.dispatchEvent(new Event("manejosSanitariosAtualizados"));
    }
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
        <div style={header}>Registrar Aplicação</div>
        <div style={conteudo}>
          <div>
            <label>Data da Aplicação</label>
            <input type="date" value={data} onChange={e => setData(e.target.value)} style={input()} />
          </div>
          <div>
            <label>Observações</label>
            <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} style={{...input(), height: "80px"}} />
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
  width: "420px",
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
