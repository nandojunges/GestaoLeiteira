const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "segredo-super-seguro";

module.exports = function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ erro: "Token ausente" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    req.usuario = decoded; // compat com código mais antigo
    if (!decoded.idProdutor) {
      return res.status(403).json({ erro: "Permissão negada: produtor não identificado" });
    }
    next();
  } catch (e) {
    console.error("❌ Erro ao verificar token:", e.message);
    return res.status(403).json({ erro: "Token inválido" });
  }
};
