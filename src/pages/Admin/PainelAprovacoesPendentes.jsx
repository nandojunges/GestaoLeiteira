import React, { useEffect, useState } from "react";
import api from "../../api";

export default function PainelAprovacoesPendentes() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarPendentes() {
      try {
        const res = await api.get("/admin/pendentes");
        setUsuarios(res.data);
      } catch (err) {
        console.error("Erro ao carregar pendentes:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregarPendentes();
  }, []);

  const aprovarPlano = async (usuario) => {
    try {
      await api.post("/admin/aprovar-plano", {
        idUsuario: usuario.id,
        plano: usuario.planoSolicitado,
        dias: 30, // prazo padrão
      });
      alert("Plano aprovado com sucesso!");
      setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id));
    } catch (err) {
      console.error("Erro ao aprovar plano:", err);
      alert("Erro ao aprovar plano.");
    }
  };

  if (carregando) return <p>Carregando usuários pendentes...</p>;

  if (usuarios.length === 0) return <p>Nenhuma solicitação pendente.</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Solicitações de Plano</h1>
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Nome</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Plano</th>
            <th className="p-2 border">Pagamento</th>
            <th className="p-2 border">Ação</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td className="p-2 border">{u.nome}</td>
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">{u.planoSolicitado}</td>
              <td className="p-2 border">{u.formaPagamento}</td>
              <td className="p-2 border">
                <button
                  onClick={() => aprovarPlano(u)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Aprovar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
