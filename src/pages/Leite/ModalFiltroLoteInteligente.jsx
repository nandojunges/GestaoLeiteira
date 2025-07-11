import React, { useEffect, useState } from "react";
import { calcularDEL } from "../Animais/utilsAnimais";
import "../../styles/botoes.css";
import { buscarTodos, adicionarItem } from "../../utils/apiFuncoes.js";

export default function ModalSugestaoLote({ vacas, medicoes, onAplicar, onFechar }) {
  const [parametros, setParametros] = useState({
    producaoMinimaParaLote1: 15,
    usarProducaoMinimaParaLote1: true,
    producaoMaximaParaLote3: 8,
    usarProducaoMaximaParaLote3: true,
    forcarSecagemComDEL: 300,
    usarForcarSecagemComDEL: true,
  });

  useEffect(() => {
    (async () => {
      const salvos = await buscarTodos("parametrosFiltroLote");
      if (salvos.length) setParametros(salvos[0]);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await adicionarItem("parametrosFiltroLote", [parametros]);
    })();
  }, [parametros]);

  const beautifyLabel = (chave) =>
    chave
      .replace(/^usar/, "Usar ")
      .replace("DEL", "DEL")
      .replace(/([A-Z])/g, " $1")
      .replace(/\bLote\b/g, "Lote")
      .replace(/\bDEL\b/g, "DEL")
      .replace(/\bProd\b/g, "Produção")
      .replace(/\bPrenhe\b/g, "Prenhe")
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();

  const renderSwitch = (checked, onChange) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{ transform: "scale(1.3)", marginLeft: "0.5rem" }}
    />
  );

  const handleAplicar = () => {
    const sugestoes = vacas.map((v) => {
      const numeroStr = String(v.numero);
      const dados = medicoes[numeroStr] || {};
      const total = parseFloat(dados.total || 0);
      const del = calcularDEL(v.ultimoParto);

      let lote = "Lote 2";

      if (parametros.usarProducaoMaximaParaLote3 && total <= parametros.producaoMaximaParaLote3) {
        lote = "Lote 3";
      } else if (parametros.usarProducaoMinimaParaLote1 && total >= parametros.producaoMinimaParaLote1) {
        lote = "Lote 1";
      }

      if (parametros.usarForcarSecagemComDEL && del >= parametros.forcarSecagemComDEL) {
        lote = "Secar";
      }

      return { numero: v.numero, lote };
    });

    if (typeof onAplicar === "function") onAplicar(sugestoes);
    if (typeof onFechar === "function") onFechar();
  };

  const input = {
    width: "100%",
    height: "44px",
    padding: "0.75rem",
    fontSize: "0.95rem",
    borderRadius: "0.6rem",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    marginTop: "0.5rem",
    marginBottom: "0.5rem",
  };

  const labelEstilo = {
    marginBottom: "0.2rem",
    display: "inline-block",
    fontWeight: 600,
  };

  const modal = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  };

  const caixa = {
    background: "#fff",
    borderRadius: "1rem",
    width: "600px",
    maxHeight: "95vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Poppins, sans-serif",
  };

  const header = {
    background: "#1e40af",
    color: "white",
    padding: "1rem 1.5rem",
    fontWeight: "bold",
    fontSize: "1.2rem",
    borderTopLeftRadius: "1rem",
    borderTopRightRadius: "1rem",
  };

  const conteudo = {
    padding: "1.5rem",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "1.2rem",
  };

  const rodape = {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    padding: "1rem 1.5rem",
    borderTop: "1px solid #ddd",
  };

  return (
    <div style={modal} tabIndex={0}>
      <div style={caixa}>
        <div style={header}>🔍 Sugerir Lote de Manejo — Filtro Inteligente</div>
        <div style={conteudo}>
          {Object.entries(parametros).map(([chave, valor]) => {
            if (typeof valor === "boolean" && chave.startsWith("usar")) return null;
            if (typeof valor === "number") {
              const chaveBool = `usar${chave.charAt(0).toUpperCase()}${chave.slice(1)}`;
              return (
                <div key={chave}>
                  <label style={labelEstilo}>
                    {beautifyLabel(chave)}
                    {parametros[chaveBool] !== undefined &&
                      renderSwitch(parametros[chaveBool], (e) =>
                        setParametros((p) => ({ ...p, [chaveBool]: e.target.checked }))
                      )}
                  </label>
                  <input
                    type="number"
                    value={valor}
                    onChange={(e) =>
                      setParametros((p) => ({ ...p, [chave]: parseInt(e.target.value) }))
                    }
                    style={input}
                  />
                </div>
              );
            }
            if (typeof valor === "boolean") {
              return (
                <div key={chave}>
                  <label style={labelEstilo}>
                    {beautifyLabel(chave)}
                    {renderSwitch(valor, (e) =>
                      setParametros((p) => ({ ...p, [chave]: e.target.checked }))
                    )}
                  </label>
                </div>
              );
            }
            return null;
          })}
        </div>
        <div style={rodape}>
          <button onClick={onFechar} className="botao-cancelar">Cancelar</button>
          <button onClick={handleAplicar} className="botao-acao">✅ Aplicar Sugestões</button>
        </div>
      </div>
    </div>
  );
}
