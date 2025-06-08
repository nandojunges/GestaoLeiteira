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

// 🔧 PEV configurado (dias). Se não existir no localStorage, assume 45 dias
export const obterAjustePEV = () => {
  const cfg = JSON.parse(localStorage.getItem('configPEV') || '{}');
  return parseInt(cfg.diasPEV) || 45;
};

// ✅ Determina se a vaca está liberada ou ainda no PEV de acordo com o DEL
export const getStatusVaca = (del) => {
  const ajustePEV = obterAjustePEV();
  return del >= ajustePEV ? 'Liberada' : 'No PEV';
};

// ✅ Ações permitidas conforme o DEL
export const getAcoesDisponiveis = (del) => {
  const ajustePEV = obterAjustePEV();
  if (del < ajustePEV) {
    return [
      'Registrar metrite',
      'Registrar endometrite',
      'Registrar infecção subclínica',
      'Registrar cio natural (observação)',
      'Iniciar pré-sincronização',
    ];
  }
  return [
    'Iniciar Protocolo IATF',
    'Iniciar sincronização de cio',
    'Registrar cio natural',
    'Registrar inseminação',
    'Registrar tratamento clínico',
    'Registrar retorno ao cio',
  ];
};

// ✅ Filtra animais com status reprodutivo ativo
export const filtrarAnimaisAtivos = (animais) => {
  return (animais || []).filter(a => {
    const status = (a.statusReprodutivo || '').toLowerCase();
    if (['seca', 'vendida', 'inativo'].includes(status)) return false;
    return true;
  });
};
