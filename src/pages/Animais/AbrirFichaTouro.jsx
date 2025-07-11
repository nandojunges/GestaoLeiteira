// src/pages/Animais/ModalVerFichaTouro.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  buscarTodosTourosSQLite,
  inserirTouroSQLite,
  removerTouroSQLite,
} from "../../utils/apiFuncoes.js";

export default function AbrirFichaTouro({ nome, onFechar }) {
  const [dados, setDados] = useState(null);
  const [editando, setEditando] = useState(false);
  const [valores, setValores] = useState({});
  const inputRef = useRef();

  useEffect(() => {
    async function carregar() {
      const fichas = await buscarTodosTourosSQLite();
      const ficha = fichas.find((f) => f.nome === nome);
      if (ficha) {
        setDados(ficha);
        setValores(ficha);
      }
    }
    carregar();
    setTimeout(() => inputRef.current?.focus(), 100);
    const esc = (e) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [nome, onFechar]);

  const salvarEdicao = async () => {
    const atualizado = { ...valores };
    await inserirTouroSQLite(atualizado);
    if (atualizado.nome !== nome) await removerTouroSQLite(nome);
    setDados(atualizado);
    setEditando(false);
  };

  if (!dados) return null;

  const campo = (titulo, chave, placeholder = "-") => (
    <div>
      <strong>{titulo}: </strong>
      {editando ? (
        <input
          value={valores[chave] || ""}
          onChange={(e) => setValores({ ...valores, [chave]: e.target.value })}
          style={inputInline}
        />
      ) : (
        <span>{dados[chave] || placeholder}</span>
      )}
    </div>
  );

  return (
    <div style={fundoEscuro}>
      <div style={modalBranco}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>📄 Ficha do Touro</h2>
          <button onClick={() => setEditando(!editando)} style={botaoEditar}>
            ✏️ {editando ? "Salvando" : "Editar"}
          </button>
        </div>

        <div style={{ marginTop: "1.5rem", display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {campo("Nome", "nome")}
          {campo("Raça", "raca")}
          {campo("Registro", "registro")}
          {campo("Origem", "origem")}
          {campo("PTA Leite", "ptaLeite")}
          {campo("PTA Gordura", "ptaGordura")}
          {campo("PTA Proteína", "ptaProteina")}
          {campo("CCS", "ccs")}
          {campo("Fertilidade Filhas", "fertilidade")}
        </div>

        <h4 style={{ marginTop: "2rem", fontWeight: "bold" }}>📎 Visualização do PDF</h4>
        {dados.arquivoBase64 ? (
          <iframe src={dados.arquivoBase64} style={{ width: "100%", height: "500px", borderRadius: "0.5rem", marginTop: "0.5rem" }}></iframe>
        ) : (
          <p style={{ color: "#991b1b" }}>Nenhuma ficha em PDF foi anexada.</p>
        )}

        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          {editando && (
            <button onClick={salvarEdicao} style={botaoPrincipal}>Salvar ✅</button>
          )}
          <button onClick={onFechar} style={botaoCancelar}>{editando ? "Cancelar ✖" : "Fechar ✖"}</button>
        </div>
      </div>
    </div>
  );
}

const fundoEscuro = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modalBranco = {
  background: "white",
  padding: "2rem",
  borderRadius: "0.75rem",
  width: "800px",
  maxHeight: "90vh",
  overflowY: "auto"
};

const inputInline = {
  padding: "0.4rem 0.6rem",
  marginLeft: "0.5rem",
  fontSize: "1rem",
  border: "1px solid #ccc",
  borderRadius: "0.4rem"
};

const botaoEditar = {
  backgroundColor: '#fef9c3',
  color: '#92400e',
  padding: '0.4rem 0.75rem',
  borderRadius: '0.5rem',
  fontWeight: '600',
  border: '1px solid #fde68a',
  cursor: 'pointer'
};

const botaoPrincipal = {
  backgroundColor: '#2563eb',
  color: '#fff',
  padding: '0.6rem 1.5rem',
  borderRadius: '0.5rem',
  fontWeight: '600',
  border: 'none',
  cursor: 'pointer'
};

const botaoCancelar = {
  backgroundColor: '#fef2f2',
  color: '#991b1b',
  padding: '0.6rem 1.5rem',
  borderRadius: '0.5rem',
  fontWeight: '600',
  border: '1px solid #fecaca',
  cursor: 'pointer'
};
