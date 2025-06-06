import React, { useState } from "react";
import SubAbasConsumoReposicao from "./SubAbasConsumoReposicao";
import Estoque from "./Estoque";
import CadastroLotes from "./CadastroLotes";
import ListaDietas from "./ListaDietas";
import Limpeza from "./Limpeza";
import CalendarioSanitario from "./CalendarioSanitario";

export default function ConsumoReposicao() {
  const [abaInterna, setAbaInterna] = useState("estoque");

  const renderizarConteudo = () => {
    switch (abaInterna) {
      case "estoque":
        return <Estoque />;
      case "cadastroLotes":
        return <CadastroLotes />;
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
    </div>
  );
}
