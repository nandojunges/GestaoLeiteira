export const carregarAnimaisReprodutivos = () => {
  const animais = JSON.parse(localStorage.getItem('animais') || '[]');

  const hoje = new Date();

  const liberadas = animais.filter(vaca => {
    const ultimaIA = new Date(vaca.ultimaIA || 0);
    const diasDesdeUltimaIA = Math.ceil((hoje - ultimaIA) / (1000 * 60 * 60 * 24));
    return diasDesdeUltimaIA > 45; // exemplo configurável
  });

  return { liberadas };
};
