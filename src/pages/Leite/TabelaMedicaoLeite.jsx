import React from "react";
import "../../styles/tabelaModerna.css";

export default function TabelaMedicaoLeite({
  vacas = [],
  medicoes = {},
  tipoLancamento,
  onChange,
  onKeyDown,
  inputRefs,
  colunaHover,
  setColunaHover,
  calcularDEL,
}) {
  if (!Array.isArray(vacas)) {
    return <div style={{ color: "red" }}>Erro: lista de vacas inválida.</div>;
  }

  const titulos = [
    "Número",
    "Brinco",
    "DEL",
    ...(tipoLancamento !== "total" ? ["Manhã", "Tarde"] : []),
    ...(tipoLancamento === "3" ? ["3ª"] : []),
    "Total",
    "Lote",
    "Ação",
    "Motivo",
  ];

  const estiloAcao = (acao) => {
    if (acao === "Manter") return { color: "green", fontWeight: 600 };
    if (acao === "Secar") return { color: "red", fontWeight: 600 };
    if (acao === "Mover") return { color: "orange", fontWeight: 600 };
    return { color: "#444" };
  };

  const iconeAcao = (acao) => {
    if (acao === "Manter") return "✅";
    if (acao === "Secar") return "🛑";
    if (acao === "Mover") return "🔁";
    return "➖";
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="tabela-padrao">
        <thead>
          <tr>
            {titulos.map((titulo, index) => (
              <th
                key={index}
                onMouseEnter={() => setColunaHover(index)}
                onMouseLeave={() => setColunaHover(null)}
                className={colunaHover === index ? "coluna-hover" : ""}
              >
                {titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vacas.length === 0 ? (
            <tr>
              <td colSpan={titulos.length} style={{ textAlign: "center", padding: "1rem" }}>
                Nenhuma vaca em lactação encontrada.
              </td>
            </tr>
          ) : (
            vacas.map((vaca, row) => {
              const numeroStr = String(vaca.numero);
              const dados = medicoes?.[numeroStr] || {};
              const del = calcularDEL(vaca.ultimoParto);
              const campos = [];

              if (tipoLancamento !== "total") {
                campos.push(
                  <input
                    type="number"
                    value={dados.manha ?? ""}
                    onChange={(e) => onChange(numeroStr, "manha", e.target.value)}
                    onKeyDown={(e) => onKeyDown(e, row, "manha")}
                    ref={(el) => (inputRefs.current[`${row}-manha`] = el)}
                    className="input-medir"
                  />,
                  <input
                    type="number"
                    value={dados.tarde ?? ""}
                    onChange={(e) => onChange(numeroStr, "tarde", e.target.value)}
                    onKeyDown={(e) => onKeyDown(e, row, "tarde")}
                    ref={(el) => (inputRefs.current[`${row}-tarde`] = el)}
                    className="input-medir"
                  />
                );
              }

              if (tipoLancamento === "3") {
                campos.push(
                  <input
                    type="number"
                    value={dados.terceira ?? ""}
                    onChange={(e) => onChange(numeroStr, "terceira", e.target.value)}
                    onKeyDown={(e) => onKeyDown(e, row, "terceira")}
                    ref={(el) => (inputRefs.current[`${row}-terceira`] = el)}
                    className="input-medir"
                  />
                );
              }

              campos.push(
                <input
                  type="number"
                  value={dados.total ?? ""}
                  readOnly={tipoLancamento !== "total"}
                  onChange={(e) =>
                    tipoLancamento === "total" &&
                    onChange(numeroStr, "total", e.target.value)
                  }
                  className="input-medir"
                  style={{
                    backgroundColor: tipoLancamento !== "total" ? "#f1f5f9" : "white",
                    cursor: tipoLancamento !== "total" ? "not-allowed" : "auto",
                  }}
                />,
                <select
                  value={dados.lote || ""}
                  onChange={(e) => {
                    const novoLote = e.target.value;
                    const acao =
                      novoLote === dados.loteSugerido ? "Manter" : "Mover";
                    onChange(numeroStr, "lote", novoLote);
                    onChange(numeroStr, "acaoSugerida", acao);
                  }}
                  className="input-medir"
                >
                  <option value="">—</option>
                  <option value="Lote 1">Lote 1</option>
                  <option value="Lote 2">Lote 2</option>
                  <option value="Lote 3">Lote 3</option>
                  <option value="Secar">Secar</option>
                </select>,
                <span style={estiloAcao(dados.acaoSugerida)}>
                  {iconeAcao(dados.acaoSugerida)} {dados.acaoSugerida || "—"}
                </span>,
                <span title={dados.motivoSugestao || "—"}>
                  {dados.motivoSugestao || "—"}
                </span>
              );

              const colunas = [vaca.numero, vaca.brinco || "—", del, ...campos];

              return (
                <tr key={vaca.numero}>
                  {colunas.map((conteudo, colIdx) => (
                    <td
                      key={colIdx}
                      className={colunaHover === colIdx ? "coluna-hover" : ""}
                    >
                      {conteudo}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
