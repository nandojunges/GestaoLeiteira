import React, { useState } from "react";
import ListaLimpeza from "./ListaLimpeza";
import ModalCadastroCiclo from "./ModalCadastroCiclo";
import {
  buscarTodos,
  adicionarItem,
} from "../../utils/backendApi";

export default function Limpeza() {
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [cicloEditar, setCicloEditar] = useState(null);
  const [indiceEditar, setIndiceEditar] = useState(null);

  const abrirCadastro = () => {
    setMostrarCadastro(true);
  };

  const editar = (ciclo, indice) => {
    setCicloEditar(ciclo);
    setIndiceEditar(indice);
    setMostrarCadastro(true);
  };

  const salvar = async (ciclo, indice = null) => {
    const lista = await buscarTodos("ciclosLimpeza");
    let atualizados = [];
    if (indice != null && indice >= 0) {
      atualizados = [...(lista || [])];
      atualizados[indice] = ciclo;
    } else {
      atualizados = [...(lista || []), ciclo];
    }
    await adicionarItem("ciclosLimpeza", atualizados);
    window.dispatchEvent(new Event("ciclosLimpezaAtualizados"));
    setMostrarCadastro(false);
    setCicloEditar(null);
    setIndiceEditar(null);
  };

  return (
    <div className="w-full px-8 py-6 font-sans">
      <h3 className="text-lg font-bold text-blue-800 mb-4">Ciclos de Limpeza</h3>
      <div style={{ marginBottom: "10px" }}>
        <button className="botao-acao" onClick={abrirCadastro}>
          + Cadastrar Ciclo de Limpeza
        </button>
      </div>
      <ListaLimpeza onEditar={editar} />
      {mostrarCadastro && (
        <ModalCadastroCiclo
          ciclo={cicloEditar}
          indice={indiceEditar}
          onFechar={() => {
            setMostrarCadastro(false);
            setCicloEditar(null);
            setIndiceEditar(null);
          }}
          onSalvar={salvar}
        />
      )}
    </div>
  );
}
