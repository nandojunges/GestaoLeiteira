import React from 'react';
import {
  ListChecks,
  PlusCircle,
  ArrowRightCircle,
  Ban,
  FileText,
  UploadCloud,
  DownloadCloud,
} from 'lucide-react';

// 🎨 Personalização central
const estilos = {
  larguraExpandida: '130px',       // 🟦 Largura quando expandido
  larguraRecolhida: '50px',        // 🟦 Largura quando recolhido
  alturaBotao: '50px',             // 🟩 Altura do botão
  espacoEntreBotoes: '10px',       // 🟥 Espaço vertical entre botões
  iconeExpandido: 24,              // 🟨 Tamanho ícone expandido
  iconeRecolhido: 36,              // 🟨 Tamanho ícone recolhido
  corAtivo: 'bg-white text-blue-900 shadow-md', // 🔷 Cor do botão ativo
  corInativo: 'bg-gray-100 text-black',         // 🔷 Cor padrão
  fonte: 'Poppins, sans-serif',
};

// Ícones
const icones = {
  todos: <ListChecks />,
  entrada: <PlusCircle />,
  saida: <ArrowRightCircle />,
  inativas: <Ban />,
  relatorio: <FileText />,
  importar: <UploadCloud />,
  exportar: <DownloadCloud />,
};

export default function ModalLateralAnimais({ abaAtiva, setAbaAtiva, expandido }) {
  const botoes = [
    { id: 'todos', label: 'Todos os Animais' }, // Novo botão no topo
    { id: 'entrada', label: 'Entrada de Animais' },
    { id: 'saida', label: 'Saída de Animais' },
    { id: 'inativas', label: 'Inativas' },
    { id: 'relatorio', label: 'Relatórios' },
    { id: 'importar', label: 'Importar Dados' },
    { id: 'exportar', label: 'Exportar Dados' },
  ];

  return (
    <div
      className="flex flex-col pt-6 px-2"
      style={{ gap: estilos.espacoEntreBotoes }}
    >
      {botoes.map((btn) => {
        const ativo = abaAtiva === btn.id;

        return (
          <button
            key={btn.id}
            onClick={() => setAbaAtiva(btn.id)}
            title={btn.label}
            className={`flex items-center group transition-all duration-300 ease-in-out transform
              ${expandido ? 'rounded-r-full' : 'rounded-r-full'}
              ${ativo ? estilos.corAtivo : estilos.corInativo}
              hover:bg-white hover:text-blue-900 hover:shadow-md`}
            style={{
              height: estilos.alturaBotao,
              width: expandido ? estilos.larguraExpandida : estilos.larguraRecolhida,
              minWidth: '44px',
              justifyContent: expandido ? 'flex-start' : 'center',
              borderTopLeftRadius: '0px',  // Lado esquerdo reto
              borderBottomLeftRadius: '0px',
              borderTopRightRadius: '9999px',
              borderBottomRightRadius: '9999px',
              paddingLeft: expandido ? '12px' : '0',
              paddingRight: expandido ? '12px' : '0',
              fontFamily: estilos.fonte,
              fontSize: '14px',
              position: 'relative',
            }}
          >
            {/* Linha lateral de destaque no botão ativo */}
            {ativo && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-blue-800" />
            )}

            {/* Ícone */}
            <span
              className="flex items-center justify-center"
              style={{
                transform: expandido ? 'scale(1)' : 'scale(1.2)',
              }}
            >
              {React.cloneElement(icones[btn.id], {
                size: expandido ? estilos.iconeExpandido : estilos.iconeRecolhido,
              })}
            </span>

            {/* Texto com transição e negrito no hover */}
            <span
              className="ml-2 overflow-hidden transition-all duration-300 ease-in-out group-hover:font-bold"
              style={{
                opacity: expandido ? 1 : 0,
                maxWidth: expandido ? '160px' : '0px',
                transform: expandido ? 'translateX(0)' : 'translateX(-8px)',
                fontWeight: ativo ? 700 : undefined,
              }}
            >
              {btn.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
