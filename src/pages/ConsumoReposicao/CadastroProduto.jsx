import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";

export default function CadastroProduto({ onFechar, onSalvar }) {
  const [produto, setProduto] = useState({
    nomeComercial: "",
    categoria: "",
    unidade: "",
    quantidade: "",
    apresentacao: "",
    volume: "",
    validade: "",
    analogo: "",
    doseUsada: "",
    agrupamento: "",
    nomeHormônio: "",
    doseDispositivo: "",
    principiosAtivos: [],
    principioAtivo: "",
    carenciaLeite: "",
    carenciaCarne: "",
    valorUnitario: "",
    valorTotal: "" // ✅ NOVO CAMPO ADICIONADO
  });

  const [mostrarHormonal, setMostrarHormonal] = useState(false);
  const [mostrarAIEInfo, setMostrarAIEInfo] = useState(false);
  const [mostrarCarencia, setMostrarCarencia] = useState(false);
  const [mostrarPrincipioAtivo, setMostrarPrincipioAtivo] = useState(false);
  const [mostrarDoseDispositivo, setMostrarDoseDispositivo] = useState(false);
  const [opcoesApresentacao, setOpcoesApresentacao] = useState([]);
  const [novaApresentacao, setNovaApresentacao] = useState("");
  const [mostrarNovaApresentacao, setMostrarNovaApresentacao] = useState(false);
  const [principiosAtivos, setPrincipiosAtivos] = useState([""]); 
  const [semCarenciaLeite, setSemCarenciaLeite] = useState(false);
  const [semCarenciaCarne, setSemCarenciaCarne] = useState(false);
  const [semValidade, setSemValidade] = useState(false);
  const refs = useRef([]);

  const categorias = [
    "Ração", "Aditivos", "Suplementos", "Detergentes", "Ácido", "Alcalino",
    "Sanitizante", "Antibiótico", "Antiparasitário", "AINE", "AIE", "Hormônio",
    "Vitaminas", "Luvas", "Materiais Diversos"
  ];

  const hormonios = [
    "GnRH", "Prostaglandina", "eCG", "hCG", "Progesterona injetável",
    "Benzoato de estradiol", "Cipionato de estradiol", "Dispositivo de Progesterona"
  ];

  const analogosGnRH = ["Buserelina", "Gonadorelina", "Lecirelina", "Deslorelina"];
  const principiosAtivosAntibioticos = [
    "Penicilina", "Amoxicilina", "Cefalexina", "Enrofloxacina", "Florfenicol",
    "Ceftiofur", "Tulathromicina", "Outros"
  ];
  const principiosAtivosAntiparasitarios = [
    "Ivermectina", "Doramectina", "Eprinomectina", "Moxidectina",
    "Albendazol", "Levamisol", "Outros"
  ];
  const principiosAtivosAIE = [
    "Dexametasona",
    "Flumetasona",
    "Prednisolona",
    "Outros"
  ];
  const principiosAtivosAINE = [
    "Flunixina meglumina",
    "Meloxicam",
    "Carprofeno",
    "Outros"
  ];

  const apresentacoesPorCategoria = {
    "Ração": ["Saco 40kg", "BigBag", "A granel"],
    "Hormônio": ["Frasco", "Ampola", "Dispositivo"],
    "Aditivos": ["Saco", "Pote", "Envelope"],
    "Antibiótico": ["Frasco", "Ampola"],
    "Antiparasitário": ["Frasco", "Ampola"],
    "AINE": ["Frasco", "Ampola"],
    "AIE": ["Frasco", "Ampola"],
    "Vitaminas": ["Frasco", "Ampola"]
  };

  const unidades = ["kg", "litros", "mL", "unidade"];

  useEffect(() => {
    refs.current[0]?.focus();
    const esc = (e) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", esc);

    categorias.forEach((cat) => {
      const salvas = JSON.parse(localStorage.getItem(`apresentacoes_${cat}`) || "[]");
      if (salvas.length) {
        apresentacoesPorCategoria[cat] = [...new Set([...(apresentacoesPorCategoria[cat] || []), ...salvas])];
      }
    });

    return () => window.removeEventListener("keydown", esc);
  }, [onFechar]);

  const handleEnter = (e, index) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      refs.current[index + 1]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      refs.current[index - 1]?.focus();
    }
  };

  const atualizarCampo = (campo, valor) => {
    let novoProduto = { ...produto, [campo]: valor };

    if (campo === "quantidade") {
      const qt = parseFloat(valor);
      const total = parseFloat(produto.valorTotal);
      if (!isNaN(qt) && !isNaN(total)) {
        novoProduto.valorUnitario = (total / qt).toFixed(2);
      }
    } else if (campo === "valorTotal") {
      const qt = parseFloat(produto.quantidade);
      const total = parseFloat(valor);
      if (!isNaN(qt) && !isNaN(total)) {
        novoProduto.valorUnitario = (total / qt).toFixed(2);
      }
    } else if (campo === "valorUnitario") {
      const qt = parseFloat(produto.quantidade);
      const unit = parseFloat(valor);
      if (!isNaN(qt) && !isNaN(unit)) {
        novoProduto.valorTotal = (qt * unit).toFixed(2);
      }
    }

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
      setMostrarPrincipioAtivo(["Antibiótico", "Antiparasitário", "AIE", "AINE"].includes(valor));
      if (["Antibiótico", "Antiparasitário", "AIE", "AINE"].includes(valor)) {
        setPrincipiosAtivos([""]);
        novoProduto.principiosAtivos = [""];
        novoProduto.principioAtivo = "";
      }
      setOpcoesApresentacao(apresentacoesPorCategoria[valor] || []);
    }

    setProduto(novoProduto);
  };

  const atualizarHormônio = (valor) => {
    let novoProduto = { ...produto, nomeHormônio: valor };
    setMostrarDoseDispositivo(valor === "Dispositivo de Progesterona");
    setProduto(novoProduto);
  };

  const adicionarPrincipio = () => {
    const novos = [...principiosAtivos, ""];
    setPrincipiosAtivos(novos);
    setProduto({ ...produto, principiosAtivos: novos });
  };

  const removerPrincipio = (index) => {
    const novos = principiosAtivos.filter((_, i) => i !== index);
    setPrincipiosAtivos(novos);
    setProduto({
      ...produto,
      principiosAtivos: novos,
      principioAtivo: novos.filter(Boolean).join(", ")
    });
  };

  const atualizarPrincipio = (index, valor) => {
    const novos = [...principiosAtivos];
    novos[index] = valor;
    setPrincipiosAtivos(novos);
    setProduto({
      ...produto,
      principiosAtivos: novos,
      principioAtivo: novos.filter(Boolean).join(", ")
    });
  };

  const removerApresentacao = (valor) => {
    const atualizadas = opcoesApresentacao.filter((a) => a !== valor);
    setOpcoesApresentacao(atualizadas);
    const base = apresentacoesPorCategoria[produto.categoria] || [];
    const somenteCustom = atualizadas.filter((a) => !base.includes(a));
    localStorage.setItem(`apresentacoes_${produto.categoria}`, JSON.stringify(somenteCustom));
    if (produto.apresentacao === valor) atualizarCampo("apresentacao", "");
  };

  const salvar = () => {
    if (!produto.valorUnitario || !produto.quantidade) {
      alert("Preencha valor e quantidade para calcular corretamente.");
      return;
    }

    const listaPrincipios = principiosAtivos.filter(Boolean);

    const atualizado = {
      ...produto,
      principiosAtivos: [...listaPrincipios],
      principioAtivo: listaPrincipios.join(", ")
    };

    if (!atualizado.agrupamento && atualizado.categoria) {
      let agrupamento = "";
      if (["Ração", "Aditivos", "Suplementos"].includes(atualizado.categoria))
        agrupamento = "Cozinha";
      else if (
        ["Detergentes", "Ácido", "Alcalino", "Sanitizante"].includes(
          atualizado.categoria
        )
      )
        agrupamento = "Higiene e Limpeza";
      else if (
        [
          "Antibiótico",
          "Antiparasitário",
          "AINE",
          "AIE",
          "Hormônio",
          "Vitaminas"
        ].includes(atualizado.categoria)
      )
        agrupamento = "Farmácia";
      else agrupamento = "Materiais Gerais";
      atualizado.agrupamento = agrupamento;
    }

    const produtosExistentes = JSON.parse(localStorage.getItem("produtos") || "[]");
    const atualizados = [...produtosExistentes, atualizado];
    localStorage.setItem("produtos", JSON.stringify(atualizados));

    alert("✅ Produto '" + produto.nomeComercial + "' cadastrado com sucesso!");
    window.dispatchEvent(new Event("produtosAtualizados"));
    onSalvar(atualizado);
  };
  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>🛒 Cadastro de Produto</div>
        <div style={{ padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={grid}>
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
                ⚠️ Atenção: O uso de AIE (anti-inflamatórios esteroidais) em vacas gestantes pode causar queda de leite,
                redução da imunidade e outros efeitos colaterais. Utilize com cautela e somente sob prescrição veterinária.
              </div>
            )}

            {mostrarPrincipioAtivo && (
              <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label>Princípio Ativo</label>
                {principiosAtivos.map((pa, idx) => (
                  <div
                    key={idx}
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}
                  >
                    <div style={{ flex: 1, minWidth: "300px" }}>
                      <Select
                        options={
                          produto.categoria === "Antibiótico"
                            ? principiosAtivosAntibioticos.map((p) => ({ value: p, label: p }))
                            : produto.categoria === "Antiparasitário"
                            ? principiosAtivosAntiparasitarios.map((p) => ({ value: p, label: p }))
                            : produto.categoria === "AIE"
                            ? principiosAtivosAIE.map((p) => ({ value: p, label: p }))
                            : principiosAtivosAINE.map((p) => ({ value: p, label: p }))
                        }
                        value={pa ? { value: pa, label: pa } : null}
                        onChange={(option) => atualizarPrincipio(idx, option.value)}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Selecione..."
                      />
                    </div>
                    <button onClick={adicionarPrincipio} style={botaoAdicionar}>+</button>
                    {idx > 0 && (
                      <button onClick={() => removerPrincipio(idx)} style={botaoRemover}>x</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {mostrarCarencia && (
              <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <div style={{ flex: 1 }}>
                    <label>Carência Leite (dias)</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <input
                        type="number"
                        value={produto.carenciaLeite}
                        onChange={(e) => atualizarCampo("carenciaLeite", e.target.value)}
                        style={input()}
                        disabled={semCarenciaLeite}
                      />
                      <input
                        type="checkbox"
                        checked={semCarenciaLeite}
                        onChange={(e) => setSemCarenciaLeite(e.target.checked)}
                      />
                      <span>Sem Carência</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Carência Carne (dias)</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <input
                        type="number"
                        value={produto.carenciaCarne}
                        onChange={(e) => atualizarCampo("carenciaCarne", e.target.value)}
                        style={input()}
                        disabled={semCarenciaCarne}
                      />
                      <input
                        type="checkbox"
                        checked={semCarenciaCarne}
                        onChange={(e) => setSemCarenciaCarne(e.target.checked)}
                      />
                      <span>Sem Carência</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
              <div style={{ flex: 1 }}>
                <label>Apresentação</label>
                <Select
                  options={opcoesApresentacao.map((a) => ({ value: a, label: a }))}
                  value={produto.apresentacao ? { value: produto.apresentacao, label: produto.apresentacao } : null}
                  onChange={(option) => atualizarCampo("apresentacao", option.value)}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Selecione..."
                  isSearchable={false}
                />
              </div>
              <button
               onClick={() => setMostrarNovaApresentacao(!mostrarNovaApresentacao)}
                style={{ background: "#2563eb", color: "white", border: "none", padding: "0.4rem 0.8rem", borderRadius: "0.4rem", cursor: "pointer" }}
              >
                +
              </button>
            </div>
            {mostrarNovaApresentacao && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    placeholder="Nova apresentação"
                    value={novaApresentacao}
                    onChange={(e) => setNovaApresentacao(e.target.value)}
                    style={input()}
                  />
                  <button
                    onClick={() => {
                      if (novaApresentacao.trim() !== "") {
                        const atualizadas = [...opcoesApresentacao, novaApresentacao];
                        setOpcoesApresentacao(atualizadas);
                        localStorage.setItem(`apresentacoes_${produto.categoria}`, JSON.stringify(atualizadas.filter((a) => !(apresentacoesPorCategoria[produto.categoria] || []).includes(a))));
                        atualizarCampo("apresentacao", novaApresentacao);
                        setNovaApresentacao("");
                      }
                    }}
                    style={{ background: "#2563eb", color: "white", border: "none", padding: "0.4rem 0.8rem", borderRadius: "0.4rem", cursor: "pointer" }}
                  >
                    Salvar
                  </button>
                </div>
                {(() => {
                  const base = apresentacoesPorCategoria[produto.categoria] || [];
                  const custom = opcoesApresentacao.filter((a) => !base.includes(a));
                  return custom.length ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      {custom.map((ap, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span>{ap}</span>
                          <button onClick={() => removerApresentacao(ap)} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: "0.25rem", cursor: "pointer", padding: "0 0.4rem" }}>x</button>
                        </div>
                      ))}
                    </div>
                  ) : null;
                })()}
              </div>
            )}
            {["Antibiótico", "Antiparasitário", "Hormônio", "AINE", "Vitaminas"].includes(produto.categoria) && (
              <div>
                <label>Volume (mL ou L)</label>
                <input
                  type="number"
                  value={produto.volume || ""}
                  onChange={(e) => atualizarCampo("volume", e.target.value)}
                  style={input()}
                  placeholder="Ex: 50"
                />
              </div>
            )}

            <div>
              <label>Unidade</label>
              <Select
                options={unidades.map((u) => ({ value: u, label: u }))}
                value={produto.unidade ? { value: produto.unidade, label: produto.unidade } : null}
                onChange={(option) => atualizarCampo("unidade", option.value)}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Selecione..."
              />
            </div>

            <div>
              <label>Quantidade</label>
              <input
                ref={(el) => (refs.current[1] = el)}
                type="number"
                placeholder="Ex: 100"
                value={produto.quantidade}
                onChange={(e) => atualizarCampo("quantidade", e.target.value)}
                onKeyDown={(e) => handleEnter(e, 1)}
                style={input()}
              />
            </div>

            <div>
              <label>Validade</label>
              <input
                type="date"
                value={produto.validade}
                onChange={(e) => atualizarCampo("validade", e.target.value)}
                style={input()}
                disabled={semValidade}
              />
              <div style={{ display: "flex", alignItems: "center", marginTop: "0.5rem" }}>
                <input
                  type="checkbox"
                  checked={semValidade}
                  onChange={(e) => setSemValidade(e.target.checked)}
                />
                <span style={{ marginLeft: "0.5rem" }}>Sem Validade</span>
              </div>
            </div>

            <div>
              <label>Valor por Unidade (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 1.25"
                value={produto.valorUnitario}
                onChange={(e) => atualizarCampo("valorUnitario", e.target.value)}
                style={input()}
              />
            </div>

            <div>
              <label>Agrupamento</label>
              <input
                value={produto.agrupamento}
                readOnly
                style={{ ...input(true), backgroundColor: "#f3f4f6" }}
              />
            </div>
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

// 🎨 Estilos
const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999
};

const modal = {
  background: "#fff",
  borderRadius: "1rem",
  width: "650px",
  maxHeight: "90vh",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  fontFamily: "Poppins, sans-serif"
};

const header = {
  background: "#1e40af",
  color: "white",
  padding: "1rem 1.5rem",
  fontWeight: "bold",
  fontSize: "1.1rem",
  borderTopLeftRadius: "1rem",
  borderTopRightRadius: "1rem",
  textAlign: "center"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  columnGap: "1.5rem",
  rowGap: "1rem"
};

const input = (readOnly = false) => ({
  width: "100%",
  padding: "0.6rem",
  fontSize: "0.95rem",
  borderRadius: "0.5rem",
  border: "1px solid #ccc",
  backgroundColor: readOnly ? "#f3f4f6" : "#fff"
});

const botaoCancelar = {
  background: "#f3f4f6",
  border: "1px solid #d1d5db",
  padding: "0.6rem 1.2rem",
  borderRadius: "0.5rem",
  cursor: "pointer",
  fontWeight: "500"
};

const botaoConfirmar = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "0.6rem 1.4rem",
  borderRadius: "0.5rem",
  cursor: "pointer",
  fontWeight: "600"
};

const botaoAdicionar = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "0.4rem",
  cursor: "pointer",
  width: "38px",
  height: "38px"
};

const botaoRemover = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: "0.4rem",
  cursor: "pointer",
  padding: "0 0.6rem"
};