import React, { useEffect, useRef, useState } from 'react';
import { formatarDataDigitada } from '../../pages/Animais/utilsAnimais.js';

export default function ModalTratamento({ dados, onSalvar, onFechar }) {
  const [data, setData] = useState(dados?.data || '');
  const [animal, setAnimal] = useState(dados?.animal || '');
  const [medicacao, setMedicacao] = useState(dados?.medicacao || '');
  const [duracao, setDuracao] = useState(dados?.duracao || '');
  const [carencia, setCarencia] = useState(dados?.carencia || '');
  const [aplicador, setAplicador] = useState(dados?.aplicador || '');
  const [observacoes, setObservacoes] = useState(dados?.observacoes || '');

  const refs = useRef([]);

  useEffect(() => {
    refs.current[0]?.focus();
    const esc = (e) => e.key === 'Escape' && onFechar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onFechar]);

  const handleEnter = (idx) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      refs.current[idx + 1]?.focus();
    }
  };

  const salvar = () => {
    if (!animal || !data || !medicacao) return;
    onSalvar?.({ data, animal, medicacao, duracao, carencia, aplicador, observacoes });
    onFechar?.();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onFechar}>
      <div
        className="bg-white p-4 rounded-lg w-full max-w-md space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-center font-semibold text-blue-900">Novo Tratamento</h3>
        <input
          ref={(el) => (refs.current[0] = el)}
          value={data}
          onChange={(e) => setData(formatarDataDigitada(e.target.value))}
          onKeyDown={handleEnter(0)}
          placeholder="Data"
          className="w-full border p-2 rounded"
        />
        <input
          ref={(el) => (refs.current[1] = el)}
          value={animal}
          onChange={(e) => setAnimal(e.target.value)}
          onKeyDown={handleEnter(1)}
          placeholder="Animal"
          className="w-full border p-2 rounded"
        />
        <input
          ref={(el) => (refs.current[2] = el)}
          value={medicacao}
          onChange={(e) => setMedicacao(e.target.value)}
          onKeyDown={handleEnter(2)}
          placeholder="Medicação"
          className="w-full border p-2 rounded"
        />
        <input
          ref={(el) => (refs.current[3] = el)}
          value={duracao}
          onChange={(e) => setDuracao(e.target.value)}
          onKeyDown={handleEnter(3)}
          placeholder="Duração"
          className="w-full border p-2 rounded"
        />
        <input
          ref={(el) => (refs.current[4] = el)}
          value={carencia}
          onChange={(e) => setCarencia(e.target.value)}
          onKeyDown={handleEnter(4)}
          placeholder="Carência"
          className="w-full border p-2 rounded"
        />
        <input
          ref={(el) => (refs.current[5] = el)}
          value={aplicador}
          onChange={(e) => setAplicador(e.target.value)}
          onKeyDown={handleEnter(5)}
          placeholder="Aplicador"
          className="w-full border p-2 rounded"
        />
        <textarea
          ref={(el) => (refs.current[6] = el)}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          onKeyDown={handleEnter(6)}
          placeholder="Observações"
          className="w-full border p-2 rounded"
        />
        <div className="flex justify-end gap-2">
          <button className="bg-gray-300 rounded px-4 py-1" onClick={onFechar}>
            Cancelar
          </button>
          <button className="bg-blue-500 text-white rounded px-4 py-1" onClick={salvar}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
