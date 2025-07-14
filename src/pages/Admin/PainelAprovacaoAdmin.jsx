import { useEffect, useState } from 'react';
import api from '../../api';
import { toast } from 'react-toastify';

export default function PainelAprovacaoAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const carregar = async () => {
    try {
      const res = await api.get('/admin/pendentes');
      setUsuarios(res.data);
    } catch (e) {
      toast.error('Erro ao carregar pendentes');
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const aprovar = async (id) => {
    setLoadingId(id);
    try {
      await api.post('/admin/aprovar-plano', { idUsuario: id });
      toast.success('Plano aprovado');
      carregar();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao aprovar');
    } finally {
      setLoadingId(null);
    }
  };

  const rejeitar = async (id) => {
    try {
      await api.post('/admin/rejeitar-plano', { idUsuario: id });
      toast.success('Plano rejeitado');
      carregar();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao rejeitar');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Aprovação de Planos</h1>
      <table className="min-w-full bg-white rounded shadow text-sm">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">Plano Solicitado</th>
            <th className="p-2 text-left">Forma de Pagamento</th>
            <th className="p-2 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="p-2">{u.nome}</td>
              <td className="p-2">{u.planoSolicitado || '-'}</td>
              <td className="p-2">{u.formaPagamento || '-'}</td>
              <td className="p-2 flex gap-2 justify-center">
                <button
                  className="px-3 py-1 rounded text-white bg-green-600 disabled:opacity-50"
                  onClick={() => aprovar(u.id)}
                  disabled={loadingId === u.id}
                >
                  {loadingId === u.id ? '...' : 'Aprovar'}
                </button>
                <button
                  className="px-3 py-1 rounded text-white bg-red-600"
                  onClick={() => rejeitar(u.id)}
                >
                  Rejeitar
                </button>
              </td>
            </tr>
          ))}
          {usuarios.length === 0 && (
            <tr>
              <td colSpan="4" className="p-4 text-center">
                Nenhum usuário pendente
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
