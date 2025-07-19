const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const vacasRoutes = require('./routes/vacasRoutes');
const animaisRoutes = require('./routes/animaisRoutes');
const tarefasRoutes = require('./routes/tarefasRoutes');
const estoqueRoutes = require('./routes/estoqueRoutes');
const protocolosRoutes = require('./routes/protocolosRoutes');
const reproducaoRoutes = require('./routes/reproducaoRoutes');
const financeiroRoutes = require('./routes/financeiroRoutes');
const eventosRoutes = require('./routes/eventosRoutes');
const bezerrasRoutes = require('./routes/bezerrasRoutes');
const produtosRoutes = require('./routes/produtosRoutes');
const examesRoutes = require('./routes/examesSanitariosRoutes');
const racasRoutes = require('./routes/racasRoutes');
const mockRoutes = require('./routes/mockRoutes');
const rotasExtras = require('./routes/rotasExtras');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const { inicializarAdmins } = require('./controllers/authController');
const { initDB } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

fs.mkdirSync(path.join(__dirname, 'dadosExcluidos'), { recursive: true });
const adminDb = initDB('nandokkk@hotmail.com');
inicializarAdmins(adminDb);

// Rotas da API
app.use('/vacas', vacasRoutes);
app.use('/animais', animaisRoutes);
app.use('/tarefas', tarefasRoutes);
app.use('/estoque', estoqueRoutes);
app.use('/bezerras', bezerrasRoutes);
app.use('/protocolos-reprodutivos', protocolosRoutes);
app.use('/reproducao', reproducaoRoutes);
app.use('/financeiro', financeiroRoutes);
app.use('/eventos', eventosRoutes);
app.use('/produtos', produtosRoutes);
app.use('/examesSanitarios', examesRoutes);
app.use('/api/racas', racasRoutes);
app.use('/', mockRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', rotasExtras);
app.use('/api', adminRoutes);

// ✅ Serve o build do frontend (React)
const distPath = path.join(__dirname, '..', 'dist'); // ajuste se sua pasta build tiver outro nome
app.use(express.static(distPath));

// ✅ Redireciona todas as rotas que não sejam API para o index.html do React
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Porta ${PORT} já está em uso. Finalize o processo antigo ou use outra porta.`);
    process.exit(1);
  } else {
    throw err;
  }
});
