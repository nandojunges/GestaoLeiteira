import { buscarTodos, adicionarItem, atualizarItem, excluirItem, buscarPorId, buscarPorNumero } from '../utils/backendApi';
import { atualizarEstruturaAnimais } from '../pages/Animais/utilsAnimais';

export async function buscarTodosAnimais() {
  const dados = await buscarTodos('animais');
  return atualizarEstruturaAnimais(dados);
}

export async function buscarAnimalPorId(id) {
  if (!id) return null;
  return buscarPorId('animais', id);
}

export async function buscarAnimalPorNumero(numero) {
  if (!numero) return null;
  return buscarPorNumero('animais', numero);
}

export async function salvarAnimais(animais) {
  const resultados = await Promise.all(
    (animais || []).map((a) =>
      a.id ? atualizarItem('animais', { ...a, id: a.id }) : adicionarItem('animais', a)
    )
  );
  window.dispatchEvent(new Event('animaisAtualizados'));
  return resultados;
}

export async function atualizarAnimalNoBanco(animal) {
  if (!animal || animal.id === undefined) return null;
  return atualizarItem('animais', { ...animal, id: animal.id });
}

export async function excluirAnimal(id) {
  if (!id) return;
  await excluirItem('animais', id);
  window.dispatchEvent(new Event('animaisAtualizados'));
}

export async function salvarSaidaAnimal(saida) {
  await adicionarItem('saidasAnimais', saida);
  window.dispatchEvent(new Event('saidasAtualizadas'));
}
