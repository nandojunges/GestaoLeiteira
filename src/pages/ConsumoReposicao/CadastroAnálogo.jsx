import React, { useState } from "react";

export default function CadastroAnálogo({ onFechar, onSalvar }) {
  const [nome, setNome] = useState("");
  const [dosePadrao, setDosePadrao] = useState("");

  const handleSalvar = () => {
    const analogo = { nome, dosePadrão: parseFloat(dosePadrao) };
    onSalvar(analogo);
  };

  return (
    <div className="modal">
      <h2>Cadastro de Análogo</h2>

      <label>Nome do Análogo:</label>
      <input
        type="text"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

      <label>Dose Padrão:</label>
      <input
        type="number"
        value={dosePadrao}
        onChange={(e) => setDosePadrao(e.target.value)}
      />

      <div className="botoes-modal">
        <button onClick={onFechar}>Cancelar</button>
        <button onClick={handleSalvar}>Salvar</button>
      </div>
    </div>
  );
}
