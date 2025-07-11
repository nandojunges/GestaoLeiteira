import React, { useState } from "react";
import ListaCalendarioVacinal from "./ListaCalendarioVacinal";
import ModalCadastroManejoSanitario from "./ModalCadastroManejoSanitario";
import ModalExamesSanitarios from "./ModalExamesSanitarios";
import "../../styles/botoes.css";

export default function CalendarioSanitario() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarExames, setMostrarExames] = useState(false);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-blue-800">Calendário Sanitário</h3>
        <div className="flex gap-2">
          <button className="botao-acao" onClick={() => setMostrarExames(true)}>
            Exames Sanitários
          </button>
          <button className="botao-acao" onClick={() => setMostrarModal(true)}>
            + Novo Manejo
          </button>
        </div>
      </div>
      <ListaCalendarioVacinal />
      {mostrarModal && (
        <ModalCadastroManejoSanitario
          onFechar={() => setMostrarModal(false)}
          onSalvar={() => setMostrarModal(false)}
        />
      )}
      {mostrarExames && (
        <ModalExamesSanitarios onFechar={() => setMostrarExames(false)} />
      )}
    </div>
  );
}

