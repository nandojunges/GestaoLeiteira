import { useEffect, useState } from 'react';
import api from '../../api';
import { toast } from 'react-toastify';
import '../../styles/botoes.css';

export default function AdminPainel() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [modalLiberar, setModalLiberar] = useState(null);
  const [modalBloquear, setModalBloquear] = useState(null);
  const [modalAlterar, setModalAlterar] = useState(null);
  const [modalExcluir, setModalExcluir] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    setCarregando(true);
    try {
      const res = await api.get('/admin/planos');
      setUsuarios(res.data);
    } catch (err) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setCarregando(false);
    }
  };

  const liberar = async () => {
    try {
      await api.patch(`/admin/liberar/${modalLiberar.id}`, { dias: modalLiberar.dias });
      toast.success('Usuário liberado');
      setModalLiberar(null);
      carregar();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao liberar');
    }
  };

  const bloquear = async () => {
    try {
      await api.patch(`/admin/bloquear/${modalBloquear}`);
      toast.success('Usuário atualizado');
      setModalBloquear(null);
      carregar();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao bloquear');
    }
  };

  const alterarPlano = async () => {
    try {
      await api.patch(`/admin/alterar-plano/${modalAlterar.id}`, {
        planoSolicitado: modalAlterar.plano,
        formaPagamento: modalAlterar.forma,
      });
      toast.success('Plano alterado');
      setModalAlterar(null);
      carregar();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao alterar plano');
    }
  };

  const aprovarPlano = async (id) => {
    try {
      await api.patch(`/admin/aprovar-pagamento/${id}`);
      toast.success('Plano aprovado');
      carregar();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao aprovar');
    }
  };

  const excluirUsuario = async () => {
    try {
      await api.delete(`/admin/usuarios/${modalExcluir.id}`, {
        data: { motivo: modalExcluir.motivo, backup: modalExcluir.backup },
      });
      toast.success('Usuário excluído');
      setModalExcluir(null);
      carregar();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao excluir');
    }
  };

  const badge = (status) => {
    const cores = {
      ativo: 'bg-green-100 text-green-700',
      bloqueado: 'bg-red-100 text-red-700',
      pendente: 'bg-yellow-100 text-yellow-700',
      teste: 'bg-blue-100 text-blue-700',
      inativo: 'bg-gray-100 text-gray-700',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${cores[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>
    );
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Painel Administrativo</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-2 text-left">Nome</th>
              <th className="px-2 py-2 text-left">Email</th>
              <th className="px-2 py-2 text-left">Telefone</th>
              <th className="px-2 py-2 text-center">Plano Atual</th>
              <th className="px-2 py-2 text-center">Plano Solicitado</th>
              <th className="px-2 py-2 text-center">Status</th>
              <th className="px-2 py-2 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="px-2 py-1">{u.nome}</td>
                <td className="px-2 py-1">{u.email}</td>
                <td className="px-2 py-1">{u.telefone || '-'}</td>
                <td className="px-2 py-1 text-center">{u.plano || '-'}</td>
                <td className="px-2 py-1 text-center">
                  {u.planoSolicitado ? (
                    <span className="flex items-center justify-center gap-1">
                      {u.planoSolicitado} <span>🕒</span>
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-2 py-1 text-center">{badge(u.status)}</td>
                <td className="px-2 py-1 text-center flex flex-wrap gap-2 justify-center">
                  <button className="botao-editar" onClick={() => setModalLiberar({ id: u.id, dias: 30 })}>🔓 Liberar</button>
                  <button className="botao-editar" onClick={() => setModalBloquear(u.id)}>🚫 Bloquear</button>
                  <button className="botao-editar" onClick={() => setModalAlterar({ id: u.id, plano: '', forma: 'pix' })}>📦 Alterar Plano</button>
                  {u.planoSolicitado && (
                    <button className="botao-editar" onClick={() => aprovarPlano(u.id)}>
                      ✅ Aprovar Plano
                    </button>
                  )}
                  <button className="botao-editar" onClick={() => setModalExcluir({ id: u.id, motivo: '', backup: false, texto: '' })}>🗑️ Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {carregando && <div className="text-center">Carregando...</div>}

      {modalLiberar && (
        <div style={overlay} onClick={() => setModalLiberar(null)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2 text-center">Liberar acesso</h3>
            <input
              type="number"
              className="border rounded w-full p-2 mb-4"
              value={modalLiberar.dias}
              onChange={(e) => setModalLiberar((m) => ({ ...m, dias: e.target.value }))}
            />
            <div className="flex justify-end gap-2">
              <button className="botao-cancelar pequeno" onClick={() => setModalLiberar(null)}>Cancelar</button>
              <button className="botao-acao pequeno" onClick={liberar}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {modalBloquear && (
        <div style={overlay} onClick={() => setModalBloquear(null)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <p className="mb-4">Deseja bloquear este usuário?</p>
            <div className="flex justify-end gap-2">
              <button className="botao-cancelar pequeno" onClick={() => setModalBloquear(null)}>Cancelar</button>
              <button className="botao-acao pequeno" onClick={bloquear}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {modalAlterar && (
        <div style={overlay} onClick={() => setModalAlterar(null)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2 text-center">Alterar Plano</h3>
            <select
              className="border rounded w-full p-2 mb-2"
              value={modalAlterar.plano}
              onChange={(e) => setModalAlterar((m) => ({ ...m, plano: e.target.value }))}
            >
              <option value="">Selecione</option>
              <option value="basico">Básico</option>
              <option value="intermediario">Intermediário</option>
              <option value="completo">Completo</option>
            </select>
            <select
              className="border rounded w-full p-2 mb-4"
              value={modalAlterar.forma}
              onChange={(e) => setModalAlterar((m) => ({ ...m, forma: e.target.value }))}
            >
              <option value="pix">Pix</option>
              <option value="boleto">Boleto</option>
              <option value="cartao">Cartão</option>
            </select>
            <div className="flex justify-end gap-2">
              <button className="botao-cancelar pequeno" onClick={() => setModalAlterar(null)}>Cancelar</button>
              <button className="botao-acao pequeno" onClick={alterarPlano}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {modalExcluir && (
        <div style={overlay} onClick={() => setModalExcluir(null)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2 text-center">Excluir usuário</h3>
            <input
              type="text"
              placeholder="Motivo"
              className="border rounded w-full p-2 mb-2"
              value={modalExcluir.motivo}
              onChange={(e) => setModalExcluir((m) => ({ ...m, motivo: e.target.value }))}
            />
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={modalExcluir.backup}
                onChange={(e) => setModalExcluir((m) => ({ ...m, backup: e.target.checked }))}
              />
              Fazer backup dos dados antes de excluir
            </label>
            <input
              type="text"
              placeholder="Digite EXCLUIR para confirmar"
              className="border rounded w-full p-2 mb-4"
              value={modalExcluir.texto}
              onChange={(e) => setModalExcluir((m) => ({ ...m, texto: e.target.value }))}
            />
            <div className="flex justify-end gap-2">
              <button className="botao-cancelar pequeno" onClick={() => setModalExcluir(null)}>Cancelar</button>
              <button
                className="botao-acao pequeno"
                disabled={modalExcluir.texto !== 'EXCLUIR'}
                onClick={excluirUsuario}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const overlay = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modal = {
  background: '#fff',
  borderRadius: '0.75rem',
  width: 'min(90vw, 380px)',
  padding: '1rem',
};
