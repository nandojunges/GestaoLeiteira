import { useEffect, useState, useRef } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { db } from "../../utils/db";
import html2pdf from 'html2pdf.js';
import { utils, writeFile } from 'xlsx';
import { motion } from 'framer-motion';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function RelatorioFinanceiro() {
  const [movs, setMovs] = useState([]);
  const [filtro, setFiltro] = useState({ inicio: '', fim: '' });
  const ref = useRef(null);

  useEffect(() => {
    const query = (sql, params = []) =>
      new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

    const carregar = async () => {
      const rows = await query(
        "SELECT * FROM financeiro WHERE data BETWEEN ? AND ?",
        [filtro.inicio || '0000-00-00', filtro.fim || '9999-12-31']
      );
      setMovs(rows);
    };
    carregar();
  }, [filtro]);

  const filtrados = movs.filter(m => {
    if (filtro.inicio && m.data < filtro.inicio) return false;
    if (filtro.fim && m.data > filtro.fim) return false;
    return true;
  });

  const porMes = {};
  filtrados.forEach(m => {
    const mes = m.data.slice(0,7);
    porMes[mes] = porMes[mes] || { entradas:0, saidas:0 };
    if(m.tipo === 'Entrada') porMes[mes].entradas += m.valor;
    else porMes[mes].saidas += m.valor;
  });
  const meses = Object.keys(porMes).sort();
  const saldoMensal = meses.map(m => porMes[m].entradas - porMes[m].saidas);

  const categorias = {};
  filtrados.filter(m => m.tipo === 'Saída').forEach(m => {
    categorias[m.categoria||'Outros'] = (categorias[m.categoria||'Outros'] || 0) + m.valor;
  });

  const exportarPDF = () => {
    if(ref.current) html2pdf().from(ref.current).save('financeiro.pdf');
  };

  const exportarExcel = () => {
    const ws = utils.json_to_sheet(filtrados);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Movimentacoes');
    writeFile(wb, 'financeiro.xlsx');
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} ref={ref} className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <div>
          <label>Início</label>
          <input type="date" value={filtro.inicio} onChange={e=>setFiltro({...filtro,inicio:e.target.value})} className="border rounded px-2" />
        </div>
        <div>
          <label>Fim</label>
          <input type="date" value={filtro.fim} onChange={e=>setFiltro({...filtro,fim:e.target.value})} className="border rounded px-2" />
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={exportarPDF} className="botao-acao">Exportar PDF</button>
          <button onClick={exportarExcel} className="botao-acao">Exportar Excel</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white rounded shadow">
          <Bar
            data={{
              labels: meses,
              datasets:[{label:'Saldo',data:saldoMensal,backgroundColor:'#60a5fa'}]
            }}
            options={{ responsive:true, plugins:{legend:{display:false}} }}
          />
        </div>
        <div className="p-4 bg-white rounded shadow">
          <Pie
            data={{
              labels:Object.keys(categorias),
              datasets:[{data:Object.values(categorias),backgroundColor:['#93c5fd','#a7f3d0','#fca5a5','#fcd34d','#c4b5fd']}]}}
            options={{responsive:true}}
          />
        </div>
      </div>
    </motion.div>
  );
}
