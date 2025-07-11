import React, { useState } from "react";
import SubAbasConsumoReposicao from "./SubAbasConsumoReposicao";
import Estoque from "./Estoque";
import ListaLotes from "./ListaLotes"; // ✅ Substitui CadastroLotes aqui
import CadastroLotes from "./CadastroLotes"; // ✅ Será aberto apenas via botão
import ListaDietas from "./ListaDietas";
import Limpeza from "./Limpeza";
import CalendarioSanitario from "./CalendarioSanitario";

export default function ConsumoReposicao() {
  const [abaInterna, setAbaInterna] = useState("estoque");
  const [mostrarCadastroLote, setMostrarCadastroLote] = useState(false); // ✅ novo

  const renderizarConteudo = () => {
    switch (abaInterna) {
      case "estoque":
        return <Estoque />;
      case "cadastroLotes":
        return (
          <ListaLotes onAbrirCadastro={() => setMostrarCadastroLote(true)} />
        ); // ✅ renderiza ListaLotes
      case "dietas":
        return <ListaDietas />;
      case "limpeza":
        return <Limpeza />;
      case "calendarioSanitario":
        return <CalendarioSanitario />;
      default:
        return <Estoque />;
    }
  };

  return (
    <div className="w-full px-4 pt-2">
      <SubAbasConsumoReposicao
        abaAtiva={abaInterna}
        setAbaAtiva={setAbaInterna}
        espacoVerticalSuperior="12px"
        espacoInferior="0px"
      />
      <div className="pt-4">{renderizarConteudo()}</div>

      {mostrarCadastroLote && (
        <CadastroLotes
          onFechar={() => setMostrarCadastroLote(false)}
          onSalvar={() => setMostrarCadastroLote(false)}
        />
      )}
    </div>
  );
}
