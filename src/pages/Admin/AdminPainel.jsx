import { useEffect, useState } from 'react';
import api from '../../api';

export default function AdminPainel() {
  const [produtores, setProdutores] = useState([]);
  const [erro, setErro] = useState('');
  const [limites, setLimites] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    api.get('/admin/produtores', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setProdutores(res.data))
      .catch(() => setErro('Acesso negado – apenas administradores'));
  }, [token]);

  const handleChange = (id, value) => {
    setLimites({ ...limites, [id]: value });
  };

  const salvarLimite = id => {
    const limite = parseInt(limites[id], 10);
    api.patch(`/admin/limite/${id}`, { limite }, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setProdutores(produtores.map(p => p.id === id ? { ...p, limiteAnimais: res.data.limiteAnimais } : p));
      });
  };

  const toggleStatus = id => {
    api.patch(`/admin/status/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setProdutores(produtores.map(p => p.id === id ? { ...p, status: res.data.status } : p));
      });
  };

  if (erro) return <div className="p-4 text-red-500">{erro}</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Painel Administrativo</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">E-mail</th>
            <th className="p-2 text-left">Fazenda</th>
            <th className="p-2 text-center">Vacas</th>
            <th className="p-2 text-center">Limite</th>
            <th className="p-2 text-center">Status</th>
            <th className="p-2 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtores.map(p => (
            <tr key={p.id} className={p.numeroAnimais > p.limiteAnimais ? 'bg-red-100' : ''}>
              <td className="p-2">{p.nome}</td>
              <td className="p-2">{p.email}</td>
              <td className="p-2">{p.fazenda}</td>
              <td className="p-2 text-center">{p.numeroAnimais}</td>
              <td className="p-2 text-center">
                <input type="number" className="border p-1 w-20" value={limites[p.id] ?? p.limiteAnimais} onChange={e => handleChange(p.id, e.target.value)} />
              </td>
              <td className="p-2 text-center">{p.status}</td>
              <td className="p-2 text-center space-x-2">
                <button onClick={() => salvarLimite(p.id)} className="bg-blue-500 text-white px-2 py-1 rounded">Salvar</button>
                <button onClick={() => toggleStatus(p.id)} className="bg-yellow-500 text-white px-2 py-1 rounded">
                  {p.status === 'ativo' ? 'Suspender' : 'Ativar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
