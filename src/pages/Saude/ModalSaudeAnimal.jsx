import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  formatarData,
  parseData,
  calcularStatusSaude,
} from '../../utils/saudeUtils';
import { formatarDataDigitada } from '../Animais/utilsAnimais';
import TabelaExames from './TabelaExames';
import ModalExame from './ModalExame';

export default function ModalSaudeAnimal({
  animal,
  ocorrencias = [],
  tratamentos = [],
  onFechar,
  onAdicionarOcorrencia,
  onAdicionarTratamento,
}) {
  const [aba, setAba] = useState('resumo');
  const [novaOc, setNovaOc] = useState({ data: '', descricao: '', responsavel: '' });
  const [novoTr, setNovoTr] = useState({ data: '', medicamento: '', responsavel: '' });
  const [exames, setExames] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [buscaResp, setBuscaResp] = useState('');
  const [showExame, setShowExame] = useState(false);
  const ocRef = useRef([]);
  const trRef = useRef([]);

  useEffect(() => {
    const esc = e => e.key === 'Escape' && onFechar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onFechar]);

  useEffect(() => {
    const dados = JSON.parse(localStorage.getItem(`exames-${animal.numero}`) || '[]');
    const ordenados = [...dados].sort((a, b) => parseData(b.data) - parseData(a.data));
    setExames(ordenados);
  }, [animal]);

  useEffect(() => {
    const enter = e => {
      if (e.key !== 'Enter') return;
      if (aba === 'ocorrencias') salvarOcorrencia();
      if (aba === 'tratamentos') salvarTratamento();
    };
    window.addEventListener('keydown', enter);
    return () => window.removeEventListener('keydown', enter);
  }, [aba, novaOc, novoTr]);

  const salvarOcorrencia = () => {
    if (!novaOc.data) return;
    onAdicionarOcorrencia && onAdicionarOcorrencia({ ...novaOc, animal: animal.numero });
    setNovaOc({ data: '', descricao: '', responsavel: '' });
  };

  const salvarTratamento = () => {
    if (!novoTr.data || !novoTr.medicamento) return;
    onAdicionarTratamento && onAdicionarTratamento({ ...novoTr, animal: animal.numero });
    setNovoTr({ data: '', medicamento: '', responsavel: '' });
  };


  const status = calcularStatusSaude(
    animal.numero,
    ocorrencias,
    tratamentos
  );
  const statusInfo = {
    normal: { emoji: '✅', cor: 'text-green-600', label: 'Normal' },
    observacao: { emoji: '🕒', cor: 'text-yellow-600', label: 'Em observação' },
    tratamento: { emoji: '⚠️', cor: 'text-red-600', label: 'Em tratamento' },
  };
  const ultOcorrencias = [...ocorrencias]
    .sort((a, b) => parseData(b.data) - parseData(a.data))
    .slice(0, 3);
  const ultTratamentos = [...tratamentos]
    .sort((a, b) => parseData(b.data) - parseData(a.data))
    .slice(0, 3);

  const TabButton = ({ id, children }) => (
    <button
      onClick={() => setAba(id)}
      className={`px-3 py-1 rounded-t ${aba === id ? 'bg-white' : 'bg-gray-200'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onFechar}>
      <AnimatePresence mode="wait">
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded shadow-lg w-full max-w-xl max-h-[90vh] overflow-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-4 font-semibold text-blue-800 border-b flex justify-between items-center">
            <span>Saúde do Animal {animal.numero} {animal.nome && `- ${animal.nome}`}</span>
            <button
              onClick={onFechar}
              className="text-xs border border-blue-800 rounded px-2 py-0.5 hover:bg-blue-50"
            >
              ESC
            </button>
          </div>
          <div className="flex gap-2 border-b px-4 pt-3">
            <TabButton id="resumo">📄 Resumo</TabButton>
            <TabButton id="ocorrencias">🐮 Ocorrências</TabButton>
            <TabButton id="tratamentos">💊 Tratamentos</TabButton>
            <TabButton id="exames">🧪 Exames</TabButton>
          </div>
          {aba === 'resumo' && (
            <div className="p-4 space-y-4 text-sm">
              <div className={`text-lg font-semibold ${statusInfo[status].cor}`}>{statusInfo[status].emoji} {statusInfo[status].label}</div>
              <div>Grupo: {animal.grupo || '—'}</div>
              <div>
                <h4 className="font-semibold">Últimas ocorrências</h4>
                {ultOcorrencias.length ? (
                  <ul className="list-disc pl-4 space-y-1">
                    {ultOcorrencias.map((o, i) => (
                      <li key={i}>{formatarData(o.data)} - {o.descricao || o.diagnostico}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">Nenhuma ocorrência</p>
                )}
              </div>
              <div>
                <h4 className="font-semibold">Últimos tratamentos</h4>
                {ultTratamentos.length ? (
                  <ul className="list-disc pl-4 space-y-1">
                    {ultTratamentos.map((t, i) => (
                      <li key={i}>{formatarData(t.data)} - {t.medicamento || t.principioAtivo}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">Nenhum tratamento</p>
                )}
              </div>
            </div>
          )}
          {aba === 'ocorrencias' && (
            <div className="p-4 space-y-4">
              <ul className="space-y-2 text-sm max-h-60 overflow-auto">
                {ocorrencias.map((o, i) => (
                  <li key={i} className="border-b pb-1">
                    <span className="font-medium">{formatarData(o.data)}</span> - {o.descricao || o.diagnostico}
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <input
                  ref={el => ocRef.current[0] = el}
                  value={novaOc.data}
                  onChange={e => setNovaOc(prev => ({ ...prev, data: formatarDataDigitada(e.target.value) }))}
                  placeholder="Data"
                  className="border rounded px-2 py-1"
                />
                <input
                  ref={el => ocRef.current[1] = el}
                  value={novaOc.descricao}
                  onChange={e => setNovaOc(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição"
                  className="border rounded px-2 py-1 col-span-2"
                />
                <input
                  ref={el => ocRef.current[2] = el}
                  value={novaOc.responsavel}
                  onChange={e => setNovaOc(prev => ({ ...prev, responsavel: e.target.value }))}
                  placeholder="Responsável"
                  className="border rounded px-2 py-1 col-span-2"
                />
                <button onClick={salvarOcorrencia} className="bg-blue-600 text-white rounded px-3 py-1">Salvar</button>
              </div>
            </div>
          )}
          {aba === 'tratamentos' && (
            <div className="p-4 space-y-4">
              <ul className="space-y-2 text-sm max-h-60 overflow-auto">
                {tratamentos.map((t, i) => (
                  <li key={i} className="border-b pb-1">
                    <span className="font-medium">{formatarData(t.data)}</span> - {t.medicamento || t.principioAtivo}
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <input
                  ref={el => trRef.current[0] = el}
                  value={novoTr.data}
                  onChange={e => setNovoTr(prev => ({ ...prev, data: formatarDataDigitada(e.target.value) }))}
                  placeholder="Data"
                  className="border rounded px-2 py-1"
                />
                <input
                  ref={el => trRef.current[1] = el}
                  value={novoTr.medicamento}
                  onChange={e => setNovoTr(prev => ({ ...prev, medicamento: e.target.value }))}
                  placeholder="Medicamento"
                  className="border rounded px-2 py-1 col-span-2"
                />
                <input
                  ref={el => trRef.current[2] = el}
                  value={novoTr.responsavel}
                  onChange={e => setNovoTr(prev => ({ ...prev, responsavel: e.target.value }))}
                  placeholder="Responsável"
                  className="border rounded px-2 py-1 col-span-2"
                />
                <button onClick={salvarTratamento} className="bg-blue-600 text-white rounded px-3 py-1">Salvar</button>
              </div>
            </div>
          )}
          {aba === 'exames' && (
            <div className="p-4 space-y-3 text-sm">
              <div className="flex flex-wrap gap-2 items-end">
                <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="border rounded px-2 py-1">
                  <option value="">Todos os tipos</option>
                  <option>Sangue</option>
                  <option>Fezes</option>
                  <option>Leite</option>
                  <option>Urina</option>
                  <option>Imagem</option>
                  <option>Outro</option>
                </select>
                <input
                  value={buscaResp}
                  onChange={e => setBuscaResp(e.target.value)}
                  placeholder="Responsável"
                  className="border rounded px-2 py-1"
                />
                <button onClick={() => setShowExame({})} className="bg-blue-600 text-white rounded px-3 py-1 ml-auto">+ Novo Exame</button>
              </div>
              <div className="max-h-60 overflow-auto">
                <TabelaExames
                  lista={exames.filter(e => (!filtroTipo || e.tipo === filtroTipo) && (!buscaResp || (e.responsavel || '').toLowerCase().includes(buscaResp.toLowerCase())))}
                  onEditar={(d, i) => { setShowExame({ dados: d, idx: i }); }}
                  onExcluir={idx => {
                    const nova = exames.filter((_, i) => i !== idx);
                    setExames(nova);
                    localStorage.setItem(`exames-${animal.numero}`, JSON.stringify(nova));
                  }}
                  abrirAnexo={anexos => {
                    if (!anexos || !anexos.length) return;
                    const a = anexos[0];
                    const w = window.open();
                    w.document.write(`<iframe src="${a.dado}" style="width:100%;height:100%"></iframe>`);
                  }}
                />
              </div>
              {showExame && (
                <ModalExame
                  dados={showExame.dados}
                  onFechar={() => setShowExame(null)}
                  onSalvar={reg => {
                    let nova = [];
                    if (showExame.idx !== undefined) {
                      nova = exames.map((e, i) => i === showExame.idx ? reg : e);
                    } else {
                      nova = [...exames, reg];
                    }
                    nova.sort((a, b) => parseData(b.data) - parseData(a.data));
                    setExames(nova);
                    localStorage.setItem(`exames-${animal.numero}`, JSON.stringify(nova));
                  }}
                />
              )}
            </div>
          )}
          <div className="p-4 text-right border-t">
            <button onClick={onFechar} className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300">Fechar</button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
