import { createContext, useState, useEffect } from 'react';
import { buscarTodos, adicionarItem, atualizarItem, excluirItem } from '../utils/backendApi';

export const AnimalContext = createContext();

export function AnimalProvider({ children }) {
  const [animais, setAnimais] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setIsLoading(true);
      try {
        const data = await buscarTodos('animais');
        setAnimais(data || []);
      } catch (err) {
        console.error('Erro ao buscar animais:', err);
      } finally {
        setIsLoading(false);
      }
    };
    carregar();
  }, []);

  const addAnimal = async (novo) => {
    const salvo = await adicionarItem('animais', { status: 'ativo', ...novo });
    if (salvo) setAnimais((atual) => [...atual, salvo]);
    return salvo;
  };

  const editAnimal = async (id, dados) => {
    const atualizado = await atualizarItem('animais', { id, ...dados });
    if (atualizado) setAnimais((atual) => atual.map((a) => (a.id === id ? atualizado : a)));
    return atualizado;
  };

  const deleteAnimal = async (id) => {
    await excluirItem('animais', id);
    setAnimais((atual) => atual.filter((a) => a.id !== id));
  };

  const restoreAnimal = async (dados) => {
    return addAnimal(dados);
  };

  return (
    <AnimalContext.Provider
      value={{ animais, setAnimais, addAnimal, editAnimal, deleteAnimal, restoreAnimal, isLoading }}
    >
      {children}
    </AnimalContext.Provider>
  );
}
