import React, { useEffect, useState } from "react";

export default function RelatorioMedicamentos({ onFechar }) {
  const [medicamentos, setMedicamentos] = useState({});
  const [editando, setEditando] = useState(null);
  const [edicao, setEdicao] = useState({});
  const [confirmarExclusao, setConfirmarExclusao] = useState(null);

  useEffect(() => {
    const dados = JSON.parse(localStorage.getItem("medicamentosSecagem") || "{}");
    setMedicamentos(dados);
  }, []);

  const iniciarEdicao = (nome) => {
    setEditando(nome);
    setEdicao(medicamentos[nome]);
  };

  const salvar = () => {
    const atualizados = { ...medicamentos, [editando]: edicao };
    setMedicamentos(atualizados);
    localStorage.setItem("medicamentosSecagem", JSON.stringify(atualizados));
    setEditando(null);
    setEdicao({});
  };

  const cancelarEdicao = () => {
    setEditando(null);
    setEdicao({});
  };

  const excluir = (nome) => {
    const atualizados = { ...medicamentos };
    delete atualizados[nome];
    setMedicamentos(atualizados);
    localStorage.setItem("medicamentosSecagem", JSON.stringify(atualizados));
    setConfirmarExclusao(null);
  };

  const handleInput = (e, campo) => {
    const valor = campo === "leite" || campo === "carne"
      ? e.target.value.replace(/\D/g, "")
      : e.target.value;
    setEdicao({ ...edicao, [campo]: valor });
  };

  return (
    <div style={backdrop}>
      <div style={container}>
        <div style={header}>📋 Medicamentos Cadastrados</div>
        <div style={{ padding: "1.5rem" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", textAlign: "left" }}>
                <th style={th}>Nome Comercial</th>
                <th style={th}>Princípio Ativo</th>
                <th style={th}>Leite (dias)</th>
                <th style={th}>Carne (dias)</th>
                <th style={th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(medicamentos).map(([nome, dados], i) => (
                <tr key={i}>
                  <td style={td}>{editando === nome ? nome : nome}</td>
                  <td style={td}>
                    {editando === nome
                      ? <input value={edicao.principio || ""} onChange={e => handleInput(e, "principio")} style={inputMini} />
                      : dados.principio}
                  </td>
                  <td style={td}>
                    {editando === nome
                      ? <input value={edicao.leite || ""} onChange={e => handleInput(e, "leite")} style={inputMini} />
                      : dados.leite}
                  </td>
                  <td style={td}>
                    {editando === nome
                      ? <input value={edicao.carne || ""} onChange={e => handleInput(e, "carne")} style={inputMini} />
                      : dados.carne}
                  </td>
                  <td style={td}>
                    {editando === nome ? (
                      <>
                        <button onClick={salvar} style={btnVerde}>💾</button>
                        <button onClick={cancelarEdicao} style={btnCinza}>✖</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => iniciarEdicao(nome)} style={btnAzul}>✏️</button>
                        <button onClick={() => setConfirmarExclusao(nome)} style={btnVermelho}>🗑️</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
            <button onClick={onFechar} style={btnFechar}>Fechar</button>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {confirmarExclusao && (
        <div style={confirmBackdrop}>
          <div style={confirmBox}>
            <p style={{ fontWeight: "bold", fontSize: "1rem" }}>
              Tem certeza que deseja excluir <u>{confirmarExclusao}</u>?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1.25rem" }}>
              <button onClick={() => setConfirmarExclusao(null)} style={btnCinza}>Cancelar</button>
              <button onClick={() => excluir(confirmarExclusao)} style={btnVermelho}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Estilos ---
const backdrop = {
  position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000
};

const container = {
  background: "#fff", borderRadius: "1rem", width: "720px",
  maxHeight: "80vh", overflowY: "auto", fontFamily: "Poppins, sans-serif"
};

const header = {
  background: "#1e40af", color: "#fff", padding: "1rem 1.5rem",
  borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem",
  fontSize: "1.1rem", fontWeight: "bold"
};

const th = { padding: "0.5rem", borderBottom: "1px solid #ddd" };
const td = { padding: "0.5rem", borderBottom: "1px solid #eee" };
const inputMini = {
  width: "100%", padding: "0.4rem", fontSize: "0.9rem",
  border: "1px solid #ccc", borderRadius: "0.375rem"
};

// Botões
const baseBtn = {
  border: "none", padding: "0.4rem 0.6rem",
  borderRadius: "0.5rem", fontSize: "0.9rem",
  cursor: "pointer", transition: "0.2s"
};

const btnAzul = { ...baseBtn, background: "#3b82f6", color: "#fff" };
const btnVerde = { ...baseBtn, background: "#10b981", color: "#fff" };
const btnVermelho = { ...baseBtn, background: "#ef4444", color: "#fff" };
const btnCinza = { ...baseBtn, background: "#e5e7eb", color: "#374151" };
const btnFechar = {
  ...btnCinza, padding: "0.6rem 1.2rem", fontWeight: "500"
};

// Modal confirmação
const confirmBackdrop = {
  position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10001
};

const confirmBox = {
  background: "#fff", padding: "2rem", borderRadius: "1rem", width: "400px",
  fontFamily: "Poppins, sans-serif", textAlign: "center"
};
