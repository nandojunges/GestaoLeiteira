const express = require('express');
const cors = require('cors');
const dbMiddleware = require('./middleware/dbMiddleware');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const vacasRoutes = require('./routes/vacasRoutes');
const animaisRoutes = require('./routes/animaisRoutes');
const tarefasRoutes = require('./routes/tarefasRoutes');
const estoqueRoutes = require('./routes/estoqueRoutes');
const protocolosRoutes = require('./routes/protocolosRoutes');
const reproducaoRoutes = require('./routes/reproducaoRoutes');
const tourosRoutes = require('./routes/tourosRoutes');
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
// aumenta o limite de tamanho do JSON para aceitar PDFs codificados em Base64 (até 10 mb)
app.use(express.json({ limit: '10mb' }));

// 📁 Pasta para backups de dados excluídos
fs.mkdirSync(path.join(__dirname, 'dadosExcluidos'), { recursive: true });

// 👤 Inicializa o admin padrão
const adminDb = initDB('nandokkk@hotmail.com');
inicializarAdmins(adminDb);

// Importa middleware de autenticação para uso seletivo nas rotas protegidas
const autenticarToken = require('./middleware/autenticarToken');

// Em vez de aplicar autenticação e carregamento de banco globalmente (o que bloqueia
// o acesso a páginas públicas como a tela de login), aplicamos por rota:
// As rotas que exigem token e acesso ao banco recebem os middlewares na definição abaixo.

// 🌐 Rotas da API
// Rotas protegidas: autenticarToken e dbMiddleware são aplicados
app.use('/vacas', autenticarToken, dbMiddleware, vacasRoutes);
app.use('/animais', autenticarToken, dbMiddleware, animaisRoutes);
app.use('/tarefas', autenticarToken, dbMiddleware, tarefasRoutes);
app.use('/estoque', autenticarToken, dbMiddleware, estoqueRoutes);
app.use('/bezerras', autenticarToken, dbMiddleware, bezerrasRoutes);
app.use('/protocolos-reprodutivos', autenticarToken, dbMiddleware, protocolosRoutes);
app.use('/reproducao', autenticarToken, dbMiddleware, reproducaoRoutes);
app.use('/financeiro', autenticarToken, dbMiddleware, financeiroRoutes);
app.use('/eventos', autenticarToken, dbMiddleware, eventosRoutes);
app.use('/produtos', autenticarToken, dbMiddleware, produtosRoutes);
app.use('/examesSanitarios', autenticarToken, dbMiddleware, examesRoutes);
app.use('/api/racas', autenticarToken, dbMiddleware, racasRoutes);
// nova rota para fichas de touros (pai dos animais)
app.use('/touros', autenticarToken, dbMiddleware, tourosRoutes);
app.use('/api/touros', autenticarToken, dbMiddleware, tourosRoutes);
// Rotas não protegidas (mock e auth) não devem exigir token nem acessar banco
app.use('/', mockRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', rotasExtras);
app.use('/api', adminRoutes);

// 🧾 Servir frontend estático (build do React)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// 🎯 Redirecionamento de SPA (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// 🚀 Inicialização do servidor (somente se executado diretamente)
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Porta ${PORT} já está em uso. Finalize o processo antigo ou aguarde a liberação da porta.`);
      process.exit(1);
    } else {
      console.error('❌ Erro ao iniciar servidor:', err);
      process.exit(1);
    }
  });
}

// Exporta para testes ou uso externo
module.exports = app;
