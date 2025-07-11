import React, { useEffect, useState } from "react";
import CadastroDietas from "./CadastroDietas";
import "../../styles/tabelaModerna.css";
import "../../styles/botoes.css";
import ModalExclusaoPadrao from "../../components/ModalExclusaoPadrao";
import {
  db,
  buscarTodos,
  adicionarItem,
} from "../../utils/db";

export default function ListaDietas() {
  const [dietas, setDietas] = useState([]);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [colunaHover, setColunaHover] = useState(null);
  const [dietaEditar, setDietaEditar] = useState(null);
  const [indiceEditar, setIndiceEditar] = useState(null);
  const [dietaParaExcluir, setDietaParaExcluir] = useState(null);

  const carregar = async () => {
    const armazenadas = await buscarTodos("dietas");
    (armazenadas || []).sort(
      (a, b) => new Date(b.data || 0) - new Date(a.data || 0)
    );
    setDietas(armazenadas || []);
  };

  useEffect(() => {
    carregar();
    window.addEventListener("dietasAtualizadas", carregar);
    return () => window.removeEventListener("dietasAtualizadas", carregar);
  }, []);

  const salvarDieta = async (dieta, indice = null) => {
    let atualizadas = [];
    if (indice != null && indice >= 0) {
      atualizadas = [...dietas];
      atualizadas[indice] = dieta;
    } else {
      atualizadas = [...dietas, dieta];
    }
    atualizadas.sort(
      (a, b) => new Date(b.data || 0) - new Date(a.data || 0)
    );
    await adicionarItem("dietas", atualizadas);
    setDietas(atualizadas);
    setMostrarCadastro(false);
    setDietaEditar(null);
    setIndiceEditar(null);
    window.dispatchEvent(new Event("dietasAtualizadas"));
  };

  const titulos = [
    "Lote",
    "Nº de Vacas",
    "Custo Total",
    "Custo Vaca/dia",
    "Custo Vaca/mês",
    "Data",
    "Ações",
  ];

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
                <td
                  title={`Ingredientes:\n${d.ingredientes
                    .map((ing) => `- ${ing.produto}: ${ing.quantidade} kg`)
                    .join("\n")}`}
                >
                  {d.lote || "—"}
                </td>
                <td>{d.numVacas || "—"}</td>
                <td>
                  {d.custoTotal ? `R$ ${Number(d.custoTotal).toFixed(2)}` : "—"}
                </td>
                <td>
                  {d.custoVacaDia ? `R$ ${Number(d.custoVacaDia).toFixed(2)}` : "—"}
                </td>
                <td>
                  {d.custoVacaDia
                    ? `R$ ${(Number(d.custoVacaDia) * 30).toFixed(2)}`
                    : "—"}
                </td>
                <td>
                  {d.data
                    ? new Date(d.data).toLocaleDateString("pt-BR")
                    : "—"}
                </td>
                <td className="coluna-acoes">
                  <div className="botoes-tabela">
                    <button
                      className="btn-editar"
                      onClick={() => {
                        setDietaEditar(d);
                        setIndiceEditar(idx);
                        setMostrarCadastro(true);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-excluir"
                      onClick={() => setDietaParaExcluir({ dieta: d, indice: idx })}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td style={{ fontWeight: "bold" }}>Totais</td>
              <td>
                {dietas.reduce((acc, d) => acc + (Number(d.numVacas) || 0), 0)}
              </td>
              <td>
                {`R$ ${dietas
                  .reduce((acc, d) => acc + (Number(d.custoTotal) || 0), 0)
                  .toFixed(2)}`}
              </td>
              <td>
                {(() => {
                  const totalVacas = dietas.reduce(
                    (acc, d) => acc + (Number(d.numVacas) || 0),
                    0
                  );
                  const totalCusto = dietas.reduce(
                    (acc, d) => acc + (Number(d.custoTotal) || 0),
                    0
                  );
                  return totalVacas
                    ? `R$ ${(totalCusto / totalVacas).toFixed(2)}`
                    : "R$ 0.00";
                })()}
              </td>
              <td>
                {(() => {
                  const totalVacas = dietas.reduce(
                    (acc, d) => acc + (Number(d.numVacas) || 0),
                    0
                  );
                  const totalCusto = dietas.reduce(
                    (acc, d) => acc + (Number(d.custoTotal) || 0),
                    0
                  );
                  return totalVacas
                    ? `R$ ${((totalCusto / totalVacas) * 30).toFixed(2)}`
                    : "R$ 0.00";
                })()}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      )}

      {mostrarCadastro && (
        <CadastroDietas
          onFechar={() => {
            setMostrarCadastro(false);
            setDietaEditar(null);
            setIndiceEditar(null);
          }}
          onSalvar={salvarDieta}
          dieta={dietaEditar}
          indice={indiceEditar}
        />
      )}

      {dietaParaExcluir && (
        <ModalExclusaoPadrao
          mensagem="Deseja realmente excluir esta dieta?"
          onCancelar={() => setDietaParaExcluir(null)}
          onConfirmar={async () => {
            const atualizadas = dietas.filter((_, i) => i !== dietaParaExcluir.indice);
            await adicionarItem("dietas", atualizadas);
            setDietas(atualizadas);
            setDietaParaExcluir(null);
            window.dispatchEvent(new Event("dietasAtualizadas"));
          }}
        />
      )}
    </div>
  );
}
