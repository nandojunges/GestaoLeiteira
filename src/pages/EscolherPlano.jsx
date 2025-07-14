import { useState } from 'react';
import jwtDecode from 'jwt-decode';
import api from '../api';
import '../styles/botoes.css';

export default function EscolherPlano() {
  const planos = [
    {
      id: 'gratis',
      nome: 'Gr\u00e1tis',
      descricao: 'Teste limitado por 7 dias',
      preco: 'R$0',
      funcionalidades: ['Produ\u00e7\u00e3o de leite', 'Reprodu\u00e7\u00e3o', 'Controle financeiro'],
    },
    {
      id: 'basico',
      nome: 'B\u00e1sico',
      descricao: 'Funcionalidades essenciais',
      preco: 'R$29',
      funcionalidades: ['Leite', 'Reprodu\u00e7\u00e3o', 'Financeiro'],
    },
    {
      id: 'intermediario',
      nome: 'Intermedi\u00e1rio',
      descricao: 'Plano intermed\u00e1rio',
      preco: 'R$59',
      funcionalidades: ['Leite', 'Reprodu\u00e7\u00e3o', 'Financeiro', 'Estoque'],
    },
    {
      id: 'completo',
      nome: 'Completo',
      descricao: 'Todos os recursos',
      preco: 'R$89',
      funcionalidades: ['Leite', 'Reprodu\u00e7\u00e3o', 'Financeiro', 'Estoque', 'Relat\u00f3rios'],
    },
  ];

  const [plano, setPlano] = useState(null);
  const [forma, setForma] = useState('pix');
  const [mostrarModal, setMostrarModal] = useState(false);

  const selecionarPlano = (p) => {
    setPlano(p);
    setMostrarModal(true);
  };

  const confirmar = async () => {
    try {
      const token = localStorage.getItem('token');
      const { idProdutor } = jwtDecode(token);
      await api.patch(`/admin/alterar-plano/${idProdutor}`, {
        planoSolicitado: plano.id,
        formaPagamento: forma,
      });
      alert('Solicita\u00e7\u00e3o enviada');
      setMostrarModal(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao solicitar plano');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-center">Escolha seu Plano</h1>
      <div className="grid md:grid-cols-4 gap-4">
        {planos.map((p) => (
          <div key={p.id} className="bg-white shadow rounded-lg p-4 flex flex-col">
            <h2 className="text-lg font-semibold mb-1">{p.nome}</h2>
            <p className="text-sm mb-2">{p.descricao}</p>
            <ul className="text-sm flex-1 list-disc pl-4 mb-2">
              {p.funcionalidades.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <div className="font-bold mb-2">{p.preco}</div>
            <button onClick={() => selecionarPlano(p)} className="botao-acao">Selecionar Plano</button>
          </div>
        ))}
      </div>

      {mostrarModal && (
        <div style={overlay} onClick={() => setMostrarModal(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2 text-center">Forma de Pagamento</h3>
            <select value={forma} onChange={(e) => setForma(e.target.value)} className="border rounded w-full p-2 mb-4">
              <option value="pix">Pix</option>
              <option value="boleto">Boleto</option>
              <option value="cartao">Cart\u00e3o</option>
            </select>
            <div className="flex justify-end gap-2">
              <button className="botao-cancelar pequeno" onClick={() => setMostrarModal(false)}>Cancelar</button>
              <button className="botao-acao pequeno" onClick={confirmar}>Confirmar</button>
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
  width: 'min(90vw, 360px)',
  padding: '1rem',
};

