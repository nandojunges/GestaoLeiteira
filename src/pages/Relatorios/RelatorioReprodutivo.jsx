import { useEffect, useState, useRef } from 'react';
import { db } from "../../utils/db";
import html2pdf from 'html2pdf.js';
import { utils, writeFile } from 'xlsx';
import { motion } from 'framer-motion';

export default function RelatorioReprodutivo() {
  const [animais, setAnimais] = useState([]);
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
      const dados = await query('SELECT * FROM animais');
      setAnimais(Array.isArray(dados) ? dados : []);
    };
    carregar();
  }, []);

  const ativos = animais.filter(a => a.statusReprodutivo && a.statusReprodutivo.toLowerCase() !== 'seca');
  const prenhes = ativos.filter(a => (a.statusReprodutivo||'').toLowerCase() === 'prenhe').length;
  const taxaPrenhez = ativos.length ? Math.round((prenhes/ativos.length)*100) : 0;

  const exportarPDF = () => ref.current && html2pdf().from(ref.current).save('reprodutivo.pdf');
  const exportarExcel = () => {
    const ws = utils.json_to_sheet(animais);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'animais');
    writeFile(wb, 'reprodutivo.xlsx');
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} ref={ref} className="space-y-6">
      <div className="flex justify-end gap-2">
        <button onClick={exportarPDF} className="botao-acao">Exportar PDF</button>
        <button onClick={exportarExcel} className="botao-acao">Exportar Excel</button>
      </div>
      <div className="p-4 bg-white rounded shadow flex flex-col items-center">
        <div className="text-4xl font-bold">{taxaPrenhez}%</div>
        <div className="text-gray-600">Taxa de prenhez</div>
      </div>
      <div className="p-4 bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead>
            <tr><th>Número</th><th>Status</th></tr>
          </thead>
          <tbody>
            {animais.slice(0,10).map(a=> (
              <tr key={a.numero} className="border-t"><td>{a.numero}</td><td>{a.statusReprodutivo}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}