import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '../../api';

export default function VerificarEmail() {
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [tempo, setTempo] = useState(180);
  const [podeReenviar, setPodeReenviar] = useState(false);

  useEffect(() => {
    const salvo = localStorage.getItem('emailCadastro');
    if (salvo) {
      setEmail(salvo);
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setTempo((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setPodeReenviar(true), 30000);
    return () => clearTimeout(t);
  }, []);

  const formatarTempo = (seg) => {
    const m = String(Math.floor(seg / 60)).padStart(2, '0');
    const s = String(seg % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const reenviarCodigo = async () => {
    const dados = localStorage.getItem('dadosCadastro');
    if (!dados) {
      alert('Dados para reenviar não encontrados.');
      return;
    }
    try {
      await api.post('/auth/register', JSON.parse(dados));
      setTempo(180);
      setPodeReenviar(false);
      setTimeout(() => setPodeReenviar(true), 30000);
      alert('Código reenviado. Verifique seu e-mail.');
    } catch (err) {
      alert('Erro ao reenviar código.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      alert('Email não encontrado. Faça o cadastro novamente.');
      return;
    }

    try {
      const res = await api.post('/auth/verify-code', {
        email: email.trim().toLowerCase(),
        codigo: codigo.trim(),
      });

      if (res.data?.sucesso) {
        alert('E-mail verificado com sucesso!');
        if (res.data.token) {
          localStorage.setItem('tokenCadastro', res.data.token);
          navigate('/escolher-plano-finalizar');
        } else {
          navigate('/login');
        }
      } else {
        alert('Código incorreto ou expirado.');
      }
    } catch (err) {
      console.error('Erro ao verificar:', err);
      alert('Erro na verificação.');
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
        <p className="text-center mb-2">
          Enviamos um código para {email}. Isso pode levar alguns segundos...
        </p>
        {!podeReenviar && (
          <div className="flex justify-center mb-2">
            <Loader2 className="animate-spin" />
          </div>
        )}
        {erro && (
          <div className="mb-2 text-red-600 text-sm text-center">{erro}</div>
        )}
        <div className="text-center mb-2">Tempo restante: {formatarTempo(tempo)}</div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            placeholder="Código"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              fontSize: '0.95rem',
            }}
          />
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
            Verificar
          </button>
        </form>
        {podeReenviar && (
          <button onClick={reenviarCodigo} className="mt-2 text-sm text-blue-600 hover:underline">Reenviar código</button>
        )}
      </div>
    </div>
  );
}