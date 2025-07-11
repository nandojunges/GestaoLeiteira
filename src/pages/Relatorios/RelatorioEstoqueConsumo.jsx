import { useEffect, useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { utils, writeFile } from 'xlsx';
import { motion } from 'framer-motion';
import { db } from "../../utils/db";

export default function RelatorioEstoqueConsumo() {
  const [produtos, setProdutos] = useState([]);
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
      const lista = await query('SELECT * FROM produtos');
      setProdutos(lista);
    };
    carregar();
  }, []);

  const exportarPDF = () => ref.current && html2pdf().from(ref.current).save('estoque.pdf');
  const exportarExcel = () => {
    const ws = utils.json_to_sheet(produtos);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'estoque');
    writeFile(wb, 'estoque.xlsx');
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
            <tr><th>Produto</th><th className="text-right">Qtd.</th><th>Categoria</th></tr>
          </thead>
          <tbody>
            {produtos.slice(0,10).map((p,i)=>(
              <tr key={i} className="border-t"><td>{p.nomeComercial}</td><td className="text-right">{p.quantidade}</td><td>{p.categoria}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
