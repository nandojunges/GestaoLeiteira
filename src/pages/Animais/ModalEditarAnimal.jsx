import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { formatarDataDigitada } from "./utilsAnimais";


export default function ModalEditarAnimal({ animal, onFechar, onSalvar }) {
  const [dados, setDados] = useState({ ...animal });
  const refs = useRef([]);

  useEffect(() => {
    refs.current[0]?.focus();
    const esc = (e) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onFechar]);

  useEffect(() => {
    atualizarIdadeCategoria(dados.nascimento, dados.sexo);
  }, [dados.nascimento, dados.sexo]);

  const atualizarCampo = (campo, valor) => {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  };

  const atualizarIdadeCategoria = (nascimento, sexo) => {
    if (!nascimento || nascimento.length !== 10) return;
    const [dia, mes, ano] = nascimento.split("/").map(Number);
    const nascDate = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    const diff = hoje - nascDate;
    const meses = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
    const idade = `${Math.floor(meses / 12)}a ${meses % 12}m`;

    let categoria = "";
    if (meses < 2) categoria = sexo === "macho" ? "Bezerro" : "Bezerra";
    else if (meses < 12) categoria = sexo === "macho" ? "Novilho" : "Novilha jovem";
    else if (meses < 24) categoria = sexo === "macho" ? "Touro jovem" : "Novilha";
    else categoria = sexo === "macho" ? "Touro" : "Vaca";

    setDados((prev) => ({ ...prev, idade, categoria }));
  };

  const salvar = async () => {
    const formData = {
      numero: dados.numero,
      brinco: dados.brinco,
      nascimento: dados.nascimento,
      sexo: dados.sexo,
      origem: dados.origem,
      raca: dados.raca,
      categoria: dados.categoria,
      idade: dados.idade,
      nLactacoes: dados.nLactacoes,
      ultimaIA: dados.ultimaIA,
      ultimoParto: dados.ultimoParto,
      valorCompra: dados.valorCompra,
      pai: dados.pai,
      mae: dados.mae,
    };

    const token = localStorage.getItem('token');
    await fetch(`${import.meta.env.VITE_API_URL || '/api'}/animais/${animal.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData),
    });

    window.dispatchEvent(new Event("animaisAtualizados"));
    onSalvar();
  };

  const handleEnter = (e, index) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      refs.current[index + 1]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      refs.current[index - 1]?.focus();
    }
  };

  const sexoOptions = [
    { value: "femea", label: "Fêmea" },
    { value: "macho", label: "Macho" }
  ];

  const origemOptions = [
    { value: "propriedade", label: "Propriedade" },
    { value: "comprado", label: "Comprado" },
    { value: "doacao", label: "Doação" }
  ];

  const racaOptions = [
    { value: "Holandês", label: "Holandês" },
    { value: "Jersey", label: "Jersey" },
    { value: "Girolando", label: "Girolando" },
    { value: dados.raca, label: dados.raca }
  ];

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>🐄 Editar Animal — Nº {dados.numero}</div>
        <div style={{ padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={grid}>
            <div>
              <label>Número</label>
              <input value={dados.numero} readOnly style={input(true)} />
            </div>
            <div>
              <label>Brinco</label>
              <input
                ref={el => refs.current[0] = el}
                value={dados.brinco || ""}
                onChange={e => atualizarCampo("brinco", e.target.value)}
                onKeyDown={e => handleEnter(e, 0)}
                style={input()} />
            </div>
            <div>
              <label>Nascimento</label>
              <input
                ref={el => refs.current[1] = el}
                value={dados.nascimento || ""}
                onChange={e => atualizarCampo("nascimento", formatarDataDigitada(e.target.value))}
                onKeyDown={e => handleEnter(e, 1)}
                placeholder="dd/mm/aaaa"
                style={input()} />
            </div>
            <div>
              <label>Sexo</label>
              <Select
                options={sexoOptions}
                value={sexoOptions.find(opt => opt.value === dados.sexo) || null}
                onChange={(e) => atualizarCampo("sexo", e.value)}
                placeholder="Selecione"
              />
            </div>
            <div>
              <label>Raça</label>
              <Select
                options={racaOptions}
                value={racaOptions.find(opt => opt.value === dados.raca) || null}
                onChange={(e) => atualizarCampo("raca", e.value)}
                placeholder="Selecione"
              />
            </div>
            <div>
              <label>Origem</label>
              <Select
                options={origemOptions}
                value={origemOptions.find(opt => opt.value === dados.origem) || null}
                onChange={(e) => atualizarCampo("origem", e.value)}
                placeholder="Selecione"
              />
            </div>
            {dados.origem === "comprado" && (
              <div style={{ gridColumn: "1 / -1" }}>
                <label>Valor da Compra</label>
                <input
                  ref={el => refs.current[5] = el}
                  value={dados.valorCompra || ""}
                  onChange={e => atualizarCampo("valorCompra", e.target.value)}
                  style={input()} />
              </div>
            )}
            <div>
              <label>Categoria</label>
              <input value={dados.categoria || ""} readOnly style={input(true)} />
            </div>
            <div>
              <label>Idade</label>
              <input value={dados.idade || ""} readOnly style={input(true)} />
            </div>
            {dados.sexo !== "macho" && (
              <>
                <div>
                  <label>Nº Lactações</label>
                  <input
                    ref={el => refs.current[6] = el}
                    value={dados.nLactacoes || ""}
                    onChange={e => atualizarCampo("nLactacoes", e.target.value)}
                    style={input()} />
                </div>
                <div>
                  <label>Última IA</label>
                  <input
                    ref={el => refs.current[7] = el}
                    value={dados.ultimaIA || ""}
                    onChange={e => atualizarCampo("ultimaIA", formatarDataDigitada(e.target.value))}
                    placeholder="dd/mm/aaaa"
                    style={input()} />
                </div>
                <div>
                  <label>Último Parto</label>
                  <input
                    ref={el => refs.current[8] = el}
                    value={dados.ultimoParto || ""}
                    onChange={e => atualizarCampo("ultimoParto", formatarDataDigitada(e.target.value))}
                    placeholder="dd/mm/aaaa"
                    style={input()} />
                </div>
              </>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem" }}>
            <button onClick={onFechar} style={botaoCancelar}>Cancelar</button>
            <button onClick={salvar} style={botaoConfirmar}>Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const overlay = { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 };
const modal = { background: "#fff", borderRadius: "1rem", width: "720px", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: "Poppins, sans-serif" };
const header = { background: "#1e40af", color: "white", padding: "1rem 1.5rem", fontWeight: "bold", fontSize: "1.1rem", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem", textAlign: "center" };
const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "2.5rem", rowGap: "1.5rem" };
const input = (readOnly = false) => ({ width: "100%", padding: "0.75rem", fontSize: "0.95rem", borderRadius: "0.6rem", border: "1px solid #ccc", backgroundColor: readOnly ? "#f3f4f6" : "#fff" });
const botaoCancelar = { background: "#f3f4f6", border: "1px solid #d1d5db", padding: "0.6rem 1.2rem", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "500" };
const botaoConfirmar = { background: "#2563eb", color: "#fff", border: "none", padding: "0.6rem 1.4rem", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "600" };
