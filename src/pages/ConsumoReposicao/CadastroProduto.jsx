import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { inferirTipoUso } from "../../utils/verificarAlertaEstoque";
import { adicionarMovimentacao } from "../../utils/financeiro";
import {
  db,
  buscarTodos,
  adicionarItem,
} from "../../utils/db";

// Constantes fixas
const CATEGORIAS = [
  "Ração",
  "Aditivos",
  "Suplementos",
  "Detergentes",
  "Ácido",
  "Alcalino",
  "Sanitizante",
  "Antibiótico",
  "Antiparasitário",
  "AINE",
  "AIE",
  "Hormônio",
  "Vitaminas",
  "Luvas",
  "Materiais Diversos"
];

const HORMONIOS = [
  "GnRH",
  "Prostaglandina",
  "eCG",
  "hCG",
  "Progesterona injetável",
  "Benzoato de estradiol",
  "Cipionato de estradiol",
  "Dispositivo de Progesterona"
];

const ANALOGOS_GNRH = ["Buserelina", "Gonadorelina", "Lecirelina", "Deslorelina"];

const PRINCIPIOS_ATIVOS_ANTIBIOTICOS = [
  "Penicilina",
  "Amoxicilina",
  "Cefalexina",
  "Enrofloxacina",
  "Florfenicol",
  "Ceftiofur",
  "Tulathromicina",
  "Outros"
];

const PRINCIPIOS_ATIVOS_ANTIPARASITARIOS = [
  "Ivermectina",
  "Doramectina",
  "Eprinomectina",
  "Moxidectina",
  "Albendazol",
  "Levamisol",
  "Outros"
];

const PRINCIPIOS_ATIVOS_AIE = [
  "Dexametasona",
  "Flumetasona",
  "Prednisolona",
  "Outros"
];

const PRINCIPIOS_ATIVOS_AINE = [
  "Flunixina meglumina",
  "Meloxicam",
  "Carprofeno",
  "Outros"
];

const APRESENTACOES_POR_CATEGORIA = {
  Ração: ["Saco 40kg", "BigBag", "A granel"],
  Hormônio: ["Frasco", "Ampola", "Dispositivo"],
  Aditivos: ["Saco", "Pote", "Envelope"],
  Antibiótico: ["Frasco", "Ampola"],
  Antiparasitário: ["Frasco", "Ampola"],
  AINE: ["Frasco", "Ampola"],
  AIE: ["Frasco", "Ampola"],
  Vitaminas: ["Frasco", "Ampola"]
};

const UNIDADES = ["kg", "litros", "mL", "unidade"];

const OPCOES_NUMERO_USOS = [
  { value: 1, label: "1 uso" },
  { value: 2, label: "2 usos" },
  { value: 3, label: "3 usos" }
];

const obterAgrupamento = (categoria) => {
  if (["Ração", "Aditivos", "Suplementos"].includes(categoria)) return "Cozinha";
  if (["Detergentes", "Ácido", "Alcalino", "Sanitizante"].includes(categoria))
    return "Higiene e Limpeza";
  if (
    ["Antibiótico", "Antiparasitário", "AINE", "AIE", "Hormônio", "Vitaminas"].includes(
      categoria
    )
  )
    return "Farmácia";
  return "Materiais Gerais";
};

const calcularPrecos = (prod, campo) => {
  const qt = parseFloat(prod.quantidade);
  const total = parseFloat(prod.valorTotal);
  const unit = parseFloat(prod.valorUnitario);

  if (!isNaN(qt) && !isNaN(unit) && campo !== "valorTotal") {
    prod.valorTotal = (qt * unit).toFixed(2);
  }

  if (!isNaN(qt) && !isNaN(total) && campo !== "valorUnitario") {
    prod.valorUnitario = (total / qt).toFixed(2);
  }

  return prod;
};

export default function CadastroProduto({ onFechar, onSalvar }) {
  const [produto, setProduto] = useState({
    nomeComercial: "",
    categoria: "",
    tipoDeUso: "",
    unidade: "",
    quantidade: "",
    apresentacao: "",
    volume: "",
    volumeUnidade: "mL",
    validade: "",
    analogo: "",
    agrupamento: "",
    nomeHormônio: "",
    doseDispositivo: "",
    principiosAtivos: [],
    principioAtivo: "",
    carenciaLeite: "",
    carenciaCarne: "",
    valorUnitario: "",
    valorTotal: "", // ✅ NOVO CAMPO ADICIONADO
    numeroUsos: ""
  });

  const [mostrarHormonal, setMostrarHormonal] = useState(false);
  const [mostrarAIEInfo, setMostrarAIEInfo] = useState(false);
  const [mostrarCarencia, setMostrarCarencia] = useState(false);
  const [mostrarPrincipioAtivo, setMostrarPrincipioAtivo] = useState(false);
  const [opcoesApresentacao, setOpcoesApresentacao] = useState([]);
  const [novaApresentacao, setNovaApresentacao] = useState("");
  const [mostrarNovaApresentacao, setMostrarNovaApresentacao] = useState(false);
  const [principiosAtivos, setPrincipiosAtivos] = useState([""]); 
  const [semCarenciaLeite, setSemCarenciaLeite] = useState(false);
  const [semCarenciaCarne, setSemCarenciaCarne] = useState(false);
  const [semValidade, setSemValidade] = useState(false);
  const refs = useRef([]);


  useEffect(() => {
    refs.current[0]?.focus();
    const esc = (e) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", esc);

    (async () => {
      for (const cat of CATEGORIAS) {
        const salvas = await buscarTodos(`apresentacoes_${cat}`);
        if (salvas.length) {
          APRESENTACOES_POR_CATEGORIA[cat] = [
            ...new Set([
              ...(APRESENTACOES_POR_CATEGORIA[cat] || []),
              ...salvas,
            ])
          ];
        }
      }
    })();

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

    if (campo === "categoria") {
      const agrupamento = obterAgrupamento(valor);
      novoProduto.agrupamento = agrupamento;
      novoProduto.tipoDeUso = inferirTipoUso(valor);
      setMostrarHormonal(valor === "Hormônio");
      setMostrarAIEInfo(valor === "AIE");
      setMostrarCarencia(["Antibiótico", "Antiparasitário"].includes(valor));
      setMostrarPrincipioAtivo([
        "Antibiótico",
        "Antiparasitário",
        "AIE",
        "AINE"
      ].includes(valor));
      if (["Antibiótico", "Antiparasitário", "AIE", "AINE"].includes(valor)) {
        setPrincipiosAtivos([""]);
        novoProduto.principiosAtivos = [""];
        novoProduto.principioAtivo = "";
      }
      setOpcoesApresentacao(APRESENTACOES_POR_CATEGORIA[valor] || []);
    }

    novoProduto = calcularPrecos(novoProduto, campo);
    setProduto(novoProduto);
  };

  const atualizarHormônio = (valor) => {
    const novoProduto = { ...produto, nomeHormônio: valor };
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

  const removerApresentacao = async (valor) => {
    const atualizadas = opcoesApresentacao.filter((a) => a !== valor);
    setOpcoesApresentacao(atualizadas);
    const base = APRESENTACOES_POR_CATEGORIA[produto.categoria] || [];
    const somenteCustom = atualizadas.filter((a) => !base.includes(a));
    await adicionarItem(`apresentacoes_${produto.categoria}`, somenteCustom);
    if (produto.apresentacao === valor) atualizarCampo("apresentacao", "");
  };

  const salvar = async () => {
    let { quantidade, valorUnitario, valorTotal } = produto;
    const q = parseFloat(quantidade);
    const u = parseFloat(valorUnitario);
    const t = parseFloat(valorTotal);
    const nUsos = parseInt(produto.numeroUsos);

    if (!isNaN(q) && !isNaN(u) && isNaN(t)) {
      valorTotal = (q * u).toFixed(2);
    } else if (!isNaN(q) && !isNaN(t) && isNaN(u)) {
      valorUnitario = (t / q).toFixed(2);
    } else if (!isNaN(t) && !isNaN(u) && isNaN(q)) {
      quantidade = (t / u).toFixed(2);
    }

    if ([q, u, t].filter(v => !isNaN(v)).length < 2) {
      alert("Informe ao menos dois valores entre quantidade, valor total e valor unit\u00e1rio.");
      return;
    }

    if (produto.categoria === 'Hormônio' && produto.nomeHormônio === 'Dispositivo de Progesterona') {
      if (![1, 2, 3].includes(nUsos)) {
        alert('Informe o n\u00famero de usos permitidos (1, 2 ou 3).');
        return;
      }
    }

    const precisaPrincipio = [
      'Hormônio',
      'Antibiótico',
      'Antiparasitário',
      'AIE',
      'AINE'
    ].includes(produto.categoria);
    if (precisaPrincipio && !produto.principioAtivo && !produto.nomeHormônio) {
      alert('Informe o princípio ativo do produto.');
      return;
    }

    const listaPrincipios = principiosAtivos.filter(Boolean);

    const atualizado = {
      ...produto,
      quantidade,
      valorUnitario,
      valorTotal,
      principiosAtivos: [...listaPrincipios],
      principioAtivo: listaPrincipios.join(", "),
      numeroUsos: nUsos
    };

    if (atualizado.categoria === 'Hormônio' && atualizado.nomeHormônio) {
      atualizado.principioAtivo = atualizado.nomeHormônio;
    }

    if (!atualizado.tipoDeUso && atualizado.categoria) {
      atualizado.tipoDeUso = inferirTipoUso(atualizado.categoria);
    }

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

    const produtosExistentes = await buscarTodos("produtos");
    const atualizados = [...(produtosExistentes || []), atualizado];
    await adicionarItem("produtos", atualizados);

    const indireto = /(silagem|milho|feno)/i.test(
      `${atualizado.categoria} ${atualizado.nomeComercial}`
    );
    adicionarMovimentacao({
      data: new Date().toISOString().slice(0, 10),
      tipo: 'Saída',
      origem: 'estoque',
      categoria: atualizado.categoria,
      descricao: `Entrada de ${atualizado.quantidade} ${atualizado.unidade || ''} de ${atualizado.nomeComercial}`,
      valor: indireto ? 0 : parseFloat(String(atualizado.valorTotal).replace(/\./g, '').replace(',', '.')) || 0,
    });

    if (
      atualizado.categoria === 'Hormônio' &&
      atualizado.nomeHormônio === 'Dispositivo de Progesterona'
    ) {
      const implantes = await buscarTodos('implantes');
      const qtd = parseInt(atualizado.quantidade || 0);
      for (let i = 0; i < qtd; i++) {
        implantes.push({
          nomeComercial: atualizado.nomeComercial,
          principioAtivo: atualizado.nomeHormônio,
          uso: '1',
          usosRestantes: nUsos
        });
      }
      await adicionarItem('implantes', implantes);
    }

    alert("✅ Produto '" + produto.nomeComercial + "' cadastrado com sucesso!");
    window.dispatchEvent(new Event("produtosAtualizados"));
    window.dispatchEvent(new Event("estoqueAtualizado"));
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
                options={CATEGORIAS.map((c) => ({ value: c, label: c }))}
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
                  options={HORMONIOS.map((h) => ({ value: h, label: h }))}
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
                  options={ANALOGOS_GNRH.map((a) => ({ value: a, label: a }))}
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
                            ? PRINCIPIOS_ATIVOS_ANTIBIOTICOS.map((p) => ({ value: p, label: p }))
                            : produto.categoria === "Antiparasitário"
                            ? PRINCIPIOS_ATIVOS_ANTIPARASITARIOS.map((p) => ({ value: p, label: p }))
                            : produto.categoria === "AIE"
                            ? PRINCIPIOS_ATIVOS_AIE.map((p) => ({ value: p, label: p }))
                            : PRINCIPIOS_ATIVOS_AINE.map((p) => ({ value: p, label: p }))
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
                    onClick={async () => {
                      if (novaApresentacao.trim() !== "") {
                        const atualizadas = [...opcoesApresentacao, novaApresentacao];
                        setOpcoesApresentacao(atualizadas);
                        await adicionarItem(
                          `apresentacoes_${produto.categoria}`,
                          atualizadas.filter(
                            (a) => !(APRESENTACOES_POR_CATEGORIA[produto.categoria] || []).includes(a)
                          )
                        );
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
                  const base = APRESENTACOES_POR_CATEGORIA[produto.categoria] || [];
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
            {["Antibiótico", "Antiparasitário", "Hormônio", "AINE", "Vitaminas"].includes(produto.categoria) && !(produto.categoria === 'Hormônio' && produto.nomeHormônio === 'Dispositivo de Progesterona') && (
              <div>
                <label>Volume</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="number"
                    value={produto.volume || ""}
                    onChange={(e) => atualizarCampo("volume", e.target.value)}
                    style={{ ...input(), flex: 1 }}
                    placeholder="Ex: 50"
                  />
                  <select
                    value={produto.volumeUnidade}
                    onChange={(e) => atualizarCampo("volumeUnidade", e.target.value)}
                    style={{ ...input(), width: "90px" }}
                  >
                    <option value="mL">mL</option>
                    <option value="litros">litros</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label>Unidade</label>
              <Select
                options={UNIDADES.map((u) => ({ value: u, label: u }))}
                value={produto.unidade ? { value: produto.unidade, label: produto.unidade } : null}
                onChange={(option) => atualizarCampo("unidade", option.value)}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Selecione..."
              />
            </div>

            <div>
              <label>Quantidade ({produto.unidade || 'unidade'})</label>
              <input
                ref={(el) => (refs.current[1] = el)}
                type="number"
                placeholder={`Ex: 10 ${produto.unidade || ''}`}
                value={produto.quantidade}
                onChange={(e) => atualizarCampo("quantidade", e.target.value)}
                onKeyDown={(e) => handleEnter(e, 1)}
                style={input()}
              />
            </div>

            {produto.categoria === 'Hormônio' && produto.nomeHormônio === 'Dispositivo de Progesterona' && (
              <div>
                <label>Número de Usos Permitidos</label>
                <Select
                  options={OPCOES_NUMERO_USOS}
                  value={OPCOES_NUMERO_USOS.find((o) => o.value === produto.numeroUsos) || null}
                  onChange={(op) => atualizarCampo('numeroUsos', op.value)}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Selecione..."
                />
              </div>
            )}

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
              <label>Valor Unitário (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Informe ou será calculado"
                value={produto.valorUnitario}
                onChange={(e) => atualizarCampo("valorUnitario", e.target.value)}
                style={input()}
              />
            </div>

            <div>
              <label>Valor Total (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Informe ou será calculado"
                value={produto.valorTotal}
                onChange={(e) => atualizarCampo("valorTotal", e.target.value)}
                style={input()}
              />
            </div>

            <div style={{ gridColumn: "1 / -1", fontSize: "0.85rem", color: "#555" }}>
              Informe dois dos três campos de quantidade, valor unitário ou total. O restante será calculado automaticamente.
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
  width: "700px",
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