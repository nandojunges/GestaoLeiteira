import React from "react";
import CadastroBasicoAnimal from "./CadastroBasicoAnimal";
import PainelLateralCadastro from "./PainelLateralCadastro";

export default function ConteudoEntradaAnimal({ animais, onAtualizar }) {
  const nascidos = animais.filter((a) => a.origem === "nascido").length;
  const comprados = animais.filter((a) => a.origem === "comprado").length;
  const ultimo = animais.length > 0
    ? Math.max(...animais.map((a) => parseInt(a.numero || 0)))
    : "-";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "2rem 2rem 2rem 2rem",
        maxWidth: "1400px",
        margin: "0 auto",
        gap: "2rem",
        boxSizing: "border-box"
      }}
    >
      {/* Formulário principal */}
      <div style={{ flex: 1 }}>
        <CadastroBasicoAnimal animais={animais} onAtualizar={onAtualizar} />
      </div>

      {/* Painel lateral */}
      <div style={{ flexShrink: 0 }}>
        <PainelLateralCadastro
          total={animais.length}
          nascidos={nascidos}
          comprados={comprados}
          ultimo={ultimo}
        />
      </div>
    </div>
  );
}
