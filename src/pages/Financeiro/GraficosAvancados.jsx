import { PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, ResponsiveContainer } from 'recharts';

export default function GraficosAvancados({ movs = [] }) {
  const listaSegura = Array.isArray(movs) ? movs : [];
  if (!listaSegura.length) {
    return (
      <div className="bg-white rounded-xl shadow p-6 mt-6 text-center text-gray-500">
        Sem dados para exibir
      </div>
    );
  }

  const saidas = listaSegura.filter(m => m.tipo === 'Saída');
  const mapSub = (s = '') => {
    const p = s.toLowerCase();
    if (p.includes('antib')) return 'Antibióticos';
    if (p.includes('sanit')) return 'Sanitizantes';
    if (p.includes('adit')) return 'Aditivos';
    if (p.includes('horm')) return 'Hormônios';
    if (p.includes('silagem')) return 'Silagem';
    return s || 'Outros';
  };
  const porSub = saidas.reduce((acc, m) => {
    const chave = mapSub(m.subcategoria);
    acc[chave] = (acc[chave] || 0) + m.valor;
    return acc;
  }, {});
  const dadosPie = Object.keys(porSub).map(k => ({ name: k, value: porSub[k] }));

  const porMes = {};
  listaSegura.forEach(m => {
    const mes = m.data.slice(0, 7);
    if (!porMes[mes]) porMes[mes] = { mes, Entrada: 0, Saida: 0 };
    if (m.tipo === 'Entrada') porMes[mes].Entrada += m.valor;
    else porMes[mes].Saida += m.valor;
  });
  const dadosBar = Object.values(porMes).sort((a, b) => a.mes.localeCompare(b.mes));

  let saldo = 0;
  const dadosLine = dadosBar.map(r => {
    saldo += r.Entrada - r.Saida;
    return { mes: r.mes.slice(5), saldo };
  });

  const anoAtual = new Date().getFullYear().toString();
  const saidasAno = saidas.filter(m => m.data.startsWith(anoAtual));
  const totalAno = saidasAno.reduce((s, m) => s + m.valor, 0);
  const mesesAno = new Set(saidasAno.map(m => m.data.slice(0, 7))).size || 1;
  const previstoAno = (totalAno / mesesAno) * 12;

  const cores = ['#2ecc71', '#e74c3c', '#3498db', '#95a5a6', '#a78bfa', '#d1d5db'];

  return (
    <div className="flex gap-4 overflow-x-auto mt-6 pb-2">
      <div style={{ flex: '1 1 300px', height: 300, background: '#fff', borderRadius: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', padding: '1rem' }}>
        <h3 className="font-semibold mb-2">Gastos por Subcategoria</h3>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={dadosPie} dataKey="value" nameKey="name" outerRadius={100}>
              {dadosPie.map((_, i) => <Cell key={i} fill={cores[i % cores.length]} />)}
            </Pie>
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ flex: '1 1 300px', height: 300, background: '#fff', borderRadius: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', padding: '1rem' }}>
        <h3 className="font-semibold mb-2">Entrada vs Saída por Mês</h3>
        <ResponsiveContainer>
          <BarChart data={dadosBar}>
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Entrada" stackId="a" fill="#2ecc71" />
            <Bar dataKey="Saida" stackId="a" fill="#e74c3c" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ flex: '1 1 300px', height: 300, background: '#fff', borderRadius: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', padding: '1rem' }}>
        <h3 className="font-semibold mb-2">Evolução do Saldo Mensal</h3>
        <ResponsiveContainer>
          <LineChart data={dadosLine}>
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="saldo" stroke="#1e3a8a" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ flex: '0 0 300px', height: 300, background: '#fff', borderRadius: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', padding: '1rem' }}>
        <h3 className="font-semibold mb-2">Previsão de Gasto Anual</h3>
        <ResponsiveContainer>
          <BarChart data={[{ nome: anoAtual, Previsto: previstoAno, Realizado: totalAno }] }>
            <XAxis dataKey="nome" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Previsto" fill="#a78bfa" />
            <Bar dataKey="Realizado" fill="#1e3a8a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
