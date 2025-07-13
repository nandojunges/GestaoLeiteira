const express = require('express');
const router = express.Router();

const verificarAdmin = require('../middleware/verificarAdmin');
const Produtor = require('../models/Produtor');
const Fazenda = require('../models/Fazenda');
const Animal = require('../models/animaisModel');
const Usuario = require('../models/Usuario');
const fs = require('fs');
const path = require('path');
const { getDb, initDB } = require('../db');

// Aplica verificação de admin a todas as rotas abaixo
router.use('/admin', verificarAdmin);

// Rota de boas-vindas
router.get('/admin/dash', (req, res) => {
  res.json({ message: 'Bem-vindo ao painel de administração' });
});

// Lista produtores com dados de fazenda e número de animais
router.get('/admin/produtores', (req, res) => {
  const produtores = Produtor.getAll();
  const lista = produtores.map(p => {
    const fazenda = Fazenda.getByProdutor(p.id) || { nome: '', limiteAnimais: 0 };
    const total = Animal.countByProdutor(p.id);
    return {
      id: p.id,
      nome: p.nome,
      email: p.email,
      fazenda: fazenda.nome,
      limiteAnimais: fazenda.limiteAnimais || 0,
      numeroAnimais: total,
      status: p.status || 'ativo',
    };
  });
  res.json(lista);
});

// Atualiza o limite de animais por fazenda
router.patch('/admin/limite/:id', (req, res) => {
  const { limite } = req.body;
  const fazenda = Fazenda.updateLimite(req.params.id, limite);
  res.json(fazenda);
});

// Altera status do produtor (ativo <-> suspenso)
router.patch('/admin/status/:id', (req, res) => {
  const produtor = Produtor.getById(req.params.id);
  if (!produtor) return res.status(404).json({ error: 'Produtor não encontrado' });
  const novoStatus = produtor.status === 'ativo' ? 'suspenso' : 'ativo';
  Produtor.updateStatus(req.params.id, novoStatus);
  res.json({ status: novoStatus });
});

// Lista todos os usuários (sem senha)
router.get('/admin/usuarios', async (req, res) => {
  function unsanitizeEmail(name) {
    const parts = name.split('_');
    if (parts.length > 1) {
      return parts[0] + '@' + parts.slice(1).join('.');
    }
    return name;
  }

  const possibles = ['../bancos', '../databases', '../data'];
  let baseDir = null;
  for (const p of possibles) {
    const full = path.join(__dirname, p);
    if (fs.existsSync(full)) {
      baseDir = full;
      break;
    }
  }

  if (!baseDir) {
    return res.json([]);
  }

  const dirs = fs.readdirSync(baseDir).filter(d => {
    const stat = fs.statSync(path.join(baseDir, d));
    return stat.isDirectory();
  });

  const lista = [];

  for (const dir of dirs) {
    if (dir === 'backups') continue;
    const email = unsanitizeEmail(dir);

    const db = initDB(email);
    const usuarios = Usuario.getAll(db).filter(u => u.perfil !== 'admin');

    usuarios.forEach(u => {
      lista.push({
        nome: u.nome,
        email: u.email,
        status: u.verificado ? 'ativo' : 'bloqueado',
        plano: u.perfil,
        nomeFazenda: u.nomeFazenda || '',
        banco: `${email}.sqlite`,
      });
    });
  }

  res.json(lista);
});

// Remove um usuário pelo ID
router.delete('/admin/usuarios/:id', async (req, res) => {
  const db = getDb();
  const { id } = req.params;
  db.prepare('DELETE FROM usuarios WHERE id = ?').run(id);
  res.json({ message: 'Usuário removido' });
});

module.exports = router;
