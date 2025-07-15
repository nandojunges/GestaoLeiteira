import { useEffect, useState } from 'react';
import ModalSaudeAnimal from './ModalSaudeAnimal';
import { calcularStatusSaude, formatarData, parseData } from '../../utils/saudeUtils';
import '../../styles/tabelaModerna.css';

export default function Saude() {
  const [animais, setAnimais] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [tratamentos, setTratamentos] = useState([]);
  const [busca, setBusca] = useState('');
  const [grupoFiltro, setGrupoFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [selecionado, setSelecionado] = useState(null);

  useEffect(() => {
    const a = JSON.parse(localStorage.getItem('animais') || '[]');
    const oc = JSON.parse(localStorage.getItem('ocorrencias') || '[]');
    const tr = JSON.parse(localStorage.getItem('tratamentos') || '[]');
    setAnimais(a);
    setOcorrencias(oc);
    setTratamentos(tr);
  }, []);

  const grupos = Array.from(new Set(animais.map(a => a.grupo).filter(Boolean)));

  const infoAnimais = animais.map(a => {
    const oc = ocorrencias.filter(o => String(o.animal) === String(a.numero));
    const tr = tratamentos.filter(t => String(t.animal) === String(a.numero));
    const status = calcularStatusSaude(oc, tr);
    const ultimaOc = oc.sort((b, c) => parseData(c.data) - parseData(b.data))[0];
    const ultimoTr = tr.sort((b, c) => parseData(c.data) - parseData(b.data))[0];
    return { ...a, status, ultimaOc: ultimaOc?.data, ultimoTr: ultimoTr?.data, ocorrencias: oc, tratamentos: tr };
  });

  const filtrados = infoAnimais.filter(a => {
    if (busca && !(`${a.numero}`.includes(busca) || (a.nome || '').toLowerCase().includes(busca.toLowerCase()))) return false;
    if (grupoFiltro && a.grupo !== grupoFiltro) return false;
    if (statusFiltro && a.status !== statusFiltro) return false;
    return true;
  });

  const iconeStatus = s => (s === 'tratamento' ? '⚠️' : s === 'observacao' ? '🕒' : '✅');

  const adicionarOcorrencia = dados => {
    const nova = [...ocorrencias, dados];
    setOcorrencias(nova);
    localStorage.setItem('ocorrencias', JSON.stringify(nova));
  };

  const adicionarTratamento = dados => {
    const nova = [...tratamentos, dados];
    setTratamentos(nova);
    localStorage.setItem('tratamentos', JSON.stringify(nova));
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Saúde dos Animais</h2>
      <div className="flex flex-wrap gap-2">
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar número ou nome"
          className="border rounded px-2 py-1"
        />
        <select value={grupoFiltro} onChange={e => setGrupoFiltro(e.target.value)} className="border rounded px-2 py-1">
          <option value="">Todos os grupos</option>
          {grupos.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)} className="border rounded px-2 py-1">
          <option value="">Todos os status</option>
          <option value="normal">✅ Normal</option>
          <option value="observacao">🕒 Em observação</option>
          <option value="tratamento">⚠️ Em tratamento</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="tabela-padrao">
          <thead>
            <tr>
              <th>Número ou Nome</th>
              <th>Grupo</th>
              <th>Última Ocorrência</th>
              <th>Último Tratamento</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(a => (
              <tr key={a.numero} className="cursor-pointer" onClick={() => setSelecionado(a)}>
                <td>{a.numero}{a.nome ? ' - ' + a.nome : ''}</td>
                <td>{a.grupo || '—'}</td>
                <td>{a.ultimaOc ? formatarData(a.ultimaOc) : '—'}</td>
                <td>{a.ultimoTr ? formatarData(a.ultimoTr) : '—'}</td>
                <td>{iconeStatus(a.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selecionado && (
        <ModalSaudeAnimal
          animal={selecionado}
          ocorrencias={selecionado.ocorrencias}
          tratamentos={selecionado.tratamentos}
          onFechar={() => setSelecionado(null)}
          onAdicionarOcorrencia={adicionarOcorrencia}
          onAdicionarTratamento={adicionarTratamento}
        />
      )}
    </div>
  );
}
