import { useEffect, useState } from 'react';
import api from '../../api';
import { toast } from 'react-toastify';

export default function AdminPainel() {
  const [usuarios, setUsuarios] = useState([]);
  const [planos, setPlanos] = useState({});
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = () => {
    setCarregando(true);
    api.get('/admin/usuarios')
      .then(res => setUsuarios(res.data))
      .catch(() => toast.error('Erro ao carregar usuários'))
      .finally(() => setCarregando(false));
  };

  const acaoUsuario = async (email, acao, body = {}) => {
    try {
      await api.patch(`/admin/${acao}/${email}`, body);
      toast.success('Ação concluída');
      carregarUsuarios();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro na operação');
    }
  };

  const excluirUsuario = async (email) => {
    try {
      await api.delete(`/admin/usuarios/${email}`);
      toast.success('Usuário excluído');
      setUsuarios(u => u.filter(us => us.email !== email));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao excluir');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Painel Administrativo</h1>
      <table className="min-w-full bg-white rounded shadow text-sm">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-center">Status</th>
            <th className="p-2 text-center">Plano Atual</th>
            <th className="p-2 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.email} className="border-b">
              <td className="p-2">{u.nome}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2 text-center">{u.status}</td>
              <td className="p-2 text-center">
                <select
                  className="border rounded px-1 py-0.5"
                  value={planos[u.email] ?? u.plano}
                  onChange={e => setPlanos({ ...planos, [u.email]: e.target.value })}
                >
                  <option value="basico">Básico</option>
                  <option value="pro">Pro</option>
                  <option value="premium">Premium</option>
                </select>
              </td>
              <td className="p-2 text-center space-x-1">
                <button
                  className="bg-green-600 text-white px-2 py-1 rounded"
                  onClick={() => acaoUsuario(u.email, 'liberar')}
                >
                  Liberar
                </button>
                <button
                  className="bg-yellow-600 text-white px-2 py-1 rounded"
                  onClick={() => acaoUsuario(u.email, 'bloquear')}
                >
                  Bloquear
                </button>
                <button
                  className="bg-blue-600 text-white px-2 py-1 rounded"
                  onClick={() => acaoUsuario(u.email, 'plano', { plano: planos[u.email] ?? u.plano })}
                >
                  Alterar Plano
                </button>
                <button
                  className="bg-red-600 text-white px-2 py-1 rounded"
                  onClick={() => excluirUsuario(u.email)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {carregando && <div className="text-center">Carregando...</div>}
    </div>
  );
}