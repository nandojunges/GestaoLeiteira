import { useEffect, useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { db } from "../../utils/db";
import html2pdf from 'html2pdf.js';
import { utils, writeFile } from 'xlsx';
import { motion } from 'framer-motion';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function RelatorioProducaoLeite() {
  const [dados, setDados] = useState([]);
  const [grupos, setGrupos] = useState([]);
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
      const prod = await query(
        `SELECT data, SUM(quantidade) as total FROM leite WHERE data BETWEEN date('now','-6 day') AND date('now') GROUP BY data ORDER BY data`
      );
      const gruposDados = await query(
        `SELECT vaca as grupo, SUM(quantidade) as litros FROM leite WHERE data BETWEEN date('now','-6 day') AND date('now') GROUP BY vaca`
      );
      setDados(prod);
      setGrupos(gruposDados);
    };
    carregar();
  }, []);

  const exportarPDF = () => {
    if(ref.current) html2pdf().from(ref.current).save('producao-leite.pdf');
  };

  const exportarExcel = () => {
    const ws = utils.json_to_sheet(dados);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'producao');
    writeFile(wb, 'producao-leite.xlsx');
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} ref={ref} className="space-y-6">
      <div className="flex justify-end gap-2">
        <button onClick={exportarPDF} className="botao-acao">Exportar PDF</button>
        <button onClick={exportarExcel} className="botao-acao">Exportar Excel</button>
      </div>
      <div className="p-4 bg-white rounded shadow">
        <Line
          data={{
            labels: dados.map(d => d.data.slice(5)),
            datasets:[{label:'Litros', data: dados.map(d=>d.total), borderColor:'#60a5fa', backgroundColor:'#bfdbfe'}]
          }}
          options={{ responsive:true }}
        />
      </div>
      <div className="p-4 bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead>
            <tr><th>Grupo</th><th className="text-right">Litros</th></tr>
          </thead>
          <tbody>
            {grupos.map(g=> (
              <tr key={g.grupo} className="border-t"><td>{g.grupo}</td><td className="text-right">{g.litros}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}