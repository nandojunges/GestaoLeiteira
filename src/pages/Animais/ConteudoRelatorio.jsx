import React from "react";

export default function ConteudoRelatorio() {
  const restaurarPlantel = async () => {
    try {
      const resposta = await fetch("/vacas_plantel_corrigido.json");
      const dados = await resposta.json();
      localStorage.setItem("animais", JSON.stringify(dados));
      window.dispatchEvent(new Event("animaisAtualizados"));
      alert("✅ Plantel restaurado com sucesso!");
    } catch (erro) {
      alert("❌ Erro ao restaurar o plantel.");
      console.error(erro);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">📈 Relatórios</h2>
      <ul className="list-disc ml-5 space-y-1 mb-4">
        <li>Relatório de Descarte</li>
        <li>Relatório de Vendas</li>
        <li>Outros relatórios técnicos</li>
      </ul>

      <button
        onClick={restaurarPlantel}
        style={{
          backgroundColor: "#22c55e",
          color: "white",
          padding: "0.6rem 1.2rem",
          borderRadius: "0.5rem",
          fontWeight: "600",
          fontSize: "1rem",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          transition: "background-color 0.3s",
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.backgroundColor = "#16a34a")
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.backgroundColor = "#22c55e")
        }
      >
        🐄 Restaurar Plantel de Vacas
      </button>
    </div>
  );
}
