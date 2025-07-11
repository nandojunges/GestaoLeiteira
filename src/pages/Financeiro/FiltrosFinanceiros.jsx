import { useState } from 'react';
import Select from 'react-select';
import '../../styles/filtros.css';

export default function FiltrosFinanceiros({ filtros, onChange, categorias = [] }) {
  const listaCategorias = Array.isArray(categorias) ? categorias : [];
  const [resumo, setResumo] = useState('');
  const set = (campo, valor) => {
    onChange({ ...filtros, [campo]: valor });
  };

  const tipoOptions = [
    { value: '', label: 'Todos' },
    { value: 'Entrada', label: 'Entrada' },
    { value: 'Saída', label: 'Saída' },
  ];

  const catOptions = listaCategorias.map(c => ({ value: c, label: c }));

  const limpar = () => {
    onChange({ dataInicio: '', dataFim: '', tipo: '', categoria: '' });
    setResumo('');
  };

  const aplicar = () => {
    onChange({ ...filtros });
    const partes = [];
    if (filtros.tipo) partes.push(filtros.tipo === 'Saída' ? 'Despesas' : filtros.tipo === 'Entrada' ? 'Receitas' : filtros.tipo);
    if (filtros.categoria) partes.push(`Categoria: ${filtros.categoria}`);
    if (filtros.dataInicio) partes.push(`De ${filtros.dataInicio}`);
    if (filtros.dataFim) partes.push(`Até ${filtros.dataFim}`);
    setResumo(partes.length ? `🔎 Filtrando: ${partes.join(' | ')}` : '');
  };

  const handleSubmit = e => { e.preventDefault(); aplicar(); };

  return (
    <form onSubmit={handleSubmit}>
      <div className="filtros-lateral">
        <div className="campo-filtro">
          <label>Data início</label>
          <input
            type="date"
            aria-label="Data de início"
            placeholder="Selecione a data inicial"
            value={filtros.dataInicio}
            onChange={e => set('dataInicio', e.target.value)}
          />
        </div>
        <div className="campo-filtro">
          <label>Data fim</label>
          <input
            type="date"
            aria-label="Data de término"
            placeholder="Selecione a data final"
            value={filtros.dataFim}
            onChange={e => set('dataFim', e.target.value)}
          />
        </div>
        <div className="campo-filtro campo-filtro-select">
          <label>Tipo</label>
          <Select
            options={tipoOptions}
            placeholder="Selecione o tipo"
            aria-label="Tipo de movimento"
            value={tipoOptions.find(o => o.value === filtros.tipo)}
            onChange={o => set('tipo', o?.value || '')}
            isClearable
            classNamePrefix="react-select"
          />
        </div>
        <div className="campo-filtro campo-filtro-select">
          <label>Categoria</label>
          <Select
            options={catOptions}
            placeholder="Selecione a categoria"
            aria-label="Categoria"
            value={catOptions.find(o => o.value === filtros.categoria)}
            onChange={o => set('categoria', o?.value || '')}
            isClearable
            classNamePrefix="react-select"
          />
        </div>
        <div className="botoes-filtros">
          <button type="submit" className="botao-aplicar">🔍 Aplicar filtros</button>
          <button type="button" onClick={limpar} className="botao-limpar">Limpar filtros</button>
        </div>
      </div>
      {resumo && <div className="resumo-filtros">{resumo}</div>}
    </form>
  );
}
