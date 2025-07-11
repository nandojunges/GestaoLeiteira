import { useState } from 'react';
import { utils, writeFile } from 'xlsx';
import Select from 'react-select';
import ModalNovoLancamento from './ModalNovoLancamento';
import TabelaLivroCaixa from './TabelaLivroCaixa';
import ResumoFinanceiro from './ResumoFinanceiro';
import '../../styles/painelFinanceiro.css';

export default function LivroCaixa({ movs = [] }) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [filtro, setFiltro] = useState({ periodo:'', categoria: [], tipo: null, forma: [], });
  const [abaInterna, setAbaInterna] = useState('despesas');

  const listaSegura = Array.isArray(movs) ? movs : [];
  if (!listaSegura.length) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
        Nenhum lançamento disponível.
      </div>
    );
  }
  const categorias = Array.from(new Set(listaSegura.map(m => m.categoria).filter(Boolean)));
  const formas = Array.from(new Set(listaSegura.map(m => m.formaPagamento).filter(Boolean)));
  const opcoesCategoria = categorias.map(c => ({ value: c, label: c }));
  const opcoesForma = formas.map(f => ({ value: f, label: f }));
  const opcoesTipo = [
    { value: 'Entrada', label: 'Entrada' },
    { value: 'Saída', label: 'Saída' },
  ];

  const aplicarFiltros = lista => {
    return lista.filter(m => {
      if (filtro.periodo && !m.data.startsWith(filtro.periodo)) return false;
      if (filtro.categoria.length && !filtro.categoria.some(c => c.value === m.categoria)) return false;
      if (filtro.tipo && m.tipo !== filtro.tipo.value) return false;
      if (filtro.forma.length && !filtro.forma.some(f => f.value === m.formaPagamento)) return false;
      return true;
    });
  };

  const filtrados = aplicarFiltros(listaSegura);

  const dadosAba = abaInterna === 'despesas'
    ? filtrados.filter(m => m.tipo === 'Saída')
    : filtrados.filter(m => m.tipo === 'Entrada');

  const exportarExcel = () => {
    const ws = utils.json_to_sheet(filtrados);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'LivroCaixa');
    writeFile(wb, 'livro_caixa.xlsx');
  };

  const estiloBotao = (aba) => ({
    backgroundColor: abaInterna === aba ? '#7c4dff' : '#fff',
    color: abaInterna === aba ? '#fff' : '#000',
    border: abaInterna === aba ? '1px solid #7c4dff' : '1px solid #ccc',
    borderRadius: '0.5rem',
    padding: '0.5rem 1.4rem',
    fontWeight: abaInterna === aba ? 'bold' : 'normal',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
  });

  return (
    <div className="w-full max-w-[1200px] mx-auto p-4 space-y-6 font-poppins relative">
      <h1 className="text-3xl font-semibold text-center text-gray-700">📘 Livro Caixa</h1>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => setAbaInterna('despesas')} style={estiloBotao('despesas')}>
          🧾 <span>Despesas</span>
        </button>
        <button onClick={() => setAbaInterna('receitas')} style={estiloBotao('receitas')}>
          💵 <span>Receitas</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-end justify-between bg-white p-4 rounded-xl shadow">
        <div className="flex flex-wrap gap-4">
          <div className="campo-filtro">
            <label>Período</label>
            <input type="month" value={filtro.periodo} onChange={e=>setFiltro(f=>({...f,periodo:e.target.value}))} />
          </div>
          <div className="campo-filtro-select" style={{minWidth:'160px'}}>
            <label>Categoria</label>
            <Select options={opcoesCategoria} value={filtro.categoria} onChange={op=>setFiltro(f=>({...f,categoria:op||[]}))} classNamePrefix="react-select" isMulti placeholder="Todas" />
          </div>
          <div className="campo-filtro-select" style={{minWidth:'140px'}}>
            <label>Tipo</label>
            <Select options={opcoesTipo} value={filtro.tipo} onChange={op=>setFiltro(f=>({...f,tipo:op}))} classNamePrefix="react-select" isClearable placeholder="Todos" />
          </div>
          <div className="campo-filtro-select" style={{minWidth:'160px'}}>
            <label>Forma</label>
            <Select options={opcoesForma} value={filtro.forma} onChange={op=>setFiltro(f=>({...f,forma:op||[]}))} classNamePrefix="react-select" isMulti placeholder="Todas" />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={exportarExcel} className="botao-acao pequeno">📥 Exportar</button>
          <button onClick={()=>{}} className="botao-acao pequeno">🔍 Filtrar</button>
        </div>
      </div>

      <TabelaLivroCaixa dados={dadosAba} />

      <ResumoFinanceiro movs={dadosAba} />

      {mostrarModal && (
        <ModalNovoLancamento onFechar={() => setMostrarModal(false)} categorias={categorias} />
      )}

      <button
        onClick={() => setMostrarModal(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full shadow flex items-center gap-2"
      >
        <span>➕</span> Novo Lançamento
      </button>
    </div>
  );
}
