import React, { useState, useEffect } from "react";

export default function ModalConfiguracaoPEV({ onClose, onAplicar }) {
  const [diasPEV, setDiasPEV] = useState(60);
  const [permitirPreSincronizacao, setPermitirPreSincronizacao] = useState(false);
  const [permitirSecagem, setPermitirSecagem] = useState(true);

  useEffect(() => {
    const config = JSON.parse(localStorage.getItem("configPEV") || "{}");
    if (config.diasPEV) setDiasPEV(config.diasPEV);
    if (typeof config.permitirPreSincronizacao === "boolean")
      setPermitirPreSincronizacao(config.permitirPreSincronizacao);
    if (typeof config.permitirSecagem === "boolean")
      setPermitirSecagem(config.permitirSecagem);
  }, []);

  const salvar = () => {
    const config = {
      diasPEV,
      permitirPreSincronizacao,
      permitirSecagem
    };
    localStorage.setItem("configPEV", JSON.stringify(config));
    window.dispatchEvent(new Event("configPEVAtualizado"));

    if (onAplicar) onAplicar(config);
    onClose();
  };

  const overlay = { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 };
  const modal = { background: "#fff", borderRadius: "1rem", width: "400px", padding: "1.5rem", fontFamily: "Poppins, sans-serif" };
  const input = { width: "100%", margin: "0.5rem 0", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #ccc" };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2 style={{ marginBottom: "1rem" }}>⚙️ Configurar Critérios de PEV</h2>

        <label>Dias para considerar PEV (DEL máximo):</label>
        <input
          type="number"
          value={diasPEV}
          onChange={(e) => setDiasPEV(Number(e.target.value))}
          style={input}
        />

        <div style={{ margin: "1rem 0" }}>
          <label>
            <input
              type="checkbox"
              checked={permitirPreSincronizacao}
              onChange={(e) => setPermitirPreSincronizacao(e.target.checked)}
            />{" "}
            Permitir Pré-sincronização
          </label>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>
            <input
              type="checkbox"
              checked={permitirSecagem}
              onChange={(e) => setPermitirSecagem(e.target.checked)}
            />{" "}
            Permitir Registrar Secagem
          </label>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          <button onClick={onClose} className="botao-cancelar">Cancelar</button>
          <button onClick={salvar} className="botao-acao">💾 Salvar</button>
        </div>
      </div>
    </div>
  );
}
