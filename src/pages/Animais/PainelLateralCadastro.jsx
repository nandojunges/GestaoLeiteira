import React from "react";

export default function PainelLateralCadastro({ total, nascidos, comprados, ultimo }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        borderRadius: "1rem 0 0 1rem",
        padding: "1.2rem", // 🔽 Reduzido de 1.5rem para 1.2rem
        fontFamily: "Poppins, sans-serif",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        width: "280px",
        marginTop: "-48px",
        marginLeft: "50px", // Pode ajustar lateral aqui
        alignSelf: "flex-start",
        position: "relative",
        zIndex: 10
      }}
    >
      <div style={{ marginBottom: "1.2rem" }}>
        <p style={{ fontWeight: "600", margin: 0, fontSize: "1rem" }}>Resumo do Plantel</p>
        <ul style={{ paddingLeft: "1rem", fontSize: "0.92rem", marginTop: "0.5rem" }}>
          <li>Total de animais: <strong>{total}</strong></li>
          <li>Nascidos na propriedade: <strong>{nascidos}</strong></li>
          <li>Comprados: <strong>{comprados}</strong></li>
        </ul>
      </div>

      <div style={{ marginBottom: "1.2rem" }}>
        <p style={{ fontWeight: "600", marginBottom: "0.4rem", fontSize: "1rem" }}>Último nº cadastrado</p>
        <div style={{
          backgroundColor: "#e5e7eb",
          borderRadius: "0.5rem",
          padding: "0.5rem",
          fontWeight: "600",
          textAlign: "center",
          fontSize: "1rem"
        }}>
          {ultimo}
        </div>
      </div>

      <div style={{ marginBottom: "1.2rem" }}>
        <p style={{ fontWeight: "600", marginBottom: "0.4rem", fontSize: "1rem" }}>Checklist</p>
        <ul style={{
          listStyle: 'none',
          paddingLeft: 0,
          fontSize: '0.9rem',
          lineHeight: '1.6',
          marginTop: 0
        }}>
          <li><input type="checkbox" /> Vermifugado</li>
          <li><input type="checkbox" /> Grupo definido</li>
          <li><input type="checkbox" /> Ficha complementar OK</li>
        </ul>
      </div>

      <div style={{
        backgroundColor: '#fffbea',
        padding: '0.7rem',
        borderRadius: '0.5rem',
        border: '1px solid #fde68a',
        fontSize: '0.88rem',
        lineHeight: '1.4'
      }}>
        <p style={{ fontWeight: '600', marginBottom: '0.3rem' }}>💡 Dica do Dia</p>
        <p style={{ margin: 0 }}>Animais com brinco identificável facilitam o controle sanitário.</p>
      </div>
    </div>
  );
}
