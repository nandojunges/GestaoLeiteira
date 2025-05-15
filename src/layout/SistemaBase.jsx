import { useState } from 'react';
import NavegacaoPrincipal from './NavegacaoPrincipal';

import AppTarefas from '../pages/AppTarefas/index.jsx';
import Animais from '../pages/Animais/index.jsx';
import Bezerras from '../pages/Bezerras/index.jsx';
import Reproducao from '../pages/Reproducao/index.jsx';
import Leite from '../pages/Leite/index.jsx';
import Estoque from '../pages/Estoque/index.jsx';
import Financeiro from '../pages/Financeiro/index.jsx';
import Calendario from '../pages/Calendario/index.jsx'; // ✅ IMPORTADO
import Ajustes from '../pages/Ajustes/index.jsx';
import "../styles/botoes.css";
import "../styles/tabelaModerna.css";

export default function SistemaBase() {
  const [abaAtiva, setAbaAtiva] = useState('inicio');

  const renderizarConteudo = () => {
    if (abaAtiva === 'inicio') return <AppTarefas />;
    if (abaAtiva === 'animais') return <Animais />;
    if (abaAtiva === 'bezerras') return <Bezerras />;
    if (abaAtiva === 'reproducao') return <Reproducao />;
    if (abaAtiva === 'leite') return <Leite />;
    if (abaAtiva === 'estoque') return <Estoque />;
    if (abaAtiva === 'financeiro') return <Financeiro />;
    if (abaAtiva === 'calendario') return <Calendario />; // ✅ ADICIONADO
    if (abaAtiva === 'ajustes') return <Ajustes />;
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
      <header className="bg-[#1e3a8a] w-full shadow-md">
        <div className="flex flex-col items-center justify-center text-center px-6 py-8">
          <h1
            className="text-3xl sm:text-4xl font-extrabold drop-shadow-md text-white"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            🐄 Sistema de Gestão Leiteira
          </h1>
        </div>

        <div className="px-4 pb-4">
          <NavegacaoPrincipal abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} contextoAzul />
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {renderizarConteudo()}
      </main>
    </div>
  );
}
