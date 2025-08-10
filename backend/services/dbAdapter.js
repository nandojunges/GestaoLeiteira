const { initDB, getDb } = require('../db');

function query(sql, params = []) {
  const db = getDb();
  return db.prepare(sql).all(params);
}

function run(sql, params = []) {
  const db = getDb();
  return db.prepare(sql).run(params);
}

function transaction(cb) {
  const db = getDb();
  const trx = db.transaction(cb);
  return trx();
}

module.exports = {
  initDB,
  query,
  run,
  transaction,
  getDb,
};
