import { useEffect, useState } from 'react';
import api from '../../api';
import { toast } from 'react-toastify';

export default function AdminPainel() {
  const [usuarios, setUsuarios] = useState([]);
  const [perfis, setPerfis] = useState({});
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    setCarregando(true);
    try {
      const res = await api.get('/admin/usuarios');
      setUsuarios(res.data);
    } catch (err) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setCarregando(false);
    }
  };

  const alterarStatus = async (id) => {
    try {
      await api.patch(`/admin/status/${id}`);
      toast.success('Status atualizado');
      carregarUsuarios();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao alterar status');
    }
  };

  const alterarPerfil = async (email, perfil) => {
    try {
      await api.patch(`/admin/usuarios/${email}`, { perfil });
      toast.success('Perfil atualizado');
      carregarUsuarios();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao alterar perfil');
    }
  };

  const excluirUsuario = async (id) => {
    try {
      await api.delete(`/admin/usuarios/${id}`);
      toast.success('Usuário excluído');
      carregarUsuarios();
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
          {usuarios.map((u) => (
            <tr key={u.email} className="border-b">
              <td className="p-2">{u.nome}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2 text-center">{u.verificado ? 'ativo' : 'suspenso'}</td>
              <td className="p-2 text-center">
                <select
                  className="border rounded px-1 py-0.5"
                  value={perfis[u.email] ?? u.perfil}
                  onChange={(e) => {
                    const valor = e.target.value;
                    setPerfis({ ...perfis, [u.email]: valor });
                    alterarPerfil(u.email, valor);
                  }}
                >
                  <option value="usuario">Usuário</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="p-2 text-center space-x-1">
                <button
                  className="bg-yellow-600 text-white px-2 py-1 rounded"
                  onClick={() => alterarStatus(u.id)}
                >
                  {u.verificado ? 'Suspender' : 'Reativar'}
                </button>
                <button
                  className="bg-red-600 text-white px-2 py-1 rounded"
                  onClick={() => excluirUsuario(u.id)}
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
