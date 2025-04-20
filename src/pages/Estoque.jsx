import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('kg');
  const [valor, setValor] = useState('');
  const [validade, setValidade] = useState('');
  const [usarTotal, setUsarTotal] = useState(false);
  const [validadeTemp, setValidadeTemp] = useState({});

  useEffect(() => {
    const armazenado = localStorage.getItem('estoque');
    if (armazenado) {
      setProdutos(JSON.parse(armazenado));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('estoque', JSON.stringify(produtos));
  }, [produtos]);

  const adicionarProduto = () => {
    if (!nome || !quantidade || !valor) return;
    const qtd = parseFloat(quantidade);
    const val = parseFloat(valor);
    const precoUnitario = usarTotal ? (val / qtd) : val;

    const novo = {
      id: Date.now(),
      nome,
      quantidade: qtd,
      unidade,
      precoUnitario,
      validade
    };

    setProdutos([...produtos, novo]);
    setNome('');
    setQuantidade('');
    setUnidade('kg');
    setValor('');
    setValidade('');
  };

  const alterarQuantidade = (id, delta) => {
    setProdutos(produtos.map(p =>
      p.id === id ? { ...p, quantidade: Math.max(0, p.quantidade + delta) } : p
    ));
  };

  const removerProduto = (id) => {
    if (window.confirm("Tem certeza que deseja remover este item?")) {
      setProdutos(produtos.filter(p => p.id !== id));
    }
  };

  const salvarValidade = (id) => {
    if (!validadeTemp[id]) return;
    setProdutos(produtos.map(p =>
      p.id === id ? { ...p, validade: validadeTemp[id] } : p
    ));
    setValidadeTemp({ ...validadeTemp, [id]: '' });
  };

  const totalEstoque = produtos.reduce((acc, p) => acc + (p.quantidade * p.precoUnitario), 0);

  const exportarParaExcel = () => {
    const data = produtos.map(p => ({
      Produto: p.nome,
      Quantidade: p.quantidade,
      Unidade: p.unidade,
      'Preço Unitário (R$)': p.precoUnitario.toFixed(2),
      'Valor Total (R$)': (p.quantidade * p.precoUnitario).toFixed(2),
      Validade: p.validade || 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Estoque");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "estoque_leiteiro.xlsx");
  };

  const diasParaVencimento = (dataValidade) => {
    const hoje = new Date();
    const vencimento = new Date(dataValidade);
    const diff = vencimento - hoje;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div style={{
      fontFamily: 'Poppins, sans-serif',
      backgroundColor: '#f9fafb',
      minHeight: '100vh',
      paddingTop: '4rem',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '1rem',
        padding: '2rem',
        width: '100%',
        maxWidth: '800px',
        boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', textAlign: 'center', color: '#1f2937', marginBottom: '1.5rem' }}>
          📦 Controle de Estoque
        </h2>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <input type="text" placeholder="Produto" value={nome} onChange={e => setNome(e.target.value)}
            style={{ flex: 2, padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }} />
          <input type="number" placeholder="Qtd" value={quantidade} onChange={e => setQuantidade(e.target.value)}
            style={{ width: '80px', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }} />
          <select value={unidade} onChange={e => setUnidade(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="L">litros</option>
            <option value="mL">mL</option>
            <option value="un">un</option>
          </select>
          <input type="number" placeholder={usarTotal ? "Preço total" : "Preço unitário"} value={valor} onChange={e => setValor(e.target.value)}
            style={{ width: '130px', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }} />
          <button onClick={() => setUsarTotal(!usarTotal)}
            style={{ padding: '0.5rem', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}>
            {usarTotal ? '💰 Total' : '💵 Unitário'}
          </button>
          <input type="date" value={validade} onChange={e => setValidade(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }} />
          <button onClick={adicionarProduto}
            style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.375rem', padding: '0.5rem 1rem', fontWeight: '600', cursor: 'pointer' }}>
            Adicionar
          </button>
        </div>

        <button onClick={exportarParaExcel} style={{
          backgroundColor: '#22c55e',
          color: '#fff',
          fontWeight: '600',
          padding: '0.5rem 1rem',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          display: 'block',
          margin: '0 auto 2rem auto'
        }}>
          📥 Exportar para Excel
        </button>

        {produtos.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>Nenhum produto cadastrado.</p>
        ) : (
          <>
            {produtos.map((p, i) => {
              const total = p.quantidade * p.precoUnitario;
              const dias = p.validade ? diasParaVencimento(p.validade) : null;
              const alertaValidade = dias !== null ? (
                dias <= 0 ? '❗ VENCIDO'
                : dias <= 10 ? `⚠️ Vence em ${dias} dias`
                : null
              ) : null;

              return (
                <div key={p.id} style={{
                  backgroundColor: p.quantidade < 5 ? '#fef2f2' : '#f1f5f9',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <div style={{ fontWeight: '600', color: '#111827' }}>
                    {p.nome} — {p.quantidade} {p.unidade}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#374151' }}>
                    💰 Unitário: R$ {p.precoUnitario.toFixed(2)} — Total: R$ {total.toFixed(2)}
                    {p.validade && (
                      <div>📆 Validade: {p.validade} {alertaValidade && <strong>— {alertaValidade}</strong>}</div>
                    )}
                    <div>
                      <label>
                        📅 Ajustar validade:
                        <input
                          type="date"
                          value={validadeTemp[p.id] || ''}
                          onChange={(e) => setValidadeTemp({ ...validadeTemp, [p.id]: e.target.value })}
                          style={{ marginLeft: '0.5rem', padding: '0.2rem' }}
                        />
                        <button onClick={() => salvarValidade(p.id)} style={{ marginLeft: '0.5rem', padding: '0.2rem 0.5rem', borderRadius: '0.375rem', backgroundColor: '#d1d5db', border: 'none' }}>Salvar</button>
                      </label>
                    </div>
                  </div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => alterarQuantidade(p.id, -1)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '0.375rem', cursor: 'pointer' }}>−</button>
                    <button onClick={() => alterarQuantidade(p.id, 1)} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '0.375rem', cursor: 'pointer' }}>+</button>
                    <button onClick={() => removerProduto(p.id)} style={{ backgroundColor: '#d1d5db', color: '#111827', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '0.375rem', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              );
            })}
            <div style={{
              marginTop: '2rem',
              textAlign: 'right',
              fontWeight: '700',
              fontSize: '1.1rem'
            }}>
              🧾 Total do Estoque: R$ {totalEstoque.toFixed(2)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Estoque;