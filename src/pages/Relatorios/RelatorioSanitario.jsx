import { useEffect, useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { utils, writeFile } from 'xlsx';
import { motion } from 'framer-motion';
import { db } from "../../utils/db";

export default function RelatorioSanitario() {
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
      const registros = await query('SELECT * FROM registrosSanitarios');
      setDados(registros);
    };
    carregar();
  }, []);

  const exportarPDF = () => ref.current && html2pdf().from(ref.current).save('sanitario.pdf');
  const exportarExcel = () => {
    const ws = utils.json_to_sheet(dados);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'sanitario');
    writeFile(wb, 'sanitario.xlsx');
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
            <tr><th>Animal</th><th>Tipo</th><th>Data</th></tr>
          </thead>
          <tbody>
            {dados.slice(0,10).map((r,i)=>(
              <tr key={i} className="border-t"><td>{r.animal}</td><td>{r.tipo}</td><td>{r.data}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
