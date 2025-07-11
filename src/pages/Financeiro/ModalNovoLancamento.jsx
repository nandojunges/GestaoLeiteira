import { useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import { adicionarMovimentacao } from '../../utils/financeiro';
import '../../styles/botoes.css';

export default function ModalNovoLancamento({ onFechar, categorias = [] }) {
  const listaCategorias = Array.isArray(categorias) ? categorias : [];
  const [dados, setDados] = useState({
    data: new Date().toISOString().slice(0, 10),
    categoria: null,
    tipo: { value: 'Saída', label: 'Saída' },
    valor: '',
    descricao: '',
    formaPagamento: null,
    centroCusto: '',
    observacao: '',
    recorrencia: '',
    termino: '',
  });

  const refs = {
    data: useRef(null),
    categoria: useRef(null),
    tipo: useRef(null),
    valor: useRef(null),
    descricao: useRef(null),
    formaPagamento: useRef(null),
    centroCusto: useRef(null),
    observacao: useRef(null),
    recorrencia: useRef(null),
    termino: useRef(null),
  };

  useEffect(() => {
    refs.data.current?.focus();
    const esc = e => e.key === 'Escape' && onFechar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onFechar]);

  const avancar = campo => {
    const ordem = ['data','categoria','tipo','valor','descricao','formaPagamento','centroCusto','observacao','recorrencia','termino'];
    const idx = ordem.indexOf(campo);
    const prox = ordem[idx+1];
    if(prox && refs[prox]?.current) {
      refs[prox].current.focus();
    }
  };

  const salvar = () => {
    const itemBase = {
      categoria: dados.categoria?.value || '',
      tipo: dados.tipo?.value || 'Saída',
      valor: parseFloat(dados.valor) || 0,
      descricao: dados.descricao,
      formaPagamento: dados.formaPagamento?.value || '',
      centroCusto: dados.centroCusto || '',
      observacao: dados.observacao,
    };

    const inserir = (data) => {
      adicionarMovimentacao({ ...itemBase, data });
    };

    inserir(dados.data);

    if (dados.recorrencia && dados.termino) {
      let atual = new Date(dados.data);
      const fim = new Date(dados.termino);
      while (true) {
        if (dados.recorrencia === 'semanal') atual.setDate(atual.getDate() + 7);
        else if (dados.recorrencia === 'mensal') atual.setMonth(atual.getMonth() + 1);
        else if (dados.recorrencia === 'anual') atual.setFullYear(atual.getFullYear() + 1);
        if (atual > fim) break;
        inserir(atual.toISOString().slice(0, 10));
      }
    }

    onFechar();
  };

  const opcoesTipo = [
    { value: 'Entrada', label: 'Entrada' },
    { value: 'Saída', label: 'Saída' },
  ];
  const opcoesCategoria = listaCategorias.map(c => ({ value: c, label: c }));
  const opcoesForma = [
    { value: 'Pix', label: 'Pix' },
    { value: 'Cartão', label: 'Cartão' },
    { value: 'Dinheiro', label: 'Dinheiro' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow p-4 w-full max-w-sm space-y-3">
        <h3 className="text-lg font-semibold text-center">Novo Lançamento</h3>
        <input
          ref={refs.data}
          type="date"
          value={dados.data}
          onChange={e => setDados(d => ({ ...d, data:e.target.value }))}
          onKeyDown={e => e.key==='Enter' && avancar('data')}
          className="border rounded w-full p-2"
        />
        <Select
          ref={refs.categoria}
          options={opcoesCategoria}
          value={dados.categoria}
          onChange={op => setDados(d=>({...d, categoria:op }))}
          placeholder="Categoria"
          classNamePrefix="react-select"
          onKeyDown={e => e.key==='Enter' && avancar('categoria')}
        />
        <Select
          ref={refs.tipo}
          options={opcoesTipo}
          value={dados.tipo}
          onChange={op => setDados(d=>({...d, tipo:op }))}
          placeholder="Tipo"
          classNamePrefix="react-select"
          onKeyDown={e => e.key==='Enter' && avancar('tipo')}
        />
        <input
          ref={refs.valor}
          type="number"
          placeholder="Valor"
          value={dados.valor}
          onChange={e => setDados(d=>({...d, valor:e.target.value }))}
          onKeyDown={e => e.key==='Enter' && avancar('valor')}
          className="border rounded w-full p-2"
        />
        <input
          ref={refs.descricao}
          type="text"
          placeholder="Descrição"
          value={dados.descricao}
          onChange={e => setDados(d=>({...d, descricao:e.target.value }))}
          onKeyDown={e => e.key==='Enter' && avancar('descricao')}
          className="border rounded w-full p-2"
        />
        <Select
          ref={refs.formaPagamento}
          options={opcoesForma}
          value={dados.formaPagamento}
          onChange={op => setDados(d=>({...d, formaPagamento:op }))}
          placeholder="Forma de pagamento"
          classNamePrefix="react-select"
          onKeyDown={e => e.key==='Enter' && avancar('formaPagamento')}
        />
        <input
          ref={refs.centroCusto}
          type="text"
          placeholder="Centro de Custo"
          value={dados.centroCusto}
          onChange={e => setDados(d=>({...d, centroCusto:e.target.value }))}
          onKeyDown={e => e.key==='Enter' && avancar('centroCusto')}
          className="border rounded w-full p-2"
        />
        <input
          ref={refs.observacao}
          type="text"
          placeholder="Observações"
          value={dados.observacao}
          onChange={e => setDados(d=>({...d, observacao:e.target.value }))}
          onKeyDown={e => e.key==='Enter' && avancar('observacao')}
          className="border rounded w-full p-2"
        />
        <select
          ref={refs.recorrencia}
          value={dados.recorrencia}
          onChange={e => setDados(d=>({...d, recorrencia:e.target.value }))}
          onKeyDown={e => e.key==='Enter' && avancar('recorrencia')}
          className="border rounded w-full p-2"
        >
          <option value="">Sem recorrência</option>
          <option value="semanal">Semanal</option>
          <option value="mensal">Mensal</option>
          <option value="anual">Anual</option>
        </select>
        <input
          ref={refs.termino}
          type="date"
          placeholder="Término"
          value={dados.termino}
          onChange={e => setDados(d=>({...d, termino:e.target.value }))}
          onKeyDown={e => e.key==='Enter' && salvar()}
          className="border rounded w-full p-2"
        />
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onFechar} className="botao-cancelar pequeno">Cancelar</button>
          <button onClick={salvar} className="botao-acao pequeno">Salvar</button>
        </div>
      </div>
    </div>
  );
}
