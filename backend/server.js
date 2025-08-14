require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cfg = require('./config/env');
const dbMiddleware = require('./middleware/dbMiddleware');
const path = require('path');
const fs = require('fs');
let morgan; try { morgan = require('morgan'); } catch {}

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
const apiV1Routes = require('./routes/apiV1');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const healthRoutes = require('./routes/healthRoutes');
const healthDbRoutes = require('./routes/healthDbRoutes');
const logger = require('./middleware/logger');
const rateLimit = require('./middleware/rateLimit');
const { inicializarAdmins } = require('./controllers/authController');
const { initDB, getDb, getPool } = require('./db');

(async () => {
  await initDB('system@gestao'); // roda applyMigrations/abre pool
  inicializarAdmins(getDb());
})();

const app = express();
app.use(cors());
// aumenta o limite de tamanho do JSON para aceitar PDFs codificados em Base64 (até 10 mb)
app.use(express.json({ limit: '10mb' }));
app.use(logger);
if (morgan) app.use(morgan('dev'));

// Health check simples (útil para ver se o proxy está batendo mesmo)
app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// Servir arquivos estáticos usados pelo front (rotativos .txt)
app.use('/api/data', express.static(path.join(__dirname, 'data')));

// rotas de configuração (simples, sem autenticação por enquanto)
app.get('/api/configuracao', async (req, res, next) => {
  try {
    const userId = null; // se tiver auth, substitua por req.user.id
    const { rows } = await getPool().query(
      'SELECT dados FROM configuracao WHERE idProdutor IS NOT DISTINCT FROM $1',
      [userId]
    );
    res.json(rows[0]?.dados || {});
  } catch (e) { next(e); }
});

app.post('/api/configuracao', async (req, res, next) => {
  try {
    const userId = null; // se tiver auth, substitua por req.user.id
    await getPool().query(
      `INSERT INTO configuracao (idProdutor, dados)
       VALUES ($1, $2)
       ON CONFLICT (idProdutor) DO UPDATE SET dados = EXCLUDED.dados`,
      [userId, req.body]
    );
    res.status(204).end();
  } catch (e) { next(e); }
});

// 📁 Pasta para backups de dados excluídos
fs.mkdirSync(path.join(__dirname, 'dadosExcluidos'), { recursive: true });

// Importa middleware de autenticação para uso seletivo nas rotas protegidas
const authMiddleware = require('./middleware/authMiddleware');

// Em vez de aplicar autenticação e carregamento de banco globalmente (o que bloqueia
// o acesso a páginas públicas como a tela de login), aplicamos por rota:
// As rotas que exigem token e acesso ao banco recebem os middlewares na definição abaixo.

// 🌐 Rotas da API (prefixadas com /api para corresponder ao front-end)
// Rotas protegidas: authMiddleware e dbMiddleware são aplicados
app.use('/api/vacas', authMiddleware, dbMiddleware, vacasRoutes);
app.use('/api/animais', authMiddleware, dbMiddleware, animaisRoutes);
app.use('/api/tarefas', authMiddleware, dbMiddleware, tarefasRoutes);
app.use('/api/estoque', authMiddleware, dbMiddleware, estoqueRoutes);
app.use('/api/bezerras', authMiddleware, dbMiddleware, bezerrasRoutes);
app.use('/api/protocolos-reprodutivos', authMiddleware, dbMiddleware, protocolosRoutes);
app.use('/api/reproducao', authMiddleware, dbMiddleware, reproducaoRoutes);
app.use('/api/financeiro', authMiddleware, dbMiddleware, financeiroRoutes);
app.use('/api/eventos', authMiddleware, dbMiddleware, eventosRoutes);
app.use('/api/produtos', authMiddleware, dbMiddleware, produtosRoutes);
app.use('/api/examesSanitarios', authMiddleware, dbMiddleware, examesRoutes);
app.use('/api/racas', authMiddleware, dbMiddleware, racasRoutes);
// nova rota para fichas de touros (pai dos animais)
app.use('/api/touros', authMiddleware, dbMiddleware, tourosRoutes);
// mantendo também a rota sem prefixo para compatibilidade com alguns pontos do front-end
// Rotas não protegidas (mock e auth) não devem exigir token nem acessar banco
app.use('/', mockRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth/send-code', rateLimit);
app.use('/api/v1/auth/forgot-password', rateLimit);
app.use('/api/v1/auth/login', rateLimit);
app.use('/api/v1/auth', authRoutes);
app.use('/api', rotasExtras);
app.use('/api', adminRoutes);
// Rotas v1 com services reestruturados
app.use(apiV1Routes);
app.use(maintenanceRoutes);
app.use(healthRoutes);
app.use(healthDbRoutes);

// 🧾 Servir frontend estático (build do React)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// 🎯 Redirecionamento de SPA (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Loga toda exceção não capturada em rotas
app.use((err, req, res, next) => {
  console.error('API ERROR:', {
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    query: req.query,
    error: err?.stack || err
  });
  res.status(500).json({ error: 'Internal Server Error' });
});

// 🚀 Inicialização do servidor (somente se executado diretamente)
const PORT = cfg.port;

if (require.main === module) {
  const enablePrePartoJob = process.env.ENABLE_PREPARTO_JOB === 'true';
  if (enablePrePartoJob) {
    const schedulePrePartoJob = require('./jobs/preparto');
    schedulePrePartoJob();
  }
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
