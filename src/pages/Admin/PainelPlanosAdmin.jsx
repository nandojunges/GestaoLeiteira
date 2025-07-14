import { useEffect, useState } from 'react';
import api from '../../api';
import { toast } from 'react-toastify';
import '../../styles/botoes.css';

export default function PainelPlanosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [novoPlano, setNovoPlano] = useState({});
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    setCarregando(true);
    try {
      const res = await api.get('/admin/planos');
      setUsuarios(res.data);
    } catch (e) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setCarregando(false);
    }
  };

  const aprovar = async (id) => {
    try {
      await api.patch(`/admin/aprovar-pagamento/${id}`);
      toast.success('Pagamento aprovado');
      carregar();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao aprovar');
    }
  };

  const alterarPlano = async (id) => {
    const plano = novoPlano[id];
    if (!plano) return;
    try {
      await api.patch(`/admin/alterar-plano/${id}`, { plano });
      toast.success('Plano alterado');
      carregar();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao alterar');
    }
  };

  const toggleBloqueio = async (id) => {
    try {
      await api.patch(`/admin/bloquear/${id}`);
      toast.success('Status atualizado');
      carregar();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao atualizar status');
    }
  };

  const concederExtra = async (id) => {
    const dias = prompt('Dias de acesso extra?');
    if (!dias) return;
    try {
      await api.patch(`/admin/liberar-temporario/${id}`, { dias });
      toast.success('Período atualizado');
      carregar();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao conceder');
    }
  };

  const formatarData = (d) => (d ? new Date(d).toLocaleDateString() : '-');

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Gestão de Planos</h1>
      <table className="min-w-full bg-white rounded shadow text-sm">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">E-mail</th>
            <th className="p-2 text-center">Plano Atual</th>
            <th className="p-2 text-center">Solicitado</th>
            <th className="p-2 text-center">Pagamento</th>
            <th className="p-2 text-center">Status</th>
            <th className="p-2 text-center">Datas</th>
            <th className="p-2 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="p-2">{u.nome}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2 text-center">{u.plano || '-'}</td>
              <td className="p-2 text-center">{u.planoSolicitado || '-'}</td>
              <td className="p-2 text-center">{u.formaPagamento || '-'}</td>
              <td className="p-2 text-center">{u.status}</td>
              <td className="p-2 text-center">
                {formatarData(u.dataLiberado)} - {formatarData(u.dataFimLiberacao)}
              </td>
              <td className="p-2 text-center space-x-1">
                <button className="botao-editar" onClick={() => aprovar(u.id)}>
                  Aprovar
                </button>
                <select
                  className="border rounded px-1 py-0.5"
                  value={novoPlano[u.id] ?? ''}
                  onChange={(e) => setNovoPlano({ ...novoPlano, [u.id]: e.target.value })}
                >
                  <option value="">Plano...</option>
                  <option value="gratis">Grátis</option>
                  <option value="basico">Básico</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="completo">Completo</option>
                </select>
                <button className="botao-editar" onClick={() => alterarPlano(u.id)}>
                  Mudar
                </button>
                <button className="botao-editar" onClick={() => toggleBloqueio(u.id)}>
                  {u.status === 'bloqueado' ? 'Desbloquear' : 'Bloquear'}
                </button>
                <button className="botao-editar" onClick={() => concederExtra(u.id)}>
                  Extra
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
