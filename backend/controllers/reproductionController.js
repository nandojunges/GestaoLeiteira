const reproductionService = require('../services/reproductionService');

async function registrarInseminacao(req, res, next) {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }
    const result = await reproductionService.registrarInseminacao(
      Number(req.params.id),
      req.body
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function registrarDiagnostico(req, res, next) {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }
    const result = await reproductionService.registrarDiagnostico(
      Number(req.params.id),
      req.body
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function registrarParto(req, res, next) {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }
    const result = await reproductionService.registrarParto(
      Number(req.params.id),
      req.body
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function registrarSecagem(req, res, next) {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }
    const result = await reproductionService.registrarSecagem(
      Number(req.params.id),
      req.body
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function listarHistorico(req, res, next) {
  try {
    const historico = await reproductionService.listarHistorico(Number(req.params.id));
    res.json(historico);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registrarInseminacao,
  registrarDiagnostico,
  registrarParto,
  registrarSecagem,
  listarHistorico,
};
