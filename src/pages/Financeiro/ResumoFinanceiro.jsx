import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ResumoFinanceiro({ movs = [] }) {
  const listaSegura = Array.isArray(movs) ? movs : [];
  if (!listaSegura.length) {
    return (
      <div className="bg-white rounded-xl shadow p-6 mb-6 text-center text-gray-500">
        Sem dados para exibir
      </div>
    );
  }

  const valorEntradasCalc = listaSegura
    .filter(m => m.tipo === 'Entrada')
    .reduce((s, m) => s + m.valor, 0);
  const valorSaidasCalc = listaSegura
    .filter(m => m.tipo === 'Saída')
    .reduce((s, m) => s + m.valor, 0);
  const totalEntradas = parseFloat(valorEntradasCalc || 0);
  const totalSaidas = parseFloat(valorSaidasCalc || 0);
  const saldo = totalEntradas - totalSaidas;

  const grupos = listaSegura.reduce((acc, m) => {
    const mes = m.data.slice(0,7);
    if(!acc[mes]) acc[mes] = { Entrada:0, Saída:0 };
    acc[mes][m.tipo] += m.valor;
    return acc;
  }, {});
  const dadosGrafico = Object.keys(grupos).sort().map(mes => ({
    mes: mes.slice(5),
    ...grupos[mes]
  }));

  const porCategoria = listaSegura.reduce((acc, m) => {
    const cat = m.categoria || 'Outros';
    acc[cat] = (acc[cat] || 0) + m.valor;
    return acc;
  }, {});
  const dadosPizza = Object.keys(porCategoria).map(c => ({ name: c, value: porCategoria[c] }));
  const cores = ['#4ade80', '#60a5fa', '#fcd34d', '#f87171', '#a78bfa', '#34d399'];

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Resumo Financeiro</h2>
      <div className="grid grid-cols-3 gap-4 text-center mb-6">
        <div>
          <div className="text-sm text-gray-500">Total de Entradas</div>
          <div className="text-green-600 text-lg font-bold">R$ {totalEntradas.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Total de Saídas</div>
          <div className="text-red-500 text-lg font-bold">R$ {totalSaidas.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Saldo</div>
          <div className="text-blue-700 text-lg font-bold">R$ {saldo.toFixed(2)}</div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-8">
        <div style={{ width: '320px', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={dadosGrafico} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend verticalAlign="bottom" />
              <Bar dataKey="Entrada" fill="#2ecc71" />
              <Bar dataKey="Saída" fill="#e74c3c" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ width: '320px', height: 260 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie dataKey="value" data={dadosPizza} label outerRadius={90}>
                {dadosPizza.map((_, i) => (
                  <Cell key={i} fill={cores[i % cores.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
