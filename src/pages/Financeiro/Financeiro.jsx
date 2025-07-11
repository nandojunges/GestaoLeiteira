import { useEffect, useState } from 'react';
import CardFinanceiro from './CardFinanceiro';
import LivroCaixa from './LivroCaixa';
import GraficoFinanceiro from './GraficoFinanceiro';
import TabelaCustos from './TabelaCustos';
import { buscarTodos } from "../../utils/backendApi";
import '../../styles/painelFinanceiro.css';

export default function Financeiro() {
  const [movs, setMovs] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState('livro');
  const [filtro, setFiltro] = useState({ dataInicio: '', dataFim: '', tipo: null, categoria: null });

  useEffect(() => {
    async function carregarMovs() {
      try {
        const dados = await buscarTodos('financeiro');
        if (Array.isArray(dados)) {
          setMovs(dados);
        } else {
          console.error('Dados de financeiro inválidos');
          setMovs([]);
        }
      } catch (err) {
        console.error('Erro ao buscar financeiro:', err);
        alert('Erro ao conectar com o servidor. Verifique sua internet ou o backend.');
        setMovs([]);
      }
    }
    carregarMovs();
  }, []);

  const aplicarFiltros = lista => {
    const listaSegura = Array.isArray(lista) ? lista : [];
    return listaSegura.filter(m => {
      if (filtro.dataInicio && m.data < filtro.dataInicio) return false;
      if (filtro.dataFim && m.data > filtro.dataFim) return false;
      if (filtro.tipo && m.tipo !== filtro.tipo.value) return false;
      if (filtro.categoria && m.categoria !== filtro.categoria.value) return false;
      return true;
    });
  };

  const filtrados = aplicarFiltros(Array.isArray(movs) ? movs : []).sort((a,b) => b.data.localeCompare(a.data));

  const mesAtual = new Date().toISOString().slice(0,7);
  const [litros, setLitros] = useState(0);
  const [preco, setPreco] = useState(2);
  useEffect(() => {
    async function carregarDados() {
      try {
        let litros = 0;
        const medicoes = await buscarTodos('medicaoLeite');
        const medicoesSeguras = Array.isArray(medicoes) ? medicoes : [];
        medicoesSeguras.forEach((m) => {
          const data = (m.data || m.id || '').slice(0, 10);
          if (data.startsWith(mesAtual)) {
            const dados = m.dados || {};
            Object.values(dados).forEach((v) => {
              litros += parseFloat(v.total || 0);
            });
          }
        });
        setLitros(litros);

        const configs = await buscarTodos('config');
        const configSegura = Array.isArray(configs) ? configs : [];
        const precoItem = configSegura.find((c) => c.id === 'precoLitroLeite');
        if (precoItem) {
          setPreco(parseFloat(precoItem.valor || precoItem.preco || 2));
        }
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        alert('Erro ao conectar com o servidor. Verifique sua internet ou o backend.');
      }
    }
    carregarDados();
  }, [mesAtual]);

  const listaMovs = Array.isArray(movs) ? movs : [];
  const receitas = listaMovs
    .filter(m => m.tipo === 'Entrada' && m.data.startsWith(mesAtual))
    .reduce((s,m) => s + m.valor, 0);
  const despesas = listaMovs
    .filter(m => m.tipo === 'Saída' && m.data.startsWith(mesAtual))
    .reduce((s,m) => s + m.valor, 0);
  const lucro = receitas - despesas;
  const custo = litros > 0 ? despesas / litros : 0;

  const cards = [
    { id: 'receita', titulo: 'Receita do mês', valor: receitas, icone: '💵' },
    { id: 'despesa', titulo: 'Despesas do mês', valor: despesas, icone: '🪙' },
    { id: 'lucro', titulo: 'Lucro estimado', valor: lucro, icone: '📊' },
    { id: 'custo', titulo: 'Custo por litro', valor: custo, icone: '📈' }
  ];
  const formatar = v => v.toLocaleString('pt-BR',{ style:'currency', currency:'BRL' });

  const categorias = Array.from(new Set((Array.isArray(listaMovs) ? listaMovs : []).map(m => m.categoria).filter(Boolean)));
  const opcoesTipo = [
    { value: 'Entrada', label: 'Entrada' },
    { value: 'Saída', label: 'Saída' }
  ];
  const opcoesCategoria = categorias.map(c => ({ value: c, label: c }));


  const totalEntradas = filtrados.filter(m => m.tipo === 'Entrada').reduce((s,m) => s+m.valor,0);
  const totalSaidas = filtrados.filter(m => m.tipo === 'Saída').reduce((s,m) => s+m.valor,0);

  const aplicarPeriodo = dias => {
    const fim = new Date();
    const inicio = new Date();
    if(dias===0){
      // mes atual
      inicio.setDate(1);
    } else if(dias<0){
      // mes anterior
      inicio.setMonth(inicio.getMonth()-1,1);
      fim.setDate(0);
    } else {
      inicio.setDate(fim.getDate()-dias+1);
    }
    setFiltro(f => ({
      ...f,
      dataInicio: inicio.toISOString().slice(0,10),
      dataFim: fim.toISOString().slice(0,10)
    }));
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto p-4 space-y-6 font-poppins">
      <div className="cards-indicadores">
        {cards.map(c => (
          <CardFinanceiro key={c.id} titulo={c.titulo} valor={c.id==='custo' ? formatar(c.valor) + '/L' : formatar(c.valor)} icone={c.icone} tipo={c.id} tooltip={c.id==='custo' ? 'Cálculo: despesas / litros produzidos' : undefined} />
        ))}
      </div>
        <div className="linha-filtros-e-botoes">
          {/*
          <div className="filtros-financeiro">
            <div className="campo-filtro">
              <label>Data início</label>
              <input
                type="date"
                value={filtro.dataInicio}
                onChange={(e) => setFiltro({ ...filtro, dataInicio: e.target.value })}
              />
            </div>

            <div className="campo-filtro">
              <label>Data fim</label>
              <input
                type="date"
                value={filtro.dataFim}
                onChange={(e) => setFiltro({ ...filtro, dataFim: e.target.value })}
              />
            </div>

            <div className="campo-filtro">
              <label>Tipo</label>
              <Select
                options={opcoesTipo}
                value={filtro.tipo}
                onChange={(opcao) => setFiltro({ ...filtro, tipo: opcao })}
                placeholder="Todos"
                classNamePrefix="react-select"
              />
            </div>

            <div className="campo-filtro">
              <label>Categoria</label>
              <Select
                options={opcoesCategoria}
                value={filtro.categoria}
                onChange={(opcao) => setFiltro({ ...filtro, categoria: opcao })}
                placeholder="Selecione"
                classNamePrefix="react-select"
              />
            </div>
          </div>
          */}
        <div className="sub-abas-financeiro">
          <button
            onClick={() => setAbaAtiva('livro')}
            className={abaAtiva === 'livro' ? 'ativa' : ''}
          >
            📒 Livro Caixa
          </button>
          <button
            onClick={() => setAbaAtiva('relatorios')}
            className={abaAtiva === 'relatorios' ? 'ativa' : ''}
          >
            📊 Relatórios
          </button>
          <button
            onClick={() => setAbaAtiva('custos')}
            className={abaAtiva === 'custos' ? 'ativa' : ''}
          >
            📋 Tabela de Custos
          </button>
        </div>
      </div>
      {filtrados.length === 0 ? (
        <div className="text-center text-gray-500">Nenhum lançamento encontrado.</div>
      ) : (
        <>
          {abaAtiva === 'livro' && <LivroCaixa movs={filtrados} />}
          {abaAtiva === 'relatorios' && <GraficoFinanceiro movs={filtrados} />}
          {abaAtiva === 'custos' && <TabelaCustos />}
        </>
      )}
      <div className="resumo-final">
        🔍 {filtrados.length} lançamentos | {formatar(totalEntradas)} em receitas | {formatar(totalSaidas)} em despesas
      </div>
    </div>
  );
}
