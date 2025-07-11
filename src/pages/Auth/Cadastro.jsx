import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export default function Cadastro() {
  const [form, setForm] = useState({
    nome: '',
    fazenda: '',
    email: '',
    telefone: '',
    senha: '',
    confirmar: '',
  });
  const [erro, setErro] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    if (!form.nome || !form.email || !form.telefone || !form.senha || !form.confirmar) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailValido) {
      setErro('E-mail inválido.');
      return;
    }
    if (form.telefone.replace(/\D/g, '').length < 8) {
      setErro('Telefone inválido.');
      return;
    }
    if (form.senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (form.senha !== form.confirmar) {
      setErro('As senhas não conferem.');
      return;
    }
    try {
      await api.post('/auth/register', {
        nome: form.nome,
        nomeFazenda: form.fazenda,
        email: form.email,
        telefone: form.telefone,
        senha: form.senha,
      });
      localStorage.setItem('emailCadastro', form.email);
      localStorage.setItem('dadosCadastro', JSON.stringify({
        nome: form.nome,
        nomeFazenda: form.fazenda,
        email: form.email,
        telefone: form.telefone,
        senha: form.senha,
      }));
      navigate('/verificar-email');
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao cadastrar');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        backgroundImage: "url('/icones/telafundo.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          width: '100%',
        }}
      >
        <p className="text-center text-sm text-gray-600">Bem-vindo ao Gestão Leiteira</p>
        <h2 className="text-xl font-bold text-center mb-4">Cadastro</h2>
        {erro && (
          <div className="mb-2 text-red-600 text-sm text-center">{erro}</div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <div className="input-senha-container">
              <input
                type="text"
                placeholder="Seu nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="input-senha"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Fazenda</label>
            <div className="input-senha-container">
              <input
                type="text"
                placeholder="Ex: Fazenda Esperança"
                value={form.fazenda}
                onChange={(e) => setForm({ ...form, fazenda: e.target.value })}
                className="input-senha"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <div className="input-senha-container">
              <input
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-senha"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <div className="input-senha-container">
              <input
                type="tel"
                placeholder="(99) 99999-9999"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                required
                className="input-senha"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div className="input-senha-container">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Crie uma senha"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                className="input-senha input-senha-olho"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="botao-olho"
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
            <div className="input-senha-container">
              <input
                type={mostrarConfirmar ? 'text' : 'password'}
                placeholder="Repita a senha"
                value={form.confirmar}
                onChange={(e) => setForm({ ...form, confirmar: e.target.value })}
                className="input-senha input-senha-olho"
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                className="botao-olho"
              >
                {mostrarConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            style={{
              backgroundColor: '#1565c0',
              color: '#fff',
              borderRadius: '25px',
              padding: '10px 20px',
              fontWeight: 'bold',
              border: 'none',
              width: '60%',
              marginTop: '20px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
            className="hover:bg-[#0d47a1]"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
}