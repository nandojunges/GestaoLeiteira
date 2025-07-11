import { useEffect, useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { utils, writeFile } from 'xlsx';
import { motion } from 'framer-motion';
import { db } from "../../utils/db";

export default function RelatorioMovimentacaoAnimais() {
  const [dados, setDados] = useState([]);
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
      const regs = await query('SELECT * FROM movAnimais');
      setDados(regs);
    };
    carregar();
  }, []);

  const exportarPDF = () => ref.current && html2pdf().from(ref.current).save('animais.pdf');
  const exportarExcel = () => {
    const ws = utils.json_to_sheet(dados);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'animais');
    writeFile(wb, 'movimentacao-animais.xlsx');
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} ref={ref} className="space-y-6">
      <div className="flex justify-end gap-2">
        <button onClick={exportarPDF} className="botao-acao">Exportar PDF</button>
        <button onClick={exportarExcel} className="botao-acao">Exportar Excel</button>
      </div>
      <div className="p-4 bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead>
            <tr><th>Data</th><th>Tipo</th><th>Animal</th></tr>
          </thead>
          <tbody>
            {dados.slice(0,10).map((d,i)=>(
              <tr key={i} className="border-t"><td>{d.data}</td><td>{d.tipo}</td><td>{d.animal}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
