import { useEffect, useRef, useState } from 'react';

export default function NavegacaoPrincipal({ abaAtiva, setAbaAtiva }) {
  const usuario = { tipo: 'funcionario' }; // pode mudar para 'admin' se quiser testar

  const abas = [
    { id: 'inicio', label: '🏠 INÍCIO', title: 'Página inicial', visivelPara: ['admin', 'funcionario'] },
    { id: 'animais', label: '🐄 ANIMAIS', title: 'Controle de animais', visivelPara: ['admin', 'funcionario'] },
    { id: 'bezerras', label: '🍼 BEZERRAS', title: 'Controle das bezerras', visivelPara: ['admin', 'funcionario'] },
    { id: 'reproducao', label: '🧬 REPRODUÇÃO', title: 'Reprodução e fertilidade', visivelPara: ['admin', 'funcionario'] },
    { id: 'leite', label: '🧀 LEITE', title: 'Controle leiteiro', visivelPara: ['admin', 'funcionario'] },
    { id: 'consumoreposicao', label: '📦 CONSUMO E REPOSIÇÃO', title: 'Gestão de estoque', visivelPara: ['admin', 'funcionario'] },
    { id: 'financeiro', label: '💰 FINANCEIRO', title: 'Relatórios financeiros', visivelPara: ['admin', 'funcionario'] },
    { id: 'calendario', label: '📅 CALENDÁRIO', title: 'Agenda de atividades', visivelPara: ['admin', 'funcionario'] },
    { id: 'ajustes', label: '⚙️ AJUSTES', title: 'Configurações do sistema', visivelPara: ['admin', 'funcionario'] },
  ].filter(aba => aba.visivelPara.includes(usuario.tipo));

  const [underlineStyle, setUnderlineStyle] = useState({});
  const containerRef = useRef();

  useEffect(() => {
    const salva = localStorage.getItem('ultimaAba');
    if (salva) setAbaAtiva(salva);
  }, []);

  useEffect(() => {
    localStorage.setItem('ultimaAba', abaAtiva);
  }, [abaAtiva]);

  useEffect(() => {
    const container = containerRef.current;
    const btns = container.querySelectorAll('button');
    const ativo = Array.from(btns).find((btn) =>
      btn.getAttribute('data-id') === abaAtiva
    );
    if (ativo) {
      setUnderlineStyle({
        width: `${ativo.offsetWidth}px`,
        left: `${ativo.offsetLeft}px`,
      });
    }
  }, [abaAtiva]);

  return (
    <div className="bg-gray-200 shadow-inner w-full">
      <div className="relative max-w-[1600px] mx-auto px-4 py-6" ref={containerRef}>
        <nav className="flex flex-wrap justify-center gap-2">
          {abas.map((aba) => (
            <button
              key={aba.id}
              data-id={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              title={aba.title}
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                letterSpacing: '0.3px',
              }}
              className={`min-w-[150px] h-[38px] px-6 text-[16px] rounded-2xl transition-all duration-300 ease-in-out transform
                ${
                  abaAtiva === aba.id
                    ? 'bg-white text-[#1e3a8a] shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-white hover:text-[#1e3a8a] hover:shadow-lg hover:scale-105'
                } cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 relative`}
            >
              <span className={abaAtiva === aba.id ? 'animate-bounce' : ''}>
                {aba.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Underline animado */}
        <div
          className="absolute bottom-5 h-[3px] bg-[#1e3a8a] rounded-full transition-all duration-300 ease-in-out"
          style={{ ...underlineStyle }}
        ></div>
      </div>
    </div>
  );
}
