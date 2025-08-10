import React, { useEffect, useRef, useState } from "react";
import ModalFiltroLoteInteligente from "./ModalFiltroLoteInteligente";
import TabelaMedicaoLeite from "./TabelaMedicaoLeite";
import { calcularDEL } from "../Animais/utilsAnimais";
import { buscarTodos, adicionarItem } from "../../utils/apiFuncoes.js";
import { buscarTodosAnimais, salvarAnimais } from "../../api";

export default function ModalMedicaoLeite({ data, vacas, onFechar, onSalvar }) {
  const [tipoLancamento, setTipoLancamento] = useState("2");
  const [medicoes, setMedicoes] = useState({});
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  const [dataMedicao, setDataMedicao] = useState(data);
  const inputRefs = useRef({});
  const [colunaHover, setColunaHover] = useState(null);
  const [lotes, setLotes] = useState([]);

  // Carrega medição existente
  useEffect(() => {
   (async () => {
      const existente = (await buscarTodos("medicaoLeite")).find(
        (d) => d.id === dataMedicao
      );
      if (existente) {
        setTipoLancamento(existente.tipo || "2");
        setMedicoes(existente.dados || {});
      } else {
        setTipoLancamento("2");
        setMedicoes({});
      }
    })();

    const handleEsc = (e) => {
      if (e.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [dataMedicao, onFechar]);

  // Carrega lotes usados para lactação
  useEffect(() => {
    const carregarLotes = async () => {
      const armazenados = await buscarTodos("lotes");
      setLotes(
        armazenados
          .filter((l) => l.funcao === "Lactação")
          .map((l) => ({ ativo: true, ...l }))
      );
    };
    carregarLotes();
    window.addEventListener("lotesAtualizados", carregarLotes);
    return () => window.removeEventListener("lotesAtualizados", carregarLotes);
  }, []);

  const calcularTotal = ({ manha, tarde, terceira }) => {
    const m = parseFloat((manha || "0").replace(",", ".")) || 0;
    const t = parseFloat((tarde || "0").replace(",", ".")) || 0;
    const c = parseFloat((terceira || "0").replace(",", ".")) || 0;
    return tipoLancamento === "3" ? (m + t + c).toFixed(1) : (m + t).toFixed(1);
  };

  const handleChange = (numero, campo, valor) => {
    const numeroStr = String(numero);
    setMedicoes((prev) => {
      const anterior = prev[numeroStr] || {};
      const atualizado = { ...anterior, [campo]: valor };

      const manha = campo === "manha" ? valor : anterior.manha || "0";
      const tarde = campo === "tarde" ? valor : anterior.tarde || "0";
      const terceira = campo === "terceira" ? valor : anterior.terceira || "0";
      atualizado.total = calcularTotal({ manha, tarde, terceira });

      const vaca = vacas.find((v) => String(v.numero) === numeroStr);
      const del = calcularDEL(vaca?.ultimoParto || "");
      const totalNum = parseFloat((atualizado.total || "0").replace(",", ".")) || 0;

      const sugestao = (() => {
        if (totalNum >= 20 && del < 100)
          return { acao: "Manter", motivo: "Alta produção e início da lactação", lote: "Lote 1" };
        if (totalNum < 8 && del > 250)
          return { acao: "Secar", motivo: "Baixa produção e DEL avançado", lote: "Secar" };
        return { acao: "Mover", motivo: "Produção intermediária", lote: "Lote 2" };
      })();

      atualizado.loteSugerido = sugestao.lote;
      atualizado.motivoSugestao = sugestao.motivo;

      if (campo === "lote") atualizado.lote = valor;

      if (atualizado.lote && atualizado.lote === atualizado.loteSugerido) {
        atualizado.acaoSugerida = "Manter";
      } else if (atualizado.lote && atualizado.lote !== atualizado.loteSugerido) {
        atualizado.acaoSugerida = "Mover";
      } else {
        atualizado.acaoSugerida = sugestao.acao;
      }

      return { ...prev, [numeroStr]: atualizado };
    });
  };

  const salvar = async () => {
    const chave = `medicaoLeite_${dataMedicao}`;
    const medicoesComData = {};
    for (const numero in medicoes) {
      medicoesComData[numero] = { ...medicoes[numero], data: dataMedicao };
    }
    await adicionarItem("medicaoLeite", {
      id: dataMedicao,
      tipo: tipoLancamento,
      dados: medicoesComData,
    });

     const animais = await buscarTodosAnimais();
    const atualizados = animais.map((animal) => {
      const dados = medicoesComData[String(animal.numero)];
      if (!dados) return animal;

      const total = parseFloat((dados.total || "0").replace(",", ".")) || 0;
      const del = calcularDEL(animal.ultimoParto || "");

      const atualizado = {
        ...animal,
        lote: dados.lote || dados.loteSugerido || animal.lote,
        mediaLeite: total,
        del
      };

      if (!atualizado.leite) atualizado.leite = [];
      const indexExistente = atualizado.leite.findIndex(l => l.data === dataMedicao);
      const lancamento = {
        data: dataMedicao,
        litros: total,
        obs: dados.obs || "",
        lactacao: animal.lactacaoAtual || 1
      };

      if (indexExistente !== -1) {
        atualizado.leite[indexExistente] = lancamento;
      } else {
        atualizado.leite.push(lancamento);
      }

      return atualizado;
    });

    await salvarAnimais(atualizados);
    window.dispatchEvent(new Event("animaisAtualizados"));
    window.dispatchEvent(new Event("medicaoLeiteAtualizada"));

    if (typeof onSalvar === "function") onSalvar(medicoesComData);
    onFechar();
  };

  const aplicarSugestoes = (sugestoes) => {
    setMedicoes((prev) => {
      const atualizado = { ...prev };
      sugestoes.forEach((v) => {
        const num = String(v.numero);
        if (!atualizado[num]) atualizado[num] = {};
        atualizado[num].lote = v.lote;
      });
      return atualizado;
    });
    setMostrarFiltro(false);
  };

  const navegarComTeclado = (e, row, campo, ordemCampos, totalLinhas, refs) => {
    const index = ordemCampos.indexOf(campo);
    const flatIndex = row * ordemCampos.length + index;
    const totalInputs = totalLinhas * ordemCampos.length;

    let targetIndex = flatIndex;
    if (e.key === "ArrowDown" || e.key === "Enter") targetIndex += ordemCampos.length;
    else if (e.key === "ArrowUp") targetIndex -= ordemCampos.length;
    else if (e.key === "ArrowLeft") targetIndex -= 1;
    else if (e.key === "ArrowRight") targetIndex += 1;

    if (targetIndex >= 0 && targetIndex < totalInputs) {
      const r = Math.floor(targetIndex / ordemCampos.length);
      const c = ordemCampos[targetIndex % ordemCampos.length];
      refs.current[`${r}-${c}`]?.focus();
    }
  };

  const handleKeyDown = (e, row, campo) => {
    const ordem = ["manha", "tarde", "terceira"].filter(
      (c) => tipoLancamento !== "total" && (tipoLancamento === "3" || c !== "terceira")
    );
    navegarComTeclado(e, row, campo, ordem, vacas.length, inputRefs);
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>
          🥛 Registro da Coleta de Leite — {new Date(dataMedicao).toLocaleDateString("pt-BR")}
          <button onClick={() => setMostrarFiltro(true)} style={botaoClaro}>⚙️ Sugerir Lotes</button>
        </div>

        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={gridCompacto}>
            <div>
              <label>Data da Medição</label>
              <input
                type="date"
                value={dataMedicao}
                onChange={(e) => setDataMedicao(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && onFechar()}
                style={input()}
              />
            </div>

            <div>
              <label>Tipo de Lançamento</label>
              <select
                value={tipoLancamento}
                onChange={(e) => setTipoLancamento(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && onFechar()}
                style={input()}
              >
                <option value="total">Somente Total</option>
                <option value="2">2 Ordenhas</option>
                <option value="3">3 Ordenhas</option>
              </select>
            </div>
          </div>

          <TabelaMedicaoLeite
            vacas={vacas}
            medicoes={medicoes}
            tipoLancamento={tipoLancamento}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            inputRefs={inputRefs}
            colunaHover={colunaHover}
            setColunaHover={setColunaHover}
            calcularDEL={calcularDEL}
            lotes={lotes}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
            <button onClick={onFechar} style={botaoCancelar}>Cancelar</button>
            <button onClick={salvar} style={botaoConfirmar}>📂 Salvar Medições</button>
          </div>
        </div>

        {mostrarFiltro && (
          <ModalFiltroLoteInteligente
            onFechar={() => setMostrarFiltro(false)}
            onAplicar={aplicarSugestoes}
          />
        )}
      </div>
    </div>
  );
}

// Estilos
const overlay = { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 };
const modal = { background: "#fff", borderRadius: "1rem", width: "1300px", maxWidth: "95vw", maxHeight: "95vh", overflowY: "auto", fontFamily: "Poppins, sans-serif", boxShadow: "0 0 20px rgba(0,0,0,0.15)" };
const header = { background: "#1e3a8a", color: "white", padding: "1rem 1.5rem", fontWeight: "bold", fontSize: "1.1rem", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" };
const gridCompacto = { display: "grid", gridTemplateColumns: "240px 240px", gap: "2rem" };
const input = () => ({ width: "100%", padding: "0.75rem", fontSize: "0.95rem", borderRadius: "0.6rem", border: "1px solid #ccc" });
const botaoClaro = { background: "#f3f4f6", border: "1px solid #cbd5e1", padding: "0.5rem 1rem", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.95rem" };
const botaoCancelar = { background: "#f3f4f6", border: "1px solid #d1d5db", padding: "0.6rem 1.2rem", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "500" };
const botaoConfirmar = { background: "#2563eb", color: "#fff", border: "none", padding: "0.6rem 1.4rem", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "600" };
