import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import FichaComplementarAnimal from "./FichaComplementarAnimal";
import { formatarDataDigitada } from "./utilsAnimais";
import { adicionarMovimentacao } from "../../utils/financeiro";
import {
  buscarRacasAdicionaisSQLite,
  inserirRacaAdicionalSQLite,
} from "../../utils/apiFuncoes.js";
import { salvarAnimais } from "../../sqlite/animais";

export default function CadastroBasicoAnimal({ animais, onAtualizar }) {
  const [numero, setNumero] = useState("");
  const [brinco, setBrinco] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [sexo, setSexo] = useState("");
  const [origem, setOrigem] = useState("propriedade");
  const [valorCompra, setValorCompra] = useState("");
  const [raca, setRaca] = useState("");
  const [novaRaca, setNovaRaca] = useState("");
  const [racasAdicionais, setRacasAdicionais] = useState([]);
  const [mostrarCampoNovaRaca, setMostrarCampoNovaRaca] = useState(false);
  const [mostrarComplementar, setMostrarComplementar] = useState(false);
  const [categoria, setCategoria] = useState("");
  const [idade, setIdade] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  const brincoRef = useRef();
  const nascimentoRef = useRef();
  const salvarRef = useRef();
  const refs = [brincoRef, nascimentoRef, salvarRef];

  useEffect(() => {
    const maiorNumero = animais.reduce((max, a) => Math.max(max, parseInt(a.numero || 0)), 0);
    setNumero((maiorNumero + 1).toString());
  }, [animais]);

  useEffect(() => {
    (async () => {
      try {
        const salvas = await buscarRacasAdicionaisSQLite();
        setRacasAdicionais(salvas || []);
      } catch (err) {
        console.error("Erro ao carregar raças:", err);
      }
    })();
  }, []);

  useEffect(() => {
    brincoRef.current?.focus();
  }, []);

  useEffect(() => {
    const esc = (e) => {
      if (e.key === "Escape") setMostrarComplementar(false);
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  useEffect(() => {
    if (nascimento.length === 10) {
      const [dia, mes, ano] = nascimento.split("/").map(Number);
      const nascDate = new Date(ano, mes - 1, dia);
      const hoje = new Date();
      const diff = hoje - nascDate;
      const meses = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
      setIdade(`${Math.floor(meses / 12)}a ${meses % 12}m`);
      if (meses < 2) setCategoria("Bezerro(a)");
      else if (meses < 12) setCategoria("Novilho(a)");
      else if (meses < 24) setCategoria(sexo === "macho" ? "Touro jovem" : "Novilha");
      else setCategoria(sexo === "macho" ? "Touro" : "Adulto(a)");
    } else {
      setIdade("");
      setCategoria("");
    }
  }, [nascimento, sexo]);

  const adicionarNovaRaca = async () => {
    if (novaRaca.trim() && !racasAdicionais.includes(novaRaca)) {
      const atualizadas = [...racasAdicionais, novaRaca];
      setRacasAdicionais(atualizadas);
      try {
        await inserirRacaAdicionalSQLite(novaRaca);
      } catch (err) {
        console.error("Erro ao salvar nova raça:", err);
      }
      setRaca(novaRaca);
      setNovaRaca("");
      setMostrarCampoNovaRaca(false);
    }
  };

  const salvarAnimal = async (complementares = {}) => {
    if (!brinco || !nascimento || !raca || !sexo) {
      alert("⚠️ Preencha os campos obrigatórios: Brinco, Nascimento, Sexo e Raça.");
      return;
    }

    const novo = {
      numero,
      brinco,
      nascimento,
      sexo,
      origem,
      valorCompra: origem === "comprado" ? valorCompra : "",
      raca,
      idade,
      categoria,
      criadoEm: new Date().toISOString(),
      status: 'ativo',
      statusReprodutivo: "pos-parto", // ✅ campo adicionado
      ultimaAcao: {
        tipo: "parto",
        data: nascimento // você pode ajustar para a data real do parto
      },
      proximaAcao: {
        tipo: "fim_pev",
        dataPrevista: "" // você pode calcular aqui se quiser
      },
      ...complementares,
    };

    try {
      const [inserido] = await salvarAnimais([novo]);
      if (!inserido || !inserido.id) {
        alert('⚠️ Não foi possível cadastrar. Verifique os dados.');
        return;
      }
      const atualizados = [...animais, inserido];
      onAtualizar(atualizados);
      window.dispatchEvent(new Event('animaisAtualizados'));
      setMensagemSucesso('✅ Animal cadastrado com sucesso!');
      setTimeout(() => setMensagemSucesso(''), 3000);
      setMensagemErro('');
    } catch (err) {
      console.error('Erro ao salvar animal:', err);
      alert('❌ Erro no cadastro. Tente novamente ou contate suporte.');
      setMensagemErro('❌ Erro ao cadastrar animal');
      return;
    }
    if (origem === "comprado") {
      const valorCorrigido =
        parseFloat(String(valorCompra).replace(/\./g, '').replace(',', '.')) || 0;
      adicionarMovimentacao({
        data: new Date().toISOString().slice(0, 10),
        tipo: 'Saída',
        categoria: 'Aquisição animal',
        descricao: `Compra da Vaca ${numero}`,
        valor: valorCorrigido,
        origem: 'animal',
        numeroAnimal: numero,
      });
    } else if (origem === "doacao") {
      adicionarMovimentacao({
        data: new Date().toISOString().slice(0, 10),
        tipo: 'Entrada',
        categoria: 'Doação animal',
        descricao: `Entrada doação da Vaca ${numero}`,
        valor: 0,
        origem: 'animal',
        numeroAnimal: numero,
      });
    }

    setBrinco("");
    setNascimento("");
    setSexo("");
    setOrigem("propriedade");
    setValorCompra("");
    setRaca("");
    setNovaRaca("");
    setIdade("");
    setCategoria("");
    setMostrarCampoNovaRaca(false);
    setMostrarComplementar(false);
  };

  const handleEnter = (e, index) => {
    if (e.key === "Enter") {
      const next = refs[index + 1];
      if (next?.current) next.current.focus();
    }
  };

  const sexoOptions = [
    { value: "femea", label: "Fêmea" },
    { value: "macho", label: "Macho" },
  ];

  const racaOptions = [
    { value: "Holandês", label: "Holandês" },
    { value: "Jersey", label: "Jersey" },
    { value: "Girolando", label: "Girolando" },
    ...racasAdicionais.map((r) => ({ value: r, label: r }))
  ];

  const origemOptions = [
    { value: "propriedade", label: "Nascido na propriedade" },
    { value: "comprado", label: "Comprado" },
    { value: "doacao", label: "Doação" },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: 'Poppins, sans-serif', padding: '0 1rem 1rem', marginTop: '-1rem' }}>
      <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
        {mensagemSucesso && (
          <div style={{
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #34d399',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ✅ {mensagemSucesso}
          </div>
        )}
        {mensagemErro && (
          <div style={{
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fca5a5',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ❌ {mensagemErro}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <label style={{ fontWeight: '600' }}>Número</label>
            <input type="text" value={numero} readOnly style={inputStyle(true)} />
          </div>
          <div>
            <label style={{ fontWeight: '600' }}>Brinco</label>
            <input
              type="text"
              value={brinco}
              ref={brincoRef}
              onChange={(e) => setBrinco(e.target.value)}
              onKeyDown={(e) => handleEnter(e, 0)}
              style={inputStyle()}
              placeholder="Digite o brinco"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          <div>
            <label style={{ fontWeight: '600' }}>Nascimento</label>
            <input
              type="text"
              value={nascimento}
              ref={nascimentoRef}
              onChange={(e) => setNascimento(formatarDataDigitada(e.target.value))}
              onKeyDown={(e) => handleEnter(e, 1)}
              placeholder="dd/mm/aaaa"
              style={inputStyle()}
            />
          </div>
          <div>
            <label style={{ fontWeight: '600' }}>Sexo</label>
            <Select
              options={sexoOptions}
              value={sexoOptions.find(opt => opt.value === sexo) || null}
              onChange={(e) => setSexo(e.value)}
              placeholder="Selecione"
            />
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <label style={{ fontWeight: '600' }}>Origem</label>
          <Select
            options={origemOptions}
            value={origemOptions.find(opt => opt.value === origem) || null}
            onChange={(e) => setOrigem(e.value)}
            placeholder="Selecione"
          />
          {origem === "comprado" && (
            <div style={{ marginTop: '1rem' }}>
              <label>Valor da compra (R$)</label>
              <input
                type="text"
                value={valorCompra}
                onChange={(e) => {
                  let valor = e.target.value.replace(/\D/g, "");
                  valor = (parseInt(valor || "0") / 100).toFixed(2);
                  valor = valor.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                  setValorCompra(valor);
                }}
                style={{ ...inputStyle(), width: '60%' }}
              />
            </div>
          )}
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem' }}>
          <div><strong>Categoria:</strong> {categoria || "—"}</div>
          <div><strong>Idade estimada:</strong> {idade || "—"}</div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <label style={{ fontWeight: '600' }}>Raça</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Select
              options={racaOptions}
              value={racaOptions.find(opt => opt.value === raca) || null}
              onChange={(e) => setRaca(e.value)}
              placeholder="Selecione"
              styles={{ container: (base) => ({ ...base, flex: 1 }) }}
            />
            <button onClick={() => setMostrarCampoNovaRaca(!mostrarCampoNovaRaca)} title="Adicionar nova raça" style={botaoVerde()}>＋</button>
          </div>
          {mostrarCampoNovaRaca && (
            <div style={{ marginTop: '0.8rem', display: 'flex', gap: '1rem' }}>
              <input
                type="text"
                value={novaRaca}
                onChange={(e) => setNovaRaca(e.target.value)}
                placeholder="Digite nova raça"
                style={{ ...inputStyle(), flex: 1 }}
              />
              <button onClick={adicionarNovaRaca} style={botaoVerde(true)}>Adicionar</button>
            </div>
          )}
        </div>

        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between' }}>
          {!mostrarComplementar && (
            <button onClick={() => salvarAnimal()} ref={salvarRef} style={botaoPrincipal()}>
              💾 Cadastrar Animal
            </button>
          )}
          <button onClick={() => setMostrarComplementar(true)} style={botaoSecundario()}>
            ➕ Completar Ficha
          </button>
        </div>
      </div>

      {mostrarComplementar && (
        <FichaComplementarAnimal
          numeroAnimal={numero}
          onSalvar={(dados) => salvarAnimal(dados)}
          onFechar={() => setMostrarComplementar(false)}
        />
      )}
    </div>
  );
}

// estilos
const inputStyle = (readOnly = false) => ({
  width: '100%',
  padding: '0.75rem',
  borderRadius: '0.5rem',
  border: '1px solid #ccc',
  fontSize: '1rem',
  backgroundColor: readOnly ? '#f1f5f9' : '#fff'
});

const botaoPrincipal = () => ({
  backgroundColor: '#2563eb',
  color: '#fff',
  border: 'none',
  padding: '0.75rem 2rem',
  borderRadius: '0.5rem',
  fontWeight: '600',
  fontSize: '1rem',
  cursor: 'pointer'
});

const botaoSecundario = () => ({
  backgroundColor: '#e0e7ff',
  color: '#1e3a8a',
  padding: '0.6rem 1.2rem',
  borderRadius: '0.5rem',
  border: '1px solid #c7d2fe',
  fontWeight: '500',
  cursor: 'pointer'
});

const botaoVerde = (compacto = false) => ({
  backgroundColor: '#10b981',
  color: '#fff',
  padding: compacto ? '0.6rem 1.2rem' : '0 1rem',
  borderRadius: '0.5rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  border: 'none'
});
