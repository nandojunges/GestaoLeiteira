const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
// Reutilizamos seu util existente para envio de e-mail:
const { enviarCodigo } = require('../utils/email');
const SECRET = process.env.JWT_SECRET || 'segredo';
const TTL_MIN = Number(process.env.VERIFICATION_TTL_MINUTES || 3); // minutos
const norm = (e) => String(e || '').trim().toLowerCase();

// Garante as colunas e índice necessários (uma vez, sem migration separada)
(async function ensureEmailVerificationInfra() {
  try {
    await pool.query(`
      ALTER TABLE usuarios
        ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6),
        ADD COLUMN IF NOT EXISTS verification_expires TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS tenant_schema TEXT;
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes WHERE indexname = 'uniq_usuarios_email_ci'
        ) THEN
          CREATE UNIQUE INDEX uniq_usuarios_email_ci ON usuarios (LOWER(email));
        END IF;
      END $$;
    `);
  } catch (e) {
    console.warn('ensureEmailVerificationInfra:', e.message);
  }
})();

function genCode() {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
}

function emailToSchema(emailLC) {
  const slug = emailLC.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48) || 'tenant';
  return `t_${slug}`;
}

// -----------------------------------------------------------------------------
// CADASTRO (com verificação por e-mail e TTL)
// -----------------------------------------------------------------------------
async function cadastro(req, res) {
  const { nome, nomeFazenda, email, telefone, senha, plano, formaPagamento } = req.body || {};
  if (!email || !senha) return res.status(400).json({ error: 'Informe e-mail e senha' });
  const emailLC = norm(email);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const qFind = await client.query(
      `SELECT id, is_verified, verification_expires
         FROM usuarios
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1`,
      [emailLC]
    );

    if (qFind.rows.length) {
      const u = qFind.rows[0];
      if (u.is_verified) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: 'E-mail já cadastrado e verificado' });
      }
      const now = new Date();
      if (u.verification_expires && now < u.verification_expires) {
        const secondsLeft = Math.max(0, Math.floor((u.verification_expires - now) / 1000));
        await client.query('ROLLBACK');
        return res.status(409).json({ error: 'Cadastro pendente de verificação', retry_after_seconds: secondsLeft });
      }
      // Pendente porém expirado → gera novo código, reenvia e libera novo TTL
      const code = genCode();
      const expires = new Date(Date.now() + TTL_MIN * 60 * 1000);
      await client.query(
        `UPDATE usuarios
            SET verification_code = $1,
                verification_expires = $2
          WHERE id = $3`,
        [code, expires, u.id]
      );
      await enviarCodigo(emailLC, code, TTL_MIN);
      await client.query('COMMIT');
      return res.status(200).json({ message: 'Novo código enviado' });
    }

    // Cadastro novo → cria usuário pendente
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(senha, salt);
    const code = genCode();
    const expires = new Date(Date.now() + TTL_MIN * 60 * 1000);

    const ins = await client.query(
      `INSERT INTO usuarios
         (nome, nome_fazenda, email, telefone, senha_hash, is_verified, verification_code, verification_expires, plano, forma_pagamento)
       VALUES ($1,$2,$3,$4,$5,false,$6,$7,$8,$9)
       RETURNING id`,
      [nome || null, nomeFazenda || null, emailLC, telefone || null, hash, code, expires, plano || null, formaPagamento || null]
    );

    await enviarCodigo(emailLC, code, TTL_MIN);
    await client.query('COMMIT');
    return res.status(201).json({ message: 'Verificação enviada', userId: ins.rows[0].id });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ [CADASTRO]', err);
    return res.status(500).json({ error: 'Erro interno no cadastro' });
  } finally {
    client.release();
  }
}

// -----------------------------------------------------------------------------
// VERIFICAR CÓDIGO (ativa conta e cria schema por e-mail)
// -----------------------------------------------------------------------------
async function verificarCodigo(req, res) {
  const { email, codigo } = req.body || {};
  const emailLC = norm(email);
  if (!emailLC || !codigo) return res.status(400).json({ error: 'Informe e-mail e código' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const q = await client.query(
      `SELECT id, is_verified, verification_code, verification_expires, tenant_schema
         FROM usuarios
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1`,
      [emailLC]
    );
    if (!q.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Usuário não encontrado' }); }

    const u = q.rows[0];
    if (u.is_verified) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Usuário já verificado' }); }
    if (!u.verification_code || !u.verification_expires) {
      await client.query('ROLLBACK'); return res.status(400).json({ error: 'Código não gerado' });
    }
    const now = new Date();
    if (now > u.verification_expires) {
      await client.query('ROLLBACK'); return res.status(400).json({ error: 'Código expirado' });
    }
    if (String(codigo).trim() !== u.verification_code) {
      await client.query('ROLLBACK'); return res.status(400).json({ error: 'Código inválido' });
    }

    // Marca como verificado
    await client.query(
      `UPDATE usuarios
          SET is_verified = true,
              verification_code = NULL,
              verification_expires = NULL
        WHERE id = $1`,
      [u.id]
    );

    // Cria o "namespace" do cliente dentro do banco (schema por e-mail)
    const schemaName = emailToSchema(emailLC);
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    await client.query(`UPDATE usuarios SET tenant_schema = $1 WHERE id = $2`, [schemaName, u.id]);

    await client.query('COMMIT');
    return res.json({ message: 'Verificado com sucesso', tenant_schema: schemaName });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ [VERIFICAR]', err);
    return res.status(500).json({ error: 'Erro ao verificar código' });
  } finally {
    client.release();
  }
}

// -----------------------------------------------------------------------------
// EXPORTS (mantém compatibilidade com rotas antigas, se houver)
// -----------------------------------------------------------------------------
module.exports = {
  cadastro,
  verificarCodigo,
  // aliases para compatibilidade se as rotas usarem nomes diferentes
  register: cadastro,
  verifyCode: verificarCodigo
};

