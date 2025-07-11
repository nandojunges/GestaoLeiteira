import { useEffect, useState } from 'react';
import {
  carregarCustos,
  adicionarCusto,
  atualizarCusto,
  removerCusto,
} from '../../utils/tabelaCustos';
import {
  buscarTodos,
  adicionarItem,
  atualizarItem,
  excluirItem,
} from "../../utils/backendApi";
import '../../styles/tabelaModerna.css';

export default function TabelaCustos() {
  const [lista, setLista] = useState([]);
  const [novo, setNovo] = useState({ nome:'', unidade:'kg', precoUnitario:'', categoria:'Medicamento', obs:'' });
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCat, setFiltroCat] = useState('');
  const [editando, setEditando] = useState(null);
  const [pendentes, setPendentes] = useState([]);

  useEffect(() => {
    const atualizar = async () => {
      try {
        setLista(await carregarCustos());
      } catch {
        setLista([]);
      }
    };
    const atualizarPend = async () => {
      try {
        setPendentes(await buscarTodos('custosPendentes'));
      } catch {
        setPendentes([]);
      }
    };
    atualizar();
    atualizarPend();
    window.addEventListener('tabelaCustosAtualizada', atualizar);
    window.addEventListener('custosPendentesAtualizados', atualizarPend);
    return () => {
      window.removeEventListener('tabelaCustosAtualizada', atualizar);
      window.removeEventListener('custosPendentesAtualizados', atualizarPend);
    };
  }, []);

  const categorias = ['Medicamento','Nutrição','Reprodutivo','Higiene','Outros'];
  const unidades = ['kg','litro','mL','unidade'];

  const handleAdd = () => {
    const preco = parseFloat(novo.precoUnitario);
    if(!novo.nome || isNaN(preco) || preco <= 0) {
      alert('Informe nome e preço válido (>0).');
      return;
    }
    const item = {
      id: Date.now(),
      ...novo,
      precoUnitario: preco,
      dataAtualizacao: new Date().toISOString().slice(0,10),
      historico: [{ data: new Date().toISOString().slice(0,10), preco }],
    };
    adicionarCusto(item);
    setNovo({ nome:'', unidade:'kg', precoUnitario:'', categoria:'Medicamento', obs:'' });
  };

  const iniciarEdicao = (item) => {
    setEditando({ ...item });
  };

  const salvarEdicao = () => {
    const preco = parseFloat(editando.precoUnitario);
    if(isNaN(preco) || preco<=0) {
      alert('Preço deve ser maior que zero');
      return;
    }
    const antigo = lista.find(i=>i.id===editando.id);
    const historico = antigo.historico || [];
    if(preco !== antigo.precoUnitario) {
      historico.push({ data: new Date().toISOString().slice(0,10), preco });
    }
    atualizarCusto(editando.id, { ...editando, precoUnitario: preco, dataAtualizacao:new Date().toISOString().slice(0,10), historico });
    setEditando(null);
  };

  const listaSegura = Array.isArray(lista) ? lista : [];
  const filtrados = listaSegura.filter(l => {
    if(filtroNome && !l.nome.toLowerCase().includes(filtroNome.toLowerCase())) return false;
    if(filtroCat && l.categoria !== filtroCat) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4">
      <div className="flex flex-wrap gap-2">
        <input value={filtroNome} onChange={e=>setFiltroNome(e.target.value)} placeholder="Buscar por nome" className="border p-1 rounded" />
        <select value={filtroCat} onChange={e=>setFiltroCat(e.target.value)} className="border p-1 rounded">
          <option value="">Todas categorias</option>
          {categorias.map(c=> <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="tabela-padrao w-full table-fixed">
          <thead>
            <tr>
              <th className="w-40">Nome do Produto</th>
              <th className="w-20">Unidade</th>
              <th className="w-24">Preço Unitário</th>
              <th className="w-28">Data Atualização</th>
              <th className="w-28">Categoria</th>
              <th className="w-40">Observações</th>
              <th className="w-16">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(item => (
              <tr key={item.id} className="hover:bg-gray-100">
                <td>{item.nome}</td>
                <td>{item.unidade}</td>
                <td title={item.historico && item.historico.length>1 ? `Último: R$ ${item.historico[item.historico.length-2].preco.toFixed(2)} em ${item.historico[item.historico.length-2].data}` : ''} className="text-right">
                  { (item.precoUnitario <= 0 || pendentes.includes(item.nome)) && '⚠️ ' }
                  R$ {item.precoUnitario.toFixed(2)}
                </td>
                <td>{item.dataAtualizacao}</td>
                <td>{item.categoria}</td>
                <td>{item.obs || '-'}</td>
                <td>
                  <button onClick={()=>iniciarEdicao(item)} className="acao-icon mr-2" title="Editar">✏️</button>
                  <button onClick={()=>removerCusto(item.id)} className="acao-icon" title="Excluir">🗑️</button>
                </td>
              </tr>
            ))}
            {filtrados.length===0 && (
              <tr><td colSpan="7" className="text-center py-4">Nenhum produto cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-2 pt-2">
        <h3 className="font-semibold">Adicionar Produto</h3>
        <div className="flex flex-wrap gap-2 items-end">
          <input value={novo.nome} onChange={e=>setNovo(n=>({...n, nome:e.target.value}))} placeholder="Nome" className="border p-1 rounded" />
          <select value={novo.unidade} onChange={e=>setNovo(n=>({...n, unidade:e.target.value}))} className="border p-1 rounded">
            {unidades.map(u=><option key={u} value={u}>{u}</option>)}
          </select>
          <input type="number" step="0.01" value={novo.precoUnitario} onChange={e=>setNovo(n=>({...n, precoUnitario:e.target.value}))} placeholder="Preço" className="border p-1 rounded" />
          <select value={novo.categoria} onChange={e=>setNovo(n=>({...n, categoria:e.target.value}))} className="border p-1 rounded">
            {categorias.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
          <input value={novo.obs} onChange={e=>setNovo(n=>({...n, obs:e.target.value}))} placeholder="Observações" className="border p-1 rounded flex-grow" />
          <button onClick={handleAdd} className="bg-blue-600 text-white px-3 py-1 rounded">Adicionar</button>
        </div>
      </div>
      {editando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 rounded shadow w-full max-w-sm space-y-2">
            <h3 className="text-lg font-semibold text-center">Editar Produto</h3>
            <input type="text" value={editando.nome} onChange={e=>setEditando(d=>({...d,nome:e.target.value}))} className="border p-1 rounded w-full" />
            <select value={editando.unidade} onChange={e=>setEditando(d=>({...d,unidade:e.target.value}))} className="border p-1 rounded w-full">
              {unidades.map(u=> <option key={u} value={u}>{u}</option>)}
            </select>
            <input type="number" step="0.01" value={editando.precoUnitario} onChange={e=>setEditando(d=>({...d,precoUnitario:e.target.value}))} className="border p-1 rounded w-full" />
            <select value={editando.categoria} onChange={e=>setEditando(d=>({...d,categoria:e.target.value}))} className="border p-1 rounded w-full">
              {categorias.map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="text" value={editando.obs} onChange={e=>setEditando(d=>({...d,obs:e.target.value}))} className="border p-1 rounded w-full" />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={()=>setEditando(null)} className="px-3 py-1 bg-gray-300 rounded">Cancelar</button>
              <button onClick={salvarEdicao} className="px-3 py-1 bg-blue-600 text-white rounded">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

