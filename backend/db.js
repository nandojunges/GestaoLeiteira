const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

let db;

function sanitizeEmail(email) {
  return email.replace(/[@.]/g, '_');
}

function getUserDir(email, forceCreate = true) {
  const dir = path.join(__dirname, 'data', sanitizeEmail(email));
  if (forceCreate) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getDBPath(email) {
  return path.join(__dirname, 'data', sanitizeEmail(email), 'banco.sqlite');
}

const createUsuarios = `CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  nomeFazenda TEXT,
  email TEXT UNIQUE,
  telefone TEXT,
  senha TEXT,
  verificado INTEGER DEFAULT 0,
  codigoVerificacao TEXT,
  perfil TEXT DEFAULT 'usuario',
  tipoConta TEXT DEFAULT 'usuario',
  plano TEXT DEFAULT 'gratis',
  planoSolicitado TEXT DEFAULT NULL,
  formaPagamento TEXT DEFAULT NULL,
  dataCadastro TEXT DEFAULT NULL,
  metodoPagamentoId INTEGER,
  dataLiberado TEXT DEFAULT NULL,
  dataFimLiberacao TEXT DEFAULT NULL,
  dataFimTeste TEXT DEFAULT NULL,
  status TEXT DEFAULT 'ativo'
)`;

const createVerificacoesPendentes = `CREATE TABLE IF NOT EXISTS verificacoes_pendentes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  codigo TEXT,
  nome TEXT,
  nomeFazenda TEXT,
  telefone TEXT,
  senha TEXT,
  planoSolicitado TEXT,
  formaPagamento TEXT,
  criado_em DATETIME
)`;

const createProdutores = `CREATE TABLE IF NOT EXISTS produtores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  email TEXT UNIQUE,
  senha TEXT,
  emailVerificado INTEGER DEFAULT 0,
  codigoVerificacao TEXT,
  status TEXT DEFAULT 'ativo'
)`;

const createFazendas = `CREATE TABLE IF NOT EXISTS fazendas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  idProdutor INTEGER,
  limiteAnimais INTEGER DEFAULT 0
)`;

const createAnimais = `CREATE TABLE IF NOT EXISTS animais (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero INTEGER,
  brinco TEXT,
  nascimento TEXT,
  sexo TEXT,
  origem TEXT,
  categoria TEXT,
  idade TEXT,
  raca TEXT,
  checklistVermifugado INTEGER DEFAULT 0,
  checklistGrupoDefinido INTEGER DEFAULT 0,
  fichaComplementarOK INTEGER DEFAULT 0,
  pai TEXT,
  mae TEXT,
  ultimaIA TEXT,
  ultimoParto TEXT,
  nLactacoes INTEGER,
  status TEXT DEFAULT 'ativo',
  motivoSaida TEXT,
  dataSaida TEXT,
  valorVenda REAL,
  observacoesSaida TEXT,
  tipoSaida TEXT,
  previsaoParto TEXT,
  idProdutor INTEGER
)`;

const createTarefas = `CREATE TABLE IF NOT EXISTS tarefas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  descricao TEXT NOT NULL,
  data TEXT,
  concluida INTEGER DEFAULT 0,
  idProdutor INTEGER
)`;

const createEstoque = `CREATE TABLE IF NOT EXISTS estoque (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item TEXT NOT NULL,
  quantidade INTEGER,
  unidade TEXT,
  idProdutor INTEGER
)`;

const createProtocolos = `CREATE TABLE IF NOT EXISTS protocolos_reprodutivos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  descricao TEXT,
  idProdutor INTEGER
)`;

const createVacas = `CREATE TABLE IF NOT EXISTS vacas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  idade INTEGER,
  raca TEXT,
  idProdutor INTEGER
)`;

const createBezerras = `CREATE TABLE IF NOT EXISTS bezerras (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  idProdutor INTEGER
)`;

const createProdutos = `CREATE TABLE IF NOT EXISTS produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dados TEXT,
  idProdutor INTEGER
)`;

const createExames = `CREATE TABLE IF NOT EXISTS exames_sanitarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dados TEXT,
  idProdutor INTEGER
)`;

const createReproducao = `CREATE TABLE IF NOT EXISTS reproducao (
  numero TEXT PRIMARY KEY,
  dados TEXT,
  idProdutor INTEGER
)`;

const createFinanceiro = `CREATE TABLE IF NOT EXISTS financeiro (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data TEXT,
  descricao TEXT,
  valor REAL,
  tipo TEXT,
  categoria TEXT,
  subcategoria TEXT,
  origem TEXT,
  numeroAnimal TEXT,
  centroCusto TEXT,
  idProdutor INTEGER
)`;

const createEventos = `CREATE TABLE IF NOT EXISTS eventos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT,
  title TEXT,
  date TEXT,
  descricao TEXT,
  subtipo TEXT,
  prioridadeVisual INTEGER,
  idProdutor INTEGER
)`;

const createMetodosPagamento = `CREATE TABLE IF NOT EXISTS metodos_pagamento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  identificador TEXT,
  ativo BOOLEAN DEFAULT 1
)`;

function applyMigrations(database) {
  database.exec(createAnimais);
  // cria tabela de touros para armazenar fichas de reprodutores
  const createTouros = `
CREATE TABLE IF NOT EXISTS touros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  texto TEXT,
  arquivoBase64 TEXT,
  dataUpload TEXT,
  idProdutor INTEGER
)`;
  database.exec(createTouros);
  database.exec(createUsuarios);
  database.exec(createVerificacoesPendentes);
  database.exec(createProdutores);
  database.exec(createFazendas);
  database.exec(createMetodosPagamento);

  let pendCols = database.prepare('PRAGMA table_info(verificacoes_pendentes)').all();
  if (!pendCols.some(c => c.name === 'planoSolicitado')) {
    database.exec("ALTER TABLE verificacoes_pendentes ADD COLUMN planoSolicitado TEXT");
  }
  if (!pendCols.some(c => c.name === 'formaPagamento')) {
    database.exec("ALTER TABLE verificacoes_pendentes ADD COLUMN formaPagamento TEXT");
  }

  let produtorCols = database.prepare('PRAGMA table_info(produtores)').all();
  if (!produtorCols.some(c => c.name === 'status')) {
    database.exec("ALTER TABLE produtores ADD COLUMN status TEXT DEFAULT 'ativo'");
  }

  let fazendaCols = database.prepare('PRAGMA table_info(fazendas)').all();
  if (!fazendaCols.some(c => c.name === 'limiteAnimais')) {
    database.exec('ALTER TABLE fazendas ADD COLUMN limiteAnimais INTEGER DEFAULT 0');
  }

  let info = database.prepare('PRAGMA table_info(animais)').all();
  const existentes = info.map(c => c.name);
  if (!existentes.includes('tipoSaida')) {
    database.exec('ALTER TABLE animais ADD COLUMN tipoSaida TEXT');
  }
  if (!existentes.includes('previsaoParto')) {
    database.exec('ALTER TABLE animais ADD COLUMN previsaoParto TEXT');
  }
  const createEventos = `
  CREATE TABLE IF NOT EXISTS eventos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id INTEGER,
    dataEvento TEXT,
    tipoEvento TEXT,
    descricao TEXT,
    idProdutor INTEGER
  )`;
  database.exec(createEventos);
const novasColunas = {
    numero: 'INTEGER',
    brinco: 'TEXT',
    nascimento: 'TEXT',
    sexo: 'TEXT',
    origem: 'TEXT',
    categoria: 'TEXT',
    idade: 'TEXT',
    raca: 'TEXT',
    checklistVermifugado: 'INTEGER DEFAULT 0',
    checklistGrupoDefinido: 'INTEGER DEFAULT 0',
    fichaComplementarOK: 'INTEGER DEFAULT 0',
    pai: 'TEXT',
    mae: 'TEXT',
    ultimaIA: 'TEXT',
    ultimoParto: 'TEXT',
    nLactacoes: 'INTEGER',
    status: "TEXT DEFAULT 'ativo'",
    motivoSaida: 'TEXT',
    dataSaida: 'TEXT',
    valorVenda: 'REAL',
    observacoesSaida: 'TEXT',
    tipoSaida: 'TEXT',
    del: 'INTEGER',
    idProdutor: 'INTEGER'
  };
  for (const [col, type] of Object.entries(novasColunas)) {
    if (!existentes.includes(col)) {
      database.exec(`ALTER TABLE animais ADD COLUMN ${col} ${type}`);
    }
  }

  database.exec(createTarefas);
  database.exec(createEstoque);
  database.exec(createProtocolos);
  database.exec(createVacas);
  database.exec(createBezerras);
  database.exec(createReproducao);
  database.exec(createFinanceiro);
  database.exec(createEventos);
  database.exec(createProdutos);
  database.exec(createExames);

  const tabelasComProdutor = [
    'tarefas',
    'estoque',
    'protocolos_reprodutivos',
    'vacas',
    'bezerras',
    'reproducao',
    'financeiro',
    'eventos',
    'produtos',
    'exames_sanitarios'
  ];
  for (const tabela of tabelasComProdutor) {
    const cols = database.prepare(`PRAGMA table_info(${tabela})`).all();
    if (!cols.some(c => c.name === 'idProdutor')) {
      database.exec(`ALTER TABLE ${tabela} ADD COLUMN idProdutor INTEGER`);
    }
  }

  produtorCols = database.prepare('PRAGMA table_info(produtores)').all();
  if (!produtorCols.some(c => c.name === 'status')) {
    database.exec("ALTER TABLE produtores ADD COLUMN status TEXT DEFAULT 'ativo'");
  }

  fazendaCols = database.prepare('PRAGMA table_info(fazendas)').all();
  if (!fazendaCols.some(c => c.name === 'limiteAnimais')) {
    database.exec('ALTER TABLE fazendas ADD COLUMN limiteAnimais INTEGER DEFAULT 0');
  }

  let usuarioCols = database.prepare('PRAGMA table_info(usuarios)').all();
  if (!usuarioCols.some(c => c.name === 'perfil')) {
    database.exec("ALTER TABLE usuarios ADD COLUMN perfil TEXT DEFAULT 'usuario'");
  }
  usuarioCols = database.prepare('PRAGMA table_info(usuarios)').all();
  if (!usuarioCols.some(c => c.name === 'tipoConta')) {
    database.exec("ALTER TABLE usuarios ADD COLUMN tipoConta TEXT DEFAULT 'usuario'");
  }
  usuarioCols = database.prepare('PRAGMA table_info(usuarios)').all();
  if (!usuarioCols.some(c => c.name === 'plano')) {
    database.exec("ALTER TABLE usuarios ADD COLUMN plano TEXT DEFAULT 'gratis'");
  }
  if (!usuarioCols.some(c => c.name === 'planoSolicitado')) {
    database.exec('ALTER TABLE usuarios ADD COLUMN planoSolicitado TEXT DEFAULT NULL');
  }
  if (!usuarioCols.some(c => c.name === 'formaPagamento')) {
    database.exec('ALTER TABLE usuarios ADD COLUMN formaPagamento TEXT DEFAULT NULL');
  }
  if (!usuarioCols.some(c => c.name === 'dataCadastro')) {
    database.exec('ALTER TABLE usuarios ADD COLUMN dataCadastro TEXT DEFAULT NULL');
  }
  if (!usuarioCols.some(c => c.name === 'metodoPagamentoId')) {
    database.exec('ALTER TABLE usuarios ADD COLUMN metodoPagamentoId INTEGER');
  }
  if (!usuarioCols.some(c => c.name === 'dataLiberado')) {
    database.exec('ALTER TABLE usuarios ADD COLUMN dataLiberado TEXT DEFAULT NULL');
  }
  if (!usuarioCols.some(c => c.name === 'dataFimLiberacao')) {
    database.exec('ALTER TABLE usuarios ADD COLUMN dataFimLiberacao TEXT DEFAULT NULL');
  }
  if (!usuarioCols.some(c => c.name === 'dataFimTeste')) {
    database.exec('ALTER TABLE usuarios ADD COLUMN dataFimTeste TEXT DEFAULT NULL');
  }
  if (!usuarioCols.some(c => c.name === 'status')) {
    database.exec("ALTER TABLE usuarios ADD COLUMN status TEXT DEFAULT 'ativo'");
  }
}

function backupDatabase(dir, dbPath) {
  const hoje = new Date().toISOString().slice(0, 10);
  const backupDir = path.join(dir, 'backups');
  const backupFile = path.join(backupDir, `${hoje}.sqlite`);
  if (!fs.existsSync(backupFile)) {
    fs.mkdirSync(backupDir, { recursive: true });
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupFile);
    }
  }
}

function initDB(email, forceCreate = true) {
  const dir = getUserDir(email, forceCreate);
  const dbPath = path.join(dir, 'banco.sqlite');

  if (!forceCreate && !fs.existsSync(dbPath)) {
    return null;
  }

  // Fecha conexão anterior, se houver, para evitar vazamento de descritores
  if (db && typeof db.close === 'function') {
    try { db.close(); } catch (_) {}
  }

  if (forceCreate && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(dbPath);

  // Cria tabelas e aplica migrations sempre que um banco é carregado
  applyMigrations(db);

  // A estratégia de backup automática foi movida para um utilitário que é
  // acionado apenas antes de operações de escrita. Assim evitamos criar
  // cópias quando o usuário apenas consulta dados.

  console.log(`📁 Banco de dados (${email}):`, dbPath);
  return db;
}

function getDb() {
  return db;
}

module.exports = { initDB, getDb, getUserDir, getDBPath };

