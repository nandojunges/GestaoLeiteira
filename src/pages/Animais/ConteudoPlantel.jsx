import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { buscarRacasAdicionaisSQLite } from '../../utils/apiFuncoes';
import { calcularDEL } from './utilsAnimais';
import ModalEditarAnimal from './ModalEditarAnimal';
import ModalHistoricoCompleto from './ModalHistoricoCompleto';
import '../../styles/tabelaModerna.css';
import '../../styles/botoes.css';
import '../../styles/filtros.css';

export default function ConteudoPlantel({ vacas = [], onAtualizar }) {
  const [animalSelecionado, setAnimalSelecionado] = useState(null);

   const estiloIcone = {
    width: '36px',
    height: '36px',
    objectFit: 'contain'
  };
  const [animalFicha, setAnimalFicha] = useState(null);
  const [mostrarFicha, setMostrarFicha] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroRaca, setFiltroRaca] = useState('');
  const [filtroMinPartos, setFiltroMinPartos] = useState(0);
  const [listaRacas, setListaRacas] = useState([]);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState(null);
  const [colunaHover, setColunaHover] = useState(null);

  const todasAsColunas = [
    'Número',
    'Brinco',
    'Lactações',
    'DEL',
    'Categoria',
    'Idade',
    'Últ. IA',
    'Parto',
    'Raça',
    'Pai',
    'Mãe',
    'Previsão Parto',
    'Ação'
  ];

  const [colunasVisiveis, setColunasVisiveis] = useState(() => {
    const salvo = localStorage.getItem('visaoAnimaisColunas');
    return salvo ? JSON.parse(salvo) : todasAsColunas;
  });
  const [mostrarColunas, setMostrarColunas] = useState(false);

  const alternarColuna = (coluna) => {
    const novas = colunasVisiveis.includes(coluna)
      ? colunasVisiveis.filter((c) => c !== coluna)
      : [...colunasVisiveis, coluna];
    setColunasVisiveis(novas);
    localStorage.setItem('visaoAnimaisColunas', JSON.stringify(novas));
  };

  const colunasCfg = [
    { id: 'numero', label: 'Número' },
    { id: 'brinco', label: 'Brinco' },
    { id: 'lactacoes', label: 'Lactações' },
    { id: 'del', label: 'DEL' },
    { id: 'categoria', label: 'Categoria' },
    { id: 'idade', label: 'Idade' },
    { id: 'ultimaia', label: 'Últ. IA' },
    { id: 'parto', label: 'Parto' },
    { id: 'raca', label: 'Raça' },
    { id: 'pai', label: 'Pai' },
    { id: 'mae', label: 'Mãe' },
    { id: 'previsaoParto', label: 'Previsão Parto' },
    { id: 'acoes', label: 'Ação' },
  ];


  useEffect(() => {
    if (!opcaoSelecionada || opcaoSelecionada.value === 'todas') {
      setFiltroCategoria('');
    } else {
      setFiltroCategoria(opcaoSelecionada.value);
    }
  }, [opcaoSelecionada]);

  useEffect(() => {
    async function carregarRacas() {
      try {
        const adicionais = await buscarRacasAdicionaisSQLite();
        const padrao = ['Holandês', 'Jersey', 'Girolando'];
        setListaRacas([...padrao, ...(adicionais || [])]);
      } catch (err) {
        console.error('Erro ao carregar raças:', err);
        setListaRacas(['Holandês', 'Jersey', 'Girolando']);
      }
    }
    carregarRacas();
  }, []);

  const abrirFicha = (vaca) => {
    setAnimalFicha(vaca);
    setMostrarFicha(true);
  };

  const ativos = (Array.isArray(vacas) ? vacas : []).filter(
    (animal) => animal.status !== "inativo"
  );

  const vacasFiltradas = ativos.filter(v => {
      const atendeCategoria = !filtroCategoria || (v.categoria || '').toLowerCase() === filtroCategoria.toLowerCase();
      const atendeRaca = !filtroRaca || (v.raca || '').toLowerCase().includes(filtroRaca.toLowerCase());
      const atendePartos = !filtroMinPartos || (parseInt(v.nLactacoes || '0') >= filtroMinPartos);
      return atendeCategoria && atendeRaca && atendePartos;
    });


  const totalVacas = vacasFiltradas.length;
  const primiparas = vacasFiltradas.filter(v => parseInt(v.nLactacoes || '0') === 1).length;
  const multiparas = vacasFiltradas.filter(v => parseInt(v.nLactacoes || '0') > 1).length;

  const limparFiltros = () => {
    setOpcaoSelecionada(null);
    setFiltroCategoria('');
    setFiltroRaca('');
    setFiltroMinPartos(0);
  };

  return (
    <>
      <div
        className="w-full px-8 py-6 font-sans"
        style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)' }}
      >
        {/* Filtros */}
        <div
          className="filtros-container"
          style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}
        >
          <div className="filtro-campo">
            <label className="block text-sm font-medium text-gray-700">Categoria</label>
            <Select
              options={[
                { value: 'todas', label: 'Todas' },
                { value: 'primiparas', label: 'Primíparas' },
                { value: 'multiparas', label: 'Multíparas' }
              ]}
              value={opcaoSelecionada}
              onChange={setOpcaoSelecionada}
              placeholder="Selecione a categoria"
              className="select-estilizado"
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={{
                container: base => ({ ...base, width: 180 }),
                control: base => ({
                  ...base,
                  minHeight: 36,
                  height: 36,
                  fontSize: '0.9rem',
                  paddingLeft: 4,
                  paddingRight: 4
                }),
                menuPortal: base => ({ ...base, zIndex: 9999 })
              }}
            />
          </div>

          <div className="filtro-campo">
            <label className="block text-sm font-medium text-gray-700">Raça</label>
            <Select
              options={listaRacas.map(ra => ({ value: ra, label: ra }))}
              value={filtroRaca ? { value: filtroRaca, label: filtroRaca } : null}
              onChange={opcao => setFiltroRaca(opcao ? opcao.value : '')}
              placeholder="Selecione a raça"
              className="select-estilizado"
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={{
                container: base => ({ ...base, width: 180 }),
                control: base => ({
                  ...base,
                  minHeight: 36,
                  height: 36,
                  fontSize: '0.9rem',
                  paddingLeft: 4,
                  paddingRight: 4
                }),
                menuPortal: base => ({ ...base, zIndex: 9999 })
              }}
            />
          </div>

          <div className="filtro-campo">
            <label className="block text-sm font-medium text-gray-700">Mínimo de lactações</label>
            <input
              type="number"
              min="0"
              value={filtroMinPartos}
              onChange={e => setFiltroMinPartos(e.target.value)}
              placeholder="Mínimo de lactações"
              style={{
                height: '36px',
                width: 80,
                padding: '4px',
                borderRadius: '6px',
                border: '1px solid #ccc'
              }}
            />
          </div>
          <button
            onClick={limparFiltros}
            style={{
              height: 36,
              padding: '0 12px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            ♻️ Limpar Filtros
          </button>
        </div>

        <p className="resumo-filtros">
          {`🔍 Mostrando: ${totalVacas} vacas | ${primiparas} Primíparas | ${multiparas} Multíparas${filtroRaca ? ` | Raça: ${filtroRaca}` : ''}`}
        </p>

        {/* Tabela */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMostrarColunas(!mostrarColunas)}
            style={{
              position: 'relative',
              padding: '5px 10px',
              fontSize: '0.9rem',
              borderRadius: '6px',
              background: '#f0f0f0',
              border: '1px solid #ccc',
              cursor: 'pointer',
            }}
          >
            ⚙️ Colunas
          </button>
          {mostrarColunas && (
            <div
              style={{
                position: 'absolute',
                top: '40px',
                left: '0',
                zIndex: 50,
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                borderRadius: '8px',
                padding: '10px',
              }}
            >
              {todasAsColunas.map((coluna) => (
                <label key={coluna} style={{ display: 'block', marginBottom: '5px' }}>
                  <input
                    type="checkbox"
                    checked={colunasVisiveis.includes(coluna)}
                    onChange={() => alternarColuna(coluna)}
                  />{' '}
                  {coluna}
                </label>
              ))}
            </div>
          )}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <table className="tabela-padrao tabela-plantel" style={{ width: '100%', tableLayout: 'auto' }}>
            <thead>
              <tr>
                {todasAsColunas.map((coluna, index) => (
                  colunasVisiveis.includes(coluna) && (
                    <th
                      key={coluna}
                      onMouseEnter={() => setColunaHover(index)}
                      onMouseLeave={() => setColunaHover(null)}
                      className={`${colunaHover === index ? 'coluna-hover' : ''} ${colunasCfg[index].id}`}
                    >
                      {coluna}
                    </th>
                  )
                ))}
              </tr>
            </thead>
            <tbody>
              {vacasFiltradas.map((vaca, index) => {
              // 🟡 Buscar último parto: preferir campo direto, mas também procurar no array de partos
              const ultimoParto =
                vaca.parto ||
                vaca.ultimoParto ||
                (vaca.partos && vaca.partos.length > 0 ? vaca.partos[vaca.partos.length - 1].data : '—');

              const dados = [
                vaca.numero,
                vaca.brinco,
                vaca.nLactacoes ?? '—',
                vaca.del ?? calcularDEL(ultimoParto !== '—' ? ultimoParto : null),
                vaca.categoria,
                vaca.idade,
                vaca.ultimaIA || '—',
                ultimoParto,
                vaca.raca,
                vaca.nomeTouro || vaca.pai || '—',
                vaca.nomeMae || vaca.mae || '—',
                vaca.previsaoParto || '—',
                <>
                  <button className="botao-editar" onClick={() => setAnimalSelecionado(vaca)}>Editar</button>
                  <button className="botao-editar" onClick={() => abrirFicha(vaca)}>
                    <img
                      src="/icones/fichaanimal.png"
                      alt="Ficha Animal"
                      style={{ ...estiloIcone, display: 'block', margin: 'auto' }}
                    />
                  </button>
                </>
              ];

                return (
                  <tr key={index} className={vaca.statusGestacao === 'positiva' ? 'tr-prenha' : ''}>
                    {todasAsColunas.map((coluna, colIdx) => (
                      colunasVisiveis.includes(coluna) && (
                        <td
                          key={coluna}
                          className={`${colunaHover === colIdx ? 'coluna-hover' : ''} ${colunasCfg[colIdx].id}`}
                        >
                          {dados[colIdx]}
                        </td>
                      )
                    ))}
                  </tr>
                );
            })}
          </tbody>
        </table>
        </div>

        {/* Modais */}
        {animalSelecionado && (
          <ModalEditarAnimal
            animal={animalSelecionado}
            onFechar={() => setAnimalSelecionado(null)}
            onSalvar={() => {
              setAnimalSelecionado(null);
              onAtualizar && onAtualizar();
            }}
          />
        )}
      </div>

      {mostrarFicha && animalFicha && (
        <ModalHistoricoCompleto
          animal={animalFicha}
          onClose={() => {
            setMostrarFicha(false);
            setAnimalFicha(null);
          }}
        />
      )}
    </>
  );
}