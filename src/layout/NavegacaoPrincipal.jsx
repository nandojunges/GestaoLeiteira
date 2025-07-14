import { useEffect, useRef, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ConfiguracaoContext } from '../context/ConfiguracaoContext';
import jwtDecode from 'jwt-decode';

export default function NavegacaoPrincipal() {
  const navigate = useNavigate();
  const location = useLocation();
  const abaAtiva = location.pathname.split('/')[1] || 'inicio';
  const { config } = useContext(ConfiguracaoContext);

  let tipoUsuario = 'funcionario'; // padrão
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const decoded = jwtDecode(token);
      console.log('🧩 Token decodificado:', decoded);

      // Captura o tipo do usuário com base em diferentes nomes possíveis
      tipoUsuario = decoded?.perfil || decoded?.tipo || decoded?.role || 'funcionario';
    } catch (error) {
      console.warn('⚠️ Token inválido ou corrompido:', error);
    }
  } else {
    console.warn('⚠️ Nenhum token encontrado no localStorage');
  }

  const abas = [
    { id: 'inicio', label: 'INÍCIO', icone: '/icones/home.png', title: 'Página inicial', visivelPara: ['admin', 'funcionario'] },
    { id: 'animais', label: 'ANIMAIS', icone: '/icones/plantel.png', title: 'Controle de animais', visivelPara: ['admin', 'funcionario'] },
    { id: 'bezerras', label: 'BEZERRAS', icone: '/icones/bezerra.png', title: 'Controle das bezerras', visivelPara: ['admin', 'funcionario'] },
    { id: 'reproducao', label: 'REPRODUÇÃO', icone: '/icones/reproducao.png', title: 'Reprodução e fertilidade', visivelPara: ['admin', 'funcionario'] },
    { id: 'leite', label: 'LEITE', icone: '/icones/leite.png', title: 'Controle leiteiro', visivelPara: ['admin', 'funcionario'] },
    { id: 'saude', label: 'SAÚDE', icone: '/icones/saude.png', title: 'Controle sanitário', visivelPara: ['admin', 'funcionario'] },
    { id: 'consumo', label: 'CONSUMO E REPOSIÇÃO', icone: '/icones/estoque.png', title: 'Gestão de estoque', visivelPara: ['admin', 'funcionario'] },
    { id: 'financeiro', label: 'FINANCEIRO', icone: '/icones/financeiro.png', title: 'Relatórios financeiros', visivelPara: ['admin', 'funcionario'] },
    { id: 'calendario', label: 'CALENDÁRIO', icone: '/icones/calendario.png', title: 'Agenda de atividades', visivelPara: ['admin', 'funcionario'] },
    { id: 'ajustes', label: 'AJUSTES', icone: '/icones/indicadores.png', title: 'Configurações do sistema', visivelPara: ['admin', 'funcionario'] },
    { id: 'planos', label: 'PLANOS', icone: '/icones/indicadores.png', title: 'Escolher plano', visivelPara: ['admin', 'funcionario'] },
    { id: 'admin', label: 'ADMIN', icone: '/icones/indicadores.png', title: 'Painel administrativo', visivelPara: ['admin'] },
    { id: 'painel-admin-planos', label: 'PLANOS', icone: '/icones/indicadores.png', title: 'Gestão de planos', visivelPara: ['admin'] },
    { id: 'relatorio-admin', label: 'RELATÓRIOS', icone: '/icones/relatorios.png', title: 'Relatórios administrativos', visivelPara: ['admin'] },
  ].filter((aba) => aba.visivelPara.includes(tipoUsuario));

  const containerRef = useRef();

  useEffect(() => {
    window.dispatchEvent(new Event('dadosUsuarioAtualizados'));
  }, [abaAtiva]);

  return (
    <div
      className="shadow-inner w-full"
      style={{
        backgroundColor: '#1c3586',
        padding: '12px 8px',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <div className="relative max-w-[1600px] mx-auto" ref={containerRef}>
        <div style={{ position: 'absolute', top: -2, right: -2 }}>
          <button
            onClick={() => navigate('/logout')}
            title="Sair do sistema"
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              transition: 'background-color 0.6s ease, opacity 0.6s ease',
              opacity: 1,
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#b91c1c';
              e.target.style.opacity = 0.8;
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#dc2626';
              e.target.style.opacity = 1;
            }}
          >
            Sair
          </button>
        </div>

        <nav
          style={{
            display: 'flex',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {abas.map((aba) => {
            const isAtiva = abaAtiva === aba.id;
            return (
              <div
                key={aba.id}
                data-id={aba.id}
                onClick={() => navigate(`/${aba.id}`)}
                title={aba.title}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '100px',
                  flexShrink: 0,
                  cursor: 'pointer',
                  borderRadius: '14px',
                  padding: '10px 6px',
                  textAlign: 'center',
                  backgroundColor: isAtiva ? 'white' : 'transparent',
                  boxShadow: isAtiva ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none',
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <img
                  alt={aba.label}
                  src={aba.icone}
                  style={{
                    width: isAtiva
                      ? `${(config?.tamanhoIcones?.principal || 65) + 15}px`
                      : `${config?.tamanhoIcones?.principal || 65}px`,
                    height: isAtiva
                      ? `${(config?.tamanhoIcones?.principal || 65) + 15}px`
                      : `${config?.tamanhoIcones?.principal || 65}px`,
                    objectFit: 'contain',
                    transition: 'all 0.2s ease-in-out',
                  }}
                />
                <span
                  style={{
                    marginTop: '8px',
                    fontSize: '15px',
                    fontWeight: isAtiva ? '700' : '600',
                    color: isAtiva ? '#000' : '#fff',
                    textAlign: 'center',
                  }}
                >
                  {aba.label}
                </span>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
