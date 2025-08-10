import React, { useState, useEffect } from "react";
import { buscarTodosAnimais, salvarAnimais } from "../../api";
import { adicionarEventoHistorico } from "../../utils/historico";
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  Bar,
  CartesianGrid,
  Cell
} from "recharts";

export default function AbaCCS({ vaca }) {
  const [data, setData] = useState("");
  const [valor, setValor] = useState("");
  const [observacao, setObservacao] = useState("");
  const [historico, setHistorico] = useState([]);
  const [tipoGrafico, setTipoGrafico] = useState("linha");

  useEffect(() => {
     (async () => {
      const todos = await buscarTodosAnimais();
      const vacaAtual = todos.find((a) => a.numero === vaca.numero);
      if (vacaAtual?.ccs) setHistorico(vacaAtual.ccs);
    })();
  }, [vaca]);

  useEffect(() => {
    const registro = historico.find(h => h.data === data);
    if (registro) {
      setValor(registro.valor.toLocaleString("pt-BR"));
      setObservacao(registro.observacao);
    } else {
      setValor("");
      setObservacao("");
    }
  }, [data, historico]);

   const handleSalvar = async () => {
    if (!data || !valor) {
      alert("Preencha a data e o valor da análise.");
      return;
    }

    const novoRegistro = {
      tipo: "CCS",
      data,
      valor: parseFloat(valor.replace(/\./g, "").replace(",", ".")),
      observacao: observacao || "",
      vaca: vaca.numero,
      id: Date.now()
    };

    const todos = await buscarTodosAnimais();
    const vacaAtualizada = todos.find((a) => a.numero === vaca.numero);

    const historicoAtualizado = historico.some((h) => h.data === data)
      ? historico.map((h) => (h.data === data ? novoRegistro : h))
      : [...historico, novoRegistro];

    let atual = await adicionarEventoHistorico(vacaAtualizada, "ccs", novoRegistro);
    atual.ccs = historicoAtualizado;

    const atualizados = todos.map((a) =>
      a.numero === vaca.numero ? atual : a
    );
    await salvarAnimais(atualizados);

    setHistorico(historicoAtualizado);
    alert("✅ Análise registrada com sucesso!");
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload.length) {
      const { data, valor } = payload[0].payload;
      return (
        <div style={{ padding: "0.5rem", background: "#fff", border: "1px solid #ddd" }}>
          <p><strong>Data:</strong> {data}</p>
          <p><strong>CCS:</strong> {valor.toLocaleString("pt-BR")} células/mL</p>
        </div>
      );
    }
    return null;
  };

  const historicoOrdenado = historico.sort((a, b) => new Date(a.data) - new Date(b.data));

  return (
    <div style={{ padding: "1.5rem", fontFamily: "Poppins, sans-serif" }}>
      <h3 style={{ fontWeight: 600, fontSize: "1.2rem", marginBottom: "1rem" }}>
        📉 Registro de Análises
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
        <div>
          <label style={{ fontWeight: 500 }}>Tipo de análise:</label>
          <input
            value="CCS"
            disabled
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 500 }}>Data:</label>
          <input
            type="date"
            value={data}
            onChange={e => setData(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 500 }}>Valor (mil células/mL):</label>
          <input
            type="text"
            value={valor}
            onChange={(e) => {
              const num = e.target.value.replace(/\D/g, "");
              setValor(Number(num).toLocaleString("pt-BR"));
            }}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label style={{ fontWeight: 500 }}>Observações:</label>
        <textarea
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            height: "100px"
          }}
          placeholder="Observações gerais..."
        />
      </div>

      <button
        onClick={handleSalvar}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#2563eb",
          color: "#fff",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer"
        }}
      >
        💾 Salvar Análise
      </button>

      {historico.length > 0 && (
        <>
          <h4 style={{ marginTop: "2rem", fontWeight: 600 }}>📊 Evolução das Análises</h4>

          <select
            value={tipoGrafico}
            onChange={(e) => setTipoGrafico(e.target.value)}
            style={{
              marginBottom: "1rem",
              padding: "0.3rem",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          >
            <option value="linha">Linha</option>
            <option value="coluna">Coluna</option>
          </select>

          <ResponsiveContainer width="100%" height={250}>
            {tipoGrafico === "linha" ? (
              <LineChart data={historicoOrdenado}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line dataKey="valor" stroke="#8884d8" dot={{ stroke: "#8884d8", strokeWidth: 2 }} />
              </LineChart>
            ) : (
              <BarChart data={historicoOrdenado}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="valor" fill="#8884d8">
                  {historicoOrdenado.map((entry) => (
                    <Cell key={entry.id} fill={entry.valor > 500000 ? "#ff4d4f" : "#22c55e"} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>

          <h4 style={{ marginTop: "2rem", fontWeight: 600 }}>📝 Histórico Completo</h4>
          <ul>
            {historicoOrdenado.reverse().map((h) => (
              <li key={h.id}>
                {h.data} — {h.valor.toLocaleString("pt-BR")} células/mL {h.observacao && `(${h.observacao})`}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
