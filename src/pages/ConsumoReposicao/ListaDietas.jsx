import React, { useEffect, useState } from "react";
import CadastroDietas from "./CadastroDietas";
import "../../styles/tabelaModerna.css";
import "../../styles/botoes.css";

export default function ListaDietas() {
  const [dietas, setDietas] = useState([]);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [colunaHover, setColunaHover] = useState(null);

  const carregar = () => {
    const armazenadas = JSON.parse(localStorage.getItem("dietas") || "[]");
    setDietas(armazenadas);
  };

  useEffect(() => {
    carregar();
    window.addEventListener("dietasAtualizadas", carregar);
    return () => window.removeEventListener("dietasAtualizadas", carregar);
  }, []);

  const salvarDieta = (dieta) => {
    const atualizadas = [...dietas, dieta];
    localStorage.setItem("dietas", JSON.stringify(atualizadas));
    setDietas(atualizadas);
    setMostrarCadastro(false);
    window.dispatchEvent(new Event("dietasAtualizadas"));
  };

  const titulos = ["Lote", "Nº de Vacas", "Custo Total", "Custo Vaca/dia"];

  return (
    <div className="w-full px-8 py-6 font-sans">
      <div style={{ marginBottom: "10px" }}>
        <button className="botao-acao" onClick={() => setMostrarCadastro(true)}>
          + Nova Dieta
        </button>
      </div>
      {dietas.length === 0 ? (
        <p>Nenhuma dieta cadastrada.</p>
      ) : (
        <table className="tabela-padrao">
          <thead>
            <tr>
              {titulos.map((t, idx) => (
                <th
                  key={idx}
                  onMouseEnter={() => setColunaHover(idx)}
                  onMouseLeave={() => setColunaHover(null)}
                  className={colunaHover === idx ? "coluna-hover" : ""}
                >
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dietas.map((d, idx) => (
              <tr key={idx}>
                <td>{d.lote || "—"}</td>
                <td>{d.numVacas || "—"}</td>
                <td>{d.custoTotal ? `R$ ${Number(d.custoTotal).toFixed(2)}` : "—"}</td>
                <td>
                  {d.custoVacaDia ? `R$ ${Number(d.custoVacaDia).toFixed(2)}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {mostrarCadastro && (
        <CadastroDietas onFechar={() => setMostrarCadastro(false)} onSalvar={salvarDieta} />
      )}
    </div>
  );
}
