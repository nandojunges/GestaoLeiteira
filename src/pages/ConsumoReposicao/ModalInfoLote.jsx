import React, { useEffect, useState } from "react";
import { calcularDEL } from "../Animais/utilsAnimais";
import "../../styles/tabelaModerna.css";
import { buscarTodos } from "../../utils/backendApi";

export default function ModalInfoLote({ nomeDoLote, funcaoDoLote, onFechar }) {
  const [animais, setAnimais] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const lista = await buscarTodos("animais");
        const filtrados = (lista || []).filter((a) => a.lote === nomeDoLote);
        for (const a of filtrados) {
          const infoList = await buscarTodos("secagem_" + a.numero);
          a.secagemInfo = infoList[0] || null;
        }
        setAnimais(filtrados);
      } catch (err) {
        console.error("Erro ao buscar info do lote:", err);
        setAnimais([]);
      }
    })();
    const esc = (e) => e.key === "Escape" && onFechar?.();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [nomeDoLote, onFechar]);

  const parseData = (d) => {
    if (!d) return null;
    return new Date(d.includes("/") ? d.split("/").reverse().join("-") : d);
  };

  const colunas = (() => {
    switch (funcaoDoLote) {
      case "Lactação":
        return ["Nº", "Brinco", "DEL", "Última Produção (L)"];
      case "Pré-parto":
        return ["Nº", "Brinco", "Previsão", "Dias"];
      case "Secagem":
        return ["Nº", "Brinco", "Data", "Carência"];
      case "Novilhas":
        return ["Nº", "Brinco", "Idade", "Categoria"];
      case "Descarte":
        return ["Nº", "Brinco", "Motivo", "Saída"];
      case "Tratamento":
        return ["Nº", "Brinco", "Data", "Principio", "Resp."];
      default:
        return ["Nº", "Brinco", "Categoria", "Idade"];
    }
  })();

  const obterCelulas = (a) => {
    switch (funcaoDoLote) {
      case "Lactação": {
        const del = calcularDEL(a.ultimoParto || "");
        const ult = Array.isArray(a.leite)
          ? [...a.leite].sort((x, y) => parseData(y.data) - parseData(x.data))[0]
          : null;
        const litros = ult && typeof ult.litros !== "undefined" ? ult.litros : "—";
        return [a.numero || "—", a.brinco || "—", del ?? "—", litros];
      }
      case "Pré-parto": {
        const prev = a.dataPrevistaParto;
        let dias = "—";
        if (prev) {
          const [d, m, y] = prev.split("/");
          const data = new Date(y, m - 1, d);
          dias = Math.round((data - new Date()) / (1000 * 60 * 60 * 24));
        }
        return [a.numero || "—", a.brinco || "—", prev || "—", dias];
      }
      case "Secagem": {
        const info = a.secagemInfo;
        const carencia = info ? `${info.carenciaLeite || ""}/${info.carenciaCarne || ""}`.replace(/\/$/, "") : "—";
        return [a.numero || "—", a.brinco || "—", info?.data || "—", carencia || "—"];
      }
      case "Novilhas": {
        let idade = "—";
        let cat = a.categoria || "—";
        if (a.dataNascimento) {
          const [d, m, y] = a.dataNascimento.split("/");
          const nasc = new Date(y, m - 1, d);
          const hoje = new Date();
          idade =
            (hoje.getFullYear() - nasc.getFullYear()) * 12 +
            (hoje.getMonth() - nasc.getMonth());
        }
        return [a.numero || "—", a.brinco || "—", idade, cat];
      }
      case "Descarte": {
        const mot = a.saida?.motivo || "—";
        const data = a.saida?.data || "—";
        return [a.numero || "—", a.brinco || "—", mot, data];
      }
      case "Tratamento": {
        const t = (a.tratamentos || []).slice(-1)[0];
        return [
          a.numero || "—",
          a.brinco || "—",
          t?.data || "—",
          t?.principioAtivo || "—",
          t?.responsavel || "—",
        ];
      }
      default:
        let idade = "—";
        if (a.dataNascimento) {
          const [d, m, y] = a.dataNascimento.split("/");
          const nasc = new Date(y, m - 1, d);
          const hoje = new Date();
          idade =
            (hoje.getFullYear() - nasc.getFullYear()) * 12 +
            (hoje.getMonth() - nasc.getMonth());
        }
        return [a.numero || "—", a.brinco || "—", a.categoria || "—", idade];
    }
  };

  return (
    <div style={overlay} onClick={onFechar}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={header}>📋 {nomeDoLote} — {funcaoDoLote}</div>
        <div style={{ padding: "1rem", overflowY: "auto" }}>
          <table className="tabela-padrao">
            <thead>
              <tr>
                {colunas.map((c, i) => (
                  <th key={i}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {animais.length === 0 ? (
                <tr>
                  <td colSpan={colunas.length} style={{ textAlign: "center" }}>
                    Nenhum animal encontrado.
                  </td>
                </tr>
              ) : (
                animais.map((a, i) => (
                  <tr key={i}>
                    {obterCelulas(a).map((cel, j) => (
                      <td key={j}>{cel}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
  width: "720px",
  maxHeight: "90vh",
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
  fontSize: "1.1rem",
  borderTopLeftRadius: "1rem",
  borderTopRightRadius: "1rem",
};
