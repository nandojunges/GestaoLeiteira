import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export default function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [emailEnviado, setEmailEnviado] = useState(false);
  const [erro, setErro] = useState('');
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const navigate = useNavigate();

  const enviarCodigo = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      await api.post('/auth/forgot-password', { email });
      setEmailEnviado(true);
    } catch (err) {
      setErro('Erro ao enviar e-mail');
    }
  };

  const confirmarCodigo = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      await api.post('/auth/verify-code', {
        email: email.trim().toLowerCase(),
        codigo: codigo.trim(),
        senha: novaSenha,
      });
      navigate('/login');
    } catch (err) {
      setErro('Código inválido');
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
        <h2 className="text-xl font-bold text-center mb-4">Recuperar Senha</h2>
        {erro && <div className="mb-2 text-red-600 text-sm text-center">{erro}</div>}
          {!emailEnviado ? (
            <form onSubmit={enviarCodigo} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="input-senha-container">
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-senha"
                  />
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
                Recuperar Senha
              </button>
            </form>
          ) : (
            <form onSubmit={confirmarCodigo} className="flex flex-col gap-4">
              <p className="text-center text-green-700">Código enviado ao e-mail</p>
              <div className="input-senha-container">
                <input
                  type="text"
                  placeholder="Código"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="input-senha"
                />
              </div>
                <div className="input-senha-container">
                  <input
                    type={mostrarNovaSenha ? 'text' : 'password'}
                    placeholder="Nova senha"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="input-senha input-senha-olho"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                    className="botao-olho"
                  >
                    {mostrarNovaSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
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
                Resetar Senha
              </button>
            </form>
          )}
      </div>
    </div>
  );
}