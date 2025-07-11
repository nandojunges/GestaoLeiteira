import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CORES = ['#e74c3c', '#bdc3c7', '#2ecc71', '#3498db', '#95a5a6'];

export default function GraficoFinanceiro({ movs = [] }) {
  const listaSegura = Array.isArray(movs) ? movs : [];
  if (!listaSegura.length) {
    return (
      <div className="bg-white rounded-xl shadow p-6 mt-6 text-center text-gray-500">
        Sem dados para exibir
      </div>
    );
  }

  const porCategoria = {};
  listaSegura.filter(m => m.tipo === 'Saída').forEach(m => {
    porCategoria[m.categoria] = (porCategoria[m.categoria] || 0) + m.valor;
  });
  const dadosPie = Object.keys(porCategoria).map(c => ({ name: c, value: porCategoria[c] }));

  const datas = Array.from(new Set(listaSegura.map(m => m.data))).sort();
  let saldo = 0;
  const dadosLine = datas.map(d => {
    const entrada = listaSegura.filter(m => m.data === d && m.tipo === 'Entrada').reduce((s,m) => s+m.valor,0);
    const saida = listaSegura.filter(m => m.data === d && m.tipo === 'Saída').reduce((s,m) => s+m.valor,0);
    saldo += entrada - saida;
    return { data: d.slice(5), saldo };
  });

  return (
    <div className="grid md:grid-cols-2 gap-4 mt-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold mb-2">Despesas por Categoria</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={dadosPie} dataKey="value" nameKey="name" outerRadius={100} label>
              {dadosPie.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
            </Pie>
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold mb-2">Evolução do Saldo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dadosLine}>
            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="saldo" stroke="#1e3a8a" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
