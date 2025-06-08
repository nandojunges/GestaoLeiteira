export default function gerarEventosCalendario() {
  const eventos = [];

  const toISO = (data) => {
    if (!data) return null;
    if (data.includes('-')) return data;
    const [d, m, a] = data.split('/');
    if (!d || !m || !a) return null;
    return `${a.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  };

  Object.keys(localStorage).forEach((k) => {
    if (k.startsWith('parto_')) {
      const numero = k.replace('parto_', '');
      const registro = JSON.parse(localStorage.getItem(k) || 'null');
      if (registro?.data) {
        eventos.push({
          title: `Parto - Vaca ${numero}`,
          date: toISO(registro.data),
          tipo: 'parto',
          color: '#6C63FF'
        });
      }
    }
    if (k.startsWith('secagem_')) {
      const numero = k.replace('secagem_', '');
      const registro = JSON.parse(localStorage.getItem(k) || 'null');
      if (registro?.dataSecagem) {
        eventos.push({
          title: `Secagem - Vaca ${numero}`,
          date: toISO(registro.dataSecagem),
          tipo: 'secagem',
          color: '#8E44AD'
        });
      }
    }
  });

  const animais = JSON.parse(localStorage.getItem('animais') || '[]');
  animais.forEach((a) => {
    if (a.dataPrevistaParto) {
      const [d, m, y] = a.dataPrevistaParto.split('/').map(Number);
      const data = new Date(y, m - 1, d);
      data.setDate(data.getDate() - 21);
      eventos.push({
        title: `Pré-parto - ${a.numero}`,
        date: data.toISOString().split('T')[0],
        tipo: 'preparto',
        color: '#2980B9'
      });
    }
  });

  const vacinas = JSON.parse(localStorage.getItem('manejosSanitarios') || '[]');
  vacinas.forEach((v) => {
    const data = toISO(v.proximaAplicacao || v.dataInicial);
    if (data) {
      eventos.push({
        title: `Vacina - ${v.produto}`,
        date: data,
        tipo: 'vacina',
        color: '#27AE60'
      });
    }
  });

  const exames = JSON.parse(localStorage.getItem('examesSanitarios') || '[]');
  exames.forEach((e) => {
    const data = toISO(e.validadeCertificado || e.proximaObrigatoriedade);
    if (data) {
      eventos.push({
        title: `Exame - ${e.tipo || e.nome}`,
        date: data,
        tipo: 'exame',
        color: '#F39C12'
      });
    }
  });

  const ciclos = JSON.parse(localStorage.getItem('ciclosLimpeza') || '[]');
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
    ciclos.forEach((c) => {
      if (c.diasSemana?.includes(d.getDay())) {
        eventos.push({
          title: `Limpeza - ${c.nome}`,
          date: d.toISOString().split('T')[0],
          tipo: 'limpeza',
          color: '#3498DB'
        });
      }
    });
  }

  const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
  produtos.forEach((p) => {
    if (p.validade) {
      const data = toISO(p.validade);
      if (data) {
        eventos.push({
          title: `Validade - ${p.nomeComercial}`,
          date: data,
          tipo: 'estoque',
          color: '#E74C3C'
        });
      }
    }
    if (p.alertaEstoque && p.alertaEstoque.match(/Previsto esgotar em (\d+)/)) {
      const dias = parseInt(p.alertaEstoque.match(/Previsto esgotar em (\d+)/)[1]);
      const data = new Date();
      data.setDate(data.getDate() + dias);
      eventos.push({
        title: `⚠️ Produto ${p.nomeComercial} esgotando`,
        date: data.toISOString().split('T')[0],
        tipo: 'estoque',
        color: '#E74C3C'
      });
    }
  });

  return eventos;
}
