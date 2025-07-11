import { useState } from 'react';
import { utils, writeFile } from 'xlsx';
import Select from 'react-select';
import ModalNovoLancamento from './ModalNovoLancamento';
import TabelaLivroCaixa from './TabelaLivroCaixa';
import ResumoFinanceiro from './ResumoFinanceiro';
import ResumoRapido from './ResumoRapido';
import '../../styles/painelFinanceiro.css';
import '../../styles/filtros.css';

export default function LivroCaixa({ movs = [] }) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [filtro, setFiltro] = useState({
    busca: '',
    dataInicio: '',
    dataFim: '',
    categoria: null,
    tipo: null,
    forma: null,
    centro: null,
  });


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
  const centros = Array.from(new Set(listaSegura.map(m => m.centroCusto).filter(Boolean)));
  const opcoesCategoria = categorias.map(c => ({ value: c, label: c }));
  const opcoesForma = formas.map(f => ({ value: f, label: f }));
  const opcoesCentro = centros.map(c => ({ value: c, label: c }));
  const opcoesTipo = [
    { value: 'Entrada', label: 'Entrada' },
    { value: 'Saída', label: 'Saída' },
  ];

  const aplicarPeriodo = (dias) => {
    const fim = new Date();
    const inicio = new Date();
    if (dias === 0) {
      inicio.setDate(1);
    } else if (dias < 0) {
      inicio.setMonth(inicio.getMonth() - 1, 1);
      fim.setDate(0);
    } else {
      inicio.setDate(fim.getDate() - dias + 1);
    }
    setFiltro(f => ({
      ...f,
      dataInicio: inicio.toISOString().slice(0, 10),
      dataFim: fim.toISOString().slice(0, 10),
    }));
  };

  const aplicarFiltros = lista => {
    return lista.filter(m => {
      if (filtro.dataInicio && m.data < filtro.dataInicio) return false;
      if (filtro.dataFim && m.data > filtro.dataFim) return false;
      if (filtro.busca && !m.descricao.toLowerCase().includes(filtro.busca.toLowerCase())) return false;
      if (filtro.categoria && m.categoria !== filtro.categoria.value) return false;
      if (filtro.tipo && m.tipo !== filtro.tipo.value) return false;
      if (filtro.forma && m.formaPagamento !== filtro.forma.value) return false;
      if (filtro.centro && m.centroCusto !== filtro.centro.value) return false;
      return true;
    });
  };

  const filtrados = aplicarFiltros(listaSegura);

  const exportarExcel = () => {
    const ws = utils.json_to_sheet(filtrados);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'LivroCaixa');
    writeFile(wb, 'livro_caixa.xlsx');
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto p-4 space-y-6 font-poppins relative">
      <h1 className="text-3xl font-semibold text-center text-gray-700">📘 Livro Caixa</h1>

      <div className="space-y-4">
        <div className="filtros-rapidos justify-center">
          <button onClick={() => aplicarPeriodo(1)}>📅 Hoje</button>
          <button onClick={() => aplicarPeriodo(7)}>Últimos 7 dias</button>
          <button onClick={() => aplicarPeriodo(0)}>Este mês</button>
          <button onClick={() => aplicarPeriodo(-1)}>Mês anterior</button>
        </div>
        <div className="filtros-horizontal justify-center">
          <input
            type="text"
            placeholder="Buscar descrição"
            value={filtro.busca}
            onChange={e => setFiltro(f => ({ ...f, busca: e.target.value }))}
            className="campo-filtro"
          />
          <Select
            options={opcoesCategoria}
            value={filtro.categoria}
            onChange={op => setFiltro(f => ({ ...f, categoria: op }))}
            placeholder="Categoria"
            classNamePrefix="react-select"
          />
          <Select
            options={opcoesTipo}
            value={filtro.tipo}
            onChange={op => setFiltro(f => ({ ...f, tipo: op }))}
            placeholder="Tipo"
            classNamePrefix="react-select"
            isClearable
          />
          <Select
            options={opcoesForma}
            value={filtro.forma}
            onChange={op => setFiltro(f => ({ ...f, forma: op }))}
            placeholder="Forma"
            classNamePrefix="react-select"
            isClearable
          />
          <Select
            options={opcoesCentro}
            value={filtro.centro}
            onChange={op => setFiltro(f => ({ ...f, centro: op }))}
            placeholder="Centro de custo"
            classNamePrefix="react-select"
            isClearable
          />
        </div>
        <div className="botoes-financeiro-centro">
          <button onClick={() => setMostrarModal(true)} className="botao-acao pequeno">+ Novo Lançamento</button>
          <button onClick={() => alert('Importação em desenvolvimento')} className="botao-acao pequeno">Importar .csv</button>
          <button onClick={exportarExcel} className="botao-acao pequeno">Reagrupar lançamentos</button>
        </div>
      </div>

      <ResumoRapido movs={filtrados} />

      <TabelaLivroCaixa dados={filtrados} />

      <ResumoFinanceiro movs={filtrados} />

      {mostrarModal && (
        <ModalNovoLancamento onFechar={() => setMostrarModal(false)} categorias={categorias} />
      )}


    </div>
  );
}
