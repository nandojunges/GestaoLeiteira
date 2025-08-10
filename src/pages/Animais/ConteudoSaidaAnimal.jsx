import React, { useEffect, useState } from "react";
import Select from "react-select";
import { buscarTodosAnimais } from "../../api";
import { atualizarItem } from "../../utils/backendApi";
import { registrarMovimentoFinanceiro } from "../../utils/financeiro";

export default function ConteudoSaidaAnimal({ onAtualizar }) {
  const [animais, setAnimais] = useState([]);
  const [animalDigitado, setAnimalDigitado] = useState("");
  const [animalSelecionado, setAnimalSelecionado] = useState(null);
  const [tipo, setTipo] = useState("");
  const [motivo, setMotivo] = useState("");
  const [data, setData] = useState("");
  const [observacao, setObservacao] = useState("");
  const [valorDoacao, setValorDoacao] = useState("");
  const [erros, setErros] = useState({});
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  useEffect(() => {
    const carregar = async () => {
       const dados = await buscarTodosAnimais();
      setAnimais(Array.isArray(dados) ? dados : []);
    };
    carregar();
  }, []);

  const motivosVenda = [
    "Baixa produção", "Problemas reprodutivos", "Problemas de casco",
    "Excesso de animais", "Venda para outro produtor", "Renovação genética",
    "Problemas de temperamento", "Troca de categoria"
  ];
  const motivosMorte = [
    "Doença grave", "Acidente", "Problemas no parto", "Mastite grave",
    "Senilidade", "Infecção generalizada", "Problema respiratório",
    "Morte súbita", "Outras causas"
  ];

  const motivoOptions = (tipoSaida) => {
    const lista = tipoSaida === "venda" ? motivosVenda : tipoSaida === "morte" ? motivosMorte : [];
    return lista.map((m) => ({ value: m, label: m }));
  };

  const tipoOptions = [
    { value: "venda", label: "💰 Venda" },
    { value: "morte", label: "☠️ Morte" },
    { value: "doacao", label: "🎁 Doação" },
  ];

  const formatarData = (valor) => {
    const limpo = valor.replace(/\D/g, "").slice(0, 8);
    const dia = limpo.slice(0, 2);
    const mes = limpo.slice(2, 4);
    const ano = limpo.slice(4, 8);
    return [dia, mes, ano].filter(Boolean).join("/");
  };

  const formatarValor = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, "");
    const numero = parseFloat(apenasNumeros) / 100;
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2
    });
  };

  const limparCampos = () => {
    setAnimalDigitado("");
    setAnimalSelecionado(null);
    setTipo("");
    setMotivo("");
    setData("");
    setObservacao("");
    setValorDoacao("");
    setErros({});
  };

  const validar = () => {
    const err = {};
    if (!animalSelecionado) err.animal = "Selecione um animal válido.";
    if (!tipo) err.tipo = "Obrigatório.";
    if (!motivo) err.motivo = "Obrigatório.";
    if (data.length !== 10) err.data = "Data inválida.";
    if (tipo === "venda" && !valorDoacao) err.valorDoacao = "Informe o valor da venda.";
    setErros(err);
    return Object.keys(err).length === 0;
  };

  const registrarSaida = async () => {
    if (!validar()) return;

    const numeroInt = parseInt(animalDigitado || animalSelecionado?.numero);
    const animal = animais.find((a) => a.numero === numeroInt);

    if (!animal || !animal.id) {
      alert("Animal não encontrado ou sem ID.");
      return;
    }

    const novaSaida = {
      tipo,
      motivo,
      data,
      observacao,
      valor: tipo === "venda" ? valorDoacao : undefined,
      dataISO: new Date().toISOString(),
      idSaida: Date.now(),
    };

    const dadosAtualizados = {
      ...animal,
      status: "inativo",
      saida: novaSaida,
      motivoSaida: novaSaida.motivo,
      dataSaida: novaSaida.data,
      valorVenda: novaSaida.valor,
      observacoesSaida: novaSaida.observacao,
      // envia também o tipo de saída selecionado
      tipoSaida: novaSaida.tipo,
    };

    await atualizarItem("animais", { ...dadosAtualizados, id: animal.id });

    const novaLista = animais.map((a) =>
      a.id === animal.id ? dadosAtualizados : a
    );

    setAnimais(novaLista);

    if (tipo === 'venda') {
      const valorNumerico =
        parseFloat(
          String(valorDoacao)
            .replace(/[^0-9,]/g, '')
            .replace(/\./g, '')
            .replace(',', '.')
        ) || 0;

      await registrarMovimentoFinanceiro({
        data: data.split('/').reverse().join('-'),
        tipo: 'Entrada',
        categoria: 'Venda animal',
        descricao: `Venda da vaca ${animalSelecionado.numero}`,
        valor: valorNumerico,
        origem: 'animal',
        numeroAnimal: animalSelecionado.numero,
      });
    }

    window.dispatchEvent(new Event("animaisAtualizados"));
    setMensagemSucesso("✅ Saída registrada com sucesso!");
    setTimeout(() => setMensagemSucesso(""), 3000);
    limparCampos();
    onAtualizar?.(novaLista);
  };

  const opcoesAnimais = animais
    .filter(a => a.status !== "inativo")
    .map(a => ({
      value: a.numero,
      label: `${a.numero} – Brinco ${a.brinco || "—"}`
    }));

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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <label style={{ fontWeight: '600' }}>Animal</label>
            <Select
              options={opcoesAnimais}
              value={opcoesAnimais.find(opt => opt.value === animalDigitado) || null}
              onChange={(e) => {
                setAnimalDigitado(e.value);
                const encontrado = animais.find(
                  (a) => String(a.numero) === String(e.value)
                );
                setAnimalSelecionado(encontrado || null);
              }}
              placeholder="Digite o número ou brinco"
            />
            {erros.animal && <div style={erroStyle}>{erros.animal}</div>}
          </div>

          <div>
            <label style={{ fontWeight: '600' }}>Tipo de saída</label>
            <Select
              options={tipoOptions}
              value={tipoOptions.find(opt => opt.value === tipo) || null}
              onChange={(e) => {
                setTipo(e.value);
                setMotivo("");
              }}
              placeholder="Selecione o tipo"
            />
            {erros.tipo && <div style={erroStyle}>{erros.tipo}</div>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          <div>
            <label style={{ fontWeight: '600' }}>Motivo</label>
            <Select
              options={motivoOptions(tipo)}
              value={motivoOptions(tipo).find(opt => opt.value === motivo) || null}
              onChange={(e) => setMotivo(e.value)}
              placeholder="Selecione o motivo"
              isDisabled={!tipo}
            />
            {erros.motivo && <div style={erroStyle}>{erros.motivo}</div>}
          </div>
          <div>
            <label style={{ fontWeight: '600' }}>Data</label>
            <input
              type="text"
              value={data}
              onChange={(e) => setData(formatarData(e.target.value))}
              placeholder="dd/mm/aaaa"
              style={inputStyle(false)}
            />
            {erros.data && <div style={erroStyle}>{erros.data}</div>}
          </div>
        </div>

        {tipo === "venda" && (
          <div style={{ marginTop: '2rem' }}>
            <label style={{ fontWeight: '600' }}>Valor da venda (R$)</label>
            <input
              type="text"
              value={valorDoacao}
              onChange={(e) => setValorDoacao(formatarValor(e.target.value))}
              placeholder="Digite o valor da venda"
              style={inputStyle(false)}
            />
            {erros.valorDoacao && <div style={erroStyle}>{erros.valorDoacao}</div>}
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          <label style={{ fontWeight: '600' }}>Observações</label>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Opcional"
            style={{ ...inputStyle(false), height: '80px', resize: 'vertical' }}
          />
        </div>

        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-start' }}>
          <button onClick={registrarSaida} style={botaoPrincipal()}>
            💾 Registrar Saída
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = (readOnly = false) => ({
  width: '100%',
  padding: '0.75rem',
  borderRadius: '0.5rem',
  border: '1px solid #ccc',
  fontSize: '1rem',
  backgroundColor: readOnly ? '#f1f5f9' : '#fff'
});

const erroStyle = {
  color: '#dc2626',
  fontSize: '0.85rem',
  marginTop: '0.25rem'
};

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
