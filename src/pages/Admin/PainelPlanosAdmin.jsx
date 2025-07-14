import { useEffect, useState } from 'react';
import api from '../../api';
import { toast } from 'react-toastify';
import '../../styles/botoes.css';

export default function PainelPlanosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [novoPlano, setNovoPlano] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [loadingAcao, setLoadingAcao] = useState({});

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
    setLoadingAcao((l) => ({ ...l, [id]: true }));
    try {
      await api.patch(`/admin/aprovar-pagamento/${id}`);
      toast.success('Pagamento aprovado');
      carregar();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao aprovar');
    } finally {
      setLoadingAcao((l) => ({ ...l, [id]: false }));
    }
  };

  const alterarPlano = async (id) => {
    const plano = novoPlano[id];
    if (!plano) return;
    setLoadingAcao((l) => ({ ...l, [id]: true }));
    try {
      await api.patch(`/admin/alterar-plano/${id}`, { plano });
      toast.success('Plano alterado');
      carregar();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao alterar');
    } finally {
      setLoadingAcao((l) => ({ ...l, [id]: false }));
    }
  };

  const toggleBloqueio = async (id) => {
    setLoadingAcao((l) => ({ ...l, [id]: true }));
    try {
      await api.patch(`/admin/bloquear/${id}`);
      toast.success('Status atualizado');
      carregar();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao atualizar status');
    } finally {
      setLoadingAcao((l) => ({ ...l, [id]: false }));
    }
  };

  const concederExtra = async (id) => {
    const dias = prompt('Quantos dias extras deseja conceder?');
    if (!dias) return;
    setLoadingAcao((l) => ({ ...l, [id]: true }));
    try {
      await api.patch(`/admin/liberar-temporario/${id}`, { dias });
      toast.success('Período atualizado');
      carregar();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao conceder');
    } finally {
      setLoadingAcao((l) => ({ ...l, [id]: false }));
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
            <th className="p-2 text-center">Plano atual</th>
            <th className="p-2 text-center">Plano solicitado</th>
            <th className="p-2 text-center">Forma de pagamento</th>
            <th className="p-2 text-center">Status</th>
            <th className="p-2 text-center">Data de liberação</th>
            <th className="p-2 text-center">Data de fim</th>
            <th className="p-2 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
            {usuarios.map((u) => (
            <tr
              key={u.id}
              style={{ backgroundColor: u.status === 'bloqueado' ? '#fde2e2' : 'transparent' }}
              className="border-b"
            >
              <td className="p-2">
                {u.nome}
                {u.status === 'bloqueado' && (
                  <span style={{ color: 'red' }} className="ml-1">🔒</span>
                )}
              </td>
              <td className="p-2">{u.email}</td>
              <td className="p-2 text-center">{u.plano || '-'}</td>
              <td className="p-2 text-center">{u.planoSolicitado || '-'}</td>
              <td className="p-2 text-center">{u.formaPagamento || '-'}</td>
              <td className="p-2 text-center">
                {u.status}
                {u.status === 'bloqueado' && (
                  <span className="ml-1 text-red-600 text-xs font-semibold">BLOQUEADO</span>
                )}
              </td>
              <td className="p-2 text-center">{formatarData(u.dataLiberado)}</td>
              <td className="p-2 text-center">{formatarData(u.dataFimLiberacao)}</td>
              <td className="p-2 text-center flex items-center justify-center gap-2 flex-wrap">
                <button
                  className="botao-editar text-green-700"
                  onClick={() => aprovar(u.id)}
                  disabled={loadingAcao[u.id]}
                >
                  {loadingAcao[u.id] ? '...' : 'Aprovar'}
                </button>
                <select
                  className="border rounded px-1 py-0.5"
                  value={novoPlano[u.id] ?? ''}
                  onChange={(e) =>
                    setNovoPlano((p) => ({ ...p, [u.id]: e.target.value }))
                  }
                  disabled={loadingAcao[u.id]}
                >
                  <option value="">Plano...</option>
                  <option value="basico">Básico</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="completo">Completo</option>
                </select>
                <button
                  className="botao-editar"
                  onClick={() => alterarPlano(u.id)}
                  disabled={loadingAcao[u.id]}
                >
                  {loadingAcao[u.id] ? '...' : 'Alterar Plano'}
                </button>
                <button
                  className={`botao-editar ${u.status === 'bloqueado' ? 'bg-red-600 text-white' : 'bg-yellow-600 text-white'}`}
                  onClick={() => toggleBloqueio(u.id)}
                  disabled={loadingAcao[u.id]}
                >
                  {loadingAcao[u.id]
                    ? '...'
                    : u.status === 'bloqueado'
                    ? 'Desbloquear'
                    : 'Bloquear'}
                </button>
                <button
                  className="botao-editar"
                  onClick={() => concederExtra(u.id)}
                  disabled={loadingAcao[u.id]}
                >
                  {loadingAcao[u.id] ? '...' : 'Conceder Dias Extras'}
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
