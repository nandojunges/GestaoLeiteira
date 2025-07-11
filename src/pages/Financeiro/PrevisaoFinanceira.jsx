export default function PrevisaoFinanceira({ movs = [] }) {
  const listaSegura = Array.isArray(movs) ? movs : [];
  if (!listaSegura.length) {
    return (
      <div className="bg-white rounded-xl shadow p-6 mt-6 text-center text-gray-500">
        Sem dados para exibir
      </div>
    );
  }

  const ano = new Date().getFullYear().toString();
  const saidas = listaSegura.filter(m => m.tipo === 'Saída' && m.data.startsWith(ano));
  const meses = new Set(saidas.map(m => m.data.slice(0,7))).size || 1;

  const porCat = {};
  saidas.forEach(m => {
    const cat = m.categoria || 'Outros';
    const sub = m.subcategoria || 'Outros';
    porCat[cat] = porCat[cat] || {};
    porCat[cat][sub] = (porCat[cat][sub] || 0) + m.valor;
  });

  const linhas = [];
  Object.keys(porCat).forEach(cat => {
    Object.keys(porCat[cat]).forEach(sub => {
      const realizado = porCat[cat][sub];
      const media = realizado / meses;
      const previsto = media * 12;
      const diff = previsto - realizado;
      const status = diff >= 0 ? 'Positivo' : 'Negativo';
      linhas.push({ categoria: cat, subcategoria: sub, previsto, realizado, diff, status });
    });
  });

  const formatar = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const cor = s => s === 'Positivo' ? 'text-green-600' : 'text-red-500';

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">
      <h3 className="text-xl font-semibold mb-4">Previsão Financeira</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="p-2">Categoria</th>
              <th className="p-2">Subcategoria</th>
              <th className="p-2">Previsto</th>
              <th className="p-2">Realizado</th>
              <th className="p-2">Diferença</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l,i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{l.categoria}</td>
                <td className="p-2">{l.subcategoria}</td>
                <td className="p-2">{formatar(l.previsto)}</td>
                <td className="p-2">{formatar(l.realizado)}</td>
                <td className="p-2">{formatar(l.diff)}</td>
                <td className={`p-2 font-semibold ${cor(l.status)}`}>{l.status === 'Positivo' ? '📈' : '📉'} {l.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
