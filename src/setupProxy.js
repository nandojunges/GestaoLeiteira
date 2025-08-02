const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: { '^/api': '/api' },
      onProxyReq: (proxyReq, req) => {
        // Encaminha o cabeçalho Authorization, se existir
        if (req.headers['authorization']) {
          proxyReq.setHeader('Authorization', req.headers['authorization']);
        }
      },
    }),
  );
};

