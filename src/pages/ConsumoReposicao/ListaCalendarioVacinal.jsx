import React, { useEffect, useState } from "react";
import ModalCadastroManejoSanitario from "./ModalCadastroManejoSanitario";
import ModalRegistroAplicacao from "./ModalRegistroAplicacao";
import "../../styles/tabelaModerna.css";
import "../../styles/botoes.css";

export default function ListaCalendarioVacinal() {
  const [manejos, setManejos] = useState([]);
  const [editar, setEditar] = useState(null);
  const [indiceEditar, setIndiceEditar] = useState(null);
  const [registrar, setRegistrar] = useState(null);
  const [indiceRegistrar, setIndiceRegistrar] = useState(null);

  useEffect(() => {
    const carregar = () => {
      const lista = JSON.parse(localStorage.getItem("manejosSanitarios") || "[]");
      setManejos(lista);
    };
    carregar();
    window.addEventListener("manejosSanitariosAtualizados", carregar);
    return () => window.removeEventListener("manejosSanitariosAtualizados", carregar);
  }, []);

  const titulos = [
    "Categoria", "Tipo", "Produto", "Frequência / Intervalo", "Idade de Aplicação",
    "Via", "Dose (mL)", "Próxima Aplicação", "Ações"
  ];

  const fecharModal = () => {
    setEditar(null);
    setIndiceEditar(null);
    const lista = JSON.parse(localStorage.getItem("manejosSanitarios") || "[]");
    setManejos(lista);
  };

  const fecharRegistro = () => {
    setRegistrar(null);
    setIndiceRegistrar(null);
    const lista = JSON.parse(localStorage.getItem("manejosSanitarios") || "[]");
    setManejos(lista);
  };

  return (
    <div className="w-full">
      <table className="tabela-padrao">
        <thead>
          <tr>
            {titulos.map((t, i) => (
              <th key={i}>{t}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {manejos.length === 0 ? (
            <tr>
              <td colSpan={titulos.length} style={{ textAlign: "center", padding: "20px" }}>
                Nenhum manejo cadastrado.
              </td>
            </tr>
          ) : (
            manejos.map((m, idx) => (
              <tr key={idx}>
                <td>{m.categoria || "—"}</td>
                <td>{m.tipo || "—"}</td>
                <td>{m.produto || "—"}</td>
                <td>{m.frequencia || "—"}</td>
                <td>{m.idade || "—"}</td>
                <td>{m.via || "—"}</td>
                <td>{m.dose ? `${m.dose} mL` : "—"}</td>
                <td>{m.proximaAplicacao ? new Date(m.proximaAplicacao).toLocaleDateString("pt-BR") : (m.dataInicial ? new Date(m.dataInicial).toLocaleDateString("pt-BR") : "—")}</td>
                <td className="coluna-acoes">
                  <div className="botoes-tabela">
                    <button className="botao-editar" onClick={() => { setEditar(m); setIndiceEditar(idx); }}>
                      Editar
                    </button>
                    <button className="botao-editar" onClick={() => { setRegistrar(m); setIndiceRegistrar(idx); }}>
                      Registrar
                    </button>
                    <button
                      className="botao-editar"
                      style={{ borderColor: "#dc3545", color: "#dc3545" }}
                      onClick={() => {
                        if (window.confirm("Deseja excluir este manejo?")) {
                          const nova = manejos.filter((_, i) => i !== idx);
                          localStorage.setItem("manejosSanitarios", JSON.stringify(nova));
                          setManejos(nova);
                          window.dispatchEvent(new Event("manejosSanitariosAtualizados"));
                        }
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {editar && (
        <ModalCadastroManejoSanitario
          manejo={editar}
          indice={indiceEditar}
          onFechar={fecharModal}
          onSalvar={fecharModal}
        />
      )}
      {registrar && (
        <ModalRegistroAplicacao
          manejo={registrar}
          indice={indiceRegistrar}
          onFechar={fecharRegistro}
        />
      )}
    </div>
  );
}

