import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatarData, agruparEventos, parseData } from '../../utils/saudeUtils';
import { formatarDataDigitada } from '../Animais/utilsAnimais';

export default function ModalSaudeAnimal({
  animal,
  ocorrencias = [],
  tratamentos = [],
  onFechar,
  onAdicionarOcorrencia,
  onAdicionarTratamento,
}) {
  const [aba, setAba] = useState('ocorrencias');
  const [novaOc, setNovaOc] = useState({ data: '', descricao: '', responsavel: '' });
  const [novoTr, setNovoTr] = useState({ data: '', medicamento: '', responsavel: '' });
  const ocRef = useRef([]);
  const trRef = useRef([]);

  useEffect(() => {
    const esc = e => e.key === 'Escape' && onFechar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onFechar]);

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

  const eventos = agruparEventos(ocorrencias, tratamentos);

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
          <div className="p-4 font-semibold text-blue-800 border-b">Saúde do Animal {animal.numero} {animal.nome && `- ${animal.nome}`}</div>
          <div className="flex gap-2 border-b px-4 pt-3">
            <TabButton id="ocorrencias">🐮 Ocorrências</TabButton>
            <TabButton id="tratamentos">💊 Tratamentos</TabButton>
            <TabButton id="historico">📜 Histórico</TabButton>
          </div>
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
          {aba === 'historico' && (
            <div className="p-4 text-sm max-h-80 overflow-auto space-y-2">
              {eventos.map((e, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-20 text-right text-gray-600">{formatarData(e.dataObj)}</div>
                  <div className="flex-1">
                    {e.tipo === 'ocorrencia' ? '🐮 ' : '💊 '}
                    {e.descricao || e.diagnostico || e.medicamento || e.principioAtivo}
                  </div>
                </div>
              ))}
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
