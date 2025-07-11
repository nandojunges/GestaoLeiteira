// CamposProduto.jsx
import React, { useState } from "react";
import Select from "react-select";
import {
  adicionarItem,
} from "../../utils/backendApi";

export default function CamposProduto({
  produto,
  setProduto,
  categorias,
  hormonios,
  analogosGnRH,
  principiosAtivosAntibioticos,
  principiosAtivosAntiparasitarios,
  opcoesApresentacao,
  setOpcoesApresentacao,
  apresentacoesPorCategoria,
  mostrarHormonal,
  setMostrarHormonal,
  mostrarAIEInfo,
  setMostrarAIEInfo,
  mostrarCarencia,
  setMostrarCarencia,
  mostrarPrincipioAtivo,
  setMostrarPrincipioAtivo,
  mostrarDoseDispositivo,
  setMostrarDoseDispositivo,
  semCarenciaLeite,
  setSemCarenciaLeite,
  semCarenciaCarne,
  setSemCarenciaCarne,
  semValidade,
  setSemValidade,
  refs,
  salvar,
  onFechar
}) {
  const [novaApresentacao, setNovaApresentacao] = useState("");
  const [mostrarNovaApresentacao, setMostrarNovaApresentacao] = useState(false);

  const atualizarCampo = (campo, valor) => {
    let novoProduto = { ...produto, [campo]: valor };

    if (campo === "categoria") {
      let agrupamento = "";
      if (["Ração", "Aditivos", "Suplementos"].includes(valor)) agrupamento = "Cozinha";
      else if (["Detergentes", "Ácido", "Alcalino", "Sanitizante"].includes(valor)) agrupamento = "Higiene e Limpeza";
      else if (["Antibiótico", "Antiparasitário", "AINE", "AIE", "Hormônio", "Vitaminas"].includes(valor)) agrupamento = "Farmácia";
      else agrupamento = "Materiais Gerais";

      novoProduto.agrupamento = agrupamento;
      setMostrarHormonal(valor === "Hormônio");
      setMostrarAIEInfo(valor === "AIE");
      setMostrarCarencia(["Antibiótico", "Antiparasitário"].includes(valor));
      setMostrarPrincipioAtivo(["Antibiótico", "Antiparasitário"].includes(valor));
      setOpcoesApresentacao(apresentacoesPorCategoria[valor] || []);
    }
    setProduto(novoProduto);
  };

  const atualizarHormônio = (valor) => {
    let novoProduto = { ...produto, nomeHormônio: valor };
    setMostrarDoseDispositivo(valor === "Dispositivo de Progesterona");
    setProduto(novoProduto);
  };

  const handleSalvarNovaApresentacao = async () => {
    if (novaApresentacao.trim() !== "") {
      const atualizadas = [...opcoesApresentacao, novaApresentacao];
      setOpcoesApresentacao(atualizadas);
      await adicionarItem(`apresentacoes_${produto.categoria}`, atualizadas);
      setNovaApresentacao("");
      setMostrarNovaApresentacao(false);
      alert("✅ Apresentação incluída com sucesso!");
    }
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

  return (
    <div style={{ padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label>Nome Comercial</label>
          <input
            ref={(el) => (refs.current[0] = el)}
            value={produto.nomeComercial}
            onChange={(e) => atualizarCampo("nomeComercial", e.target.value)}
            onKeyDown={(e) => handleEnter(e, 0)}
            style={input()}
          />
        </div>

        <div>
          <label>Categoria</label>
          <Select
            options={categorias.map((c) => ({ value: c, label: c }))}
            value={produto.categoria ? { value: produto.categoria, label: produto.categoria } : null}
            onChange={(option) => atualizarCampo("categoria", option.value)}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Selecione..."
          />
        </div>

        {mostrarHormonal && (
          <div>
            <label>Nome do Hormônio</label>
            <Select
              options={hormonios.map((h) => ({ value: h, label: h }))}
              value={produto.nomeHormônio ? { value: produto.nomeHormônio, label: produto.nomeHormônio } : null}
              onChange={(option) => atualizarHormônio(option.value)}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Selecione..."
            />
          </div>
        )}

        {produto.nomeHormônio === "GnRH" && (
          <div>
            <label>Análogo</label>
            <Select
              options={analogosGnRH.map((a) => ({ value: a, label: a }))}
              value={produto.analogo ? { value: produto.analogo, label: produto.analogo } : null}
              onChange={(option) => atualizarCampo("analogo", option.value)}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Selecione..."
            />
          </div>
        )}

        {produto.categoria === "Hormônio" && produto.nomeHormônio === "Dispositivo de Progesterona" && (
          <div>
            <label>Dosagem do Dispositivo (g)</label>
            <input
              type="number"
              value={produto.doseDispositivo || ""}
              onChange={(e) => atualizarCampo("doseDispositivo", e.target.value)}
              style={input()}
            />
          </div>
        )}

        {mostrarAIEInfo && (
          <div style={{ gridColumn: "1 / -1", backgroundColor: "#fde68a", borderRadius: "0.5rem", padding: "0.6rem" }}>
            ⚠️ Atenção: O uso de AIE em vacas gestantes pode causar queda de leite e redução da imunidade.
          </div>
        )}

        {mostrarPrincipioAtivo && (
          <div style={{ gridColumn: "1 / -1" }}>
            <label>Princípio Ativo</label>
            <Select
              options={(produto.categoria === "Antibiótico" ? principiosAtivosAntibioticos : principiosAtivosAntiparasitarios).map((p) => ({ value: p, label: p }))}
              value={produto.principioAtivo ? { value: produto.principioAtivo, label: produto.principioAtivo } : null}
              onChange={(option) => atualizarCampo("principioAtivo", option.value)}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Selecione..."
            />
          </div>
        )}

        {mostrarCarencia && (
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label>Carência Leite (dias)</label>
              <input
                type="number"
                value={produto.carenciaLeite}
                onChange={(e) => atualizarCampo("carenciaLeite", e.target.value)}
                style={input()}
                disabled={semCarenciaLeite}
              />
              <label>
                <input
                  type="checkbox"
                  checked={semCarenciaLeite}
                  onChange={(e) => setSemCarenciaLeite(e.target.checked)}
                />{" "}
                Sem Carência
              </label>
            </div>
            <div style={{ flex: 1 }}>
              <label>Carência Carne (dias)</label>
              <input
                type="number"
                value={produto.carenciaCarne}
                onChange={(e) => atualizarCampo("carenciaCarne", e.target.value)}
                style={input()}
                disabled={semCarenciaCarne}
              />
              <label>
                <input
                  type="checkbox"
                  checked={semCarenciaCarne}
                  onChange={(e) => setSemCarenciaCarne(e.target.checked)}
                />{" "}
                Sem Carência
              </label>
            </div>
          </div>
        )}

        <div style={{ gridColumn: "1 / -1" }}>
          <label>Apresentação</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Select
              options={opcoesApresentacao.map((a) => ({ value: a, label: a }))}
              value={produto.apresentacao ? { value: produto.apresentacao, label: produto.apresentacao } : null}
              onChange={(option) => atualizarCampo("apresentacao", option.value)}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Selecione..."
            />
            <button
              onClick={() => setMostrarNovaApresentacao(!mostrarNovaApresentacao)}
              style={botaoAzul()}
            >
              +
            </button>
          </div>
          {mostrarNovaApresentacao && (
            <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                placeholder="Nova apresentação"
                value={novaApresentacao}
                onChange={(e) => setNovaApresentacao(e.target.value)}
                style={input()}
              />
              <button onClick={handleSalvarNovaApresentacao} style={botaoVerde()}>Salvar</button>
            </div>
          )}
        </div>

        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          <button onClick={onFechar} style={botaoCancelar}>Cancelar</button>
          <button onClick={salvar} style={botaoConfirmar}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

const input = () => ({ width: "100%", padding: "0.6rem", border: "1px solid #ccc", borderRadius: "0.4rem" });
const botaoAzul = () => ({ background: "#2563eb", color: "white", border: "none", borderRadius: "0.4rem", cursor: "pointer", fontWeight: "bold", width: "38px", height: "38px" });
const botaoVerde = () => ({ background: "#16a34a", color: "white", border: "none", borderRadius: "0.4rem", cursor: "pointer", fontWeight: "bold", padding: "0.4rem 0.8rem" });
const botaoCancelar = { background: "#f3f4f6", border: "1px solid #d1d5db", padding: "0.6rem 1.2rem", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "500" };
const botaoConfirmar = { background: "#2563eb", color: "white", border: "none", padding: "0.6rem 1.4rem", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "600" };
