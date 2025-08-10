module.exports = (err, req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Erro interno';
  res.status(status).json({ error: message });
};
