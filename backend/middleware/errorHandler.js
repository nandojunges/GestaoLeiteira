module.exports = (err, req, res, _next) => {
  const status = err.status || 500;
  const payload = { error: err.message || 'Erro interno' };
  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
};
