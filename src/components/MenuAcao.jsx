import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export default function MenuAcao({ opcoes = [], className = '' }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fechar = (e) => {
      if (e.type === 'keydown' && e.key !== 'Escape') return;
      if (ref.current && !ref.current.contains(e.target)) setAberto(false);
      if (e.type === 'keydown' && e.key === 'Escape') setAberto(false);
    };
    document.addEventListener('click', fechar);
    document.addEventListener('keydown', fechar);
    return () => {
      document.removeEventListener('click', fechar);
      document.removeEventListener('keydown', fechar);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setAberto((a) => !a)}
        className="p-1 rounded-full bg-white text-gray-600 shadow hover:bg-gray-50"
      >
        <MoreVertical size={16} />
      </button>
      {aberto && (
        <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg text-sm min-w-[160px] whitespace-nowrap z-10">
          {opcoes.map((op, idx) => (
            <button
              key={idx}
              onClick={() => {
                setAberto(false);
                op.onClick();
              }}
              className="block w-full text-left px-3 py-1.5 hover:bg-gray-100"
            >
              {op.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
