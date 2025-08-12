/**
 * Start único (front + back) com fallback.
 * - Se existir 'concurrently', usa "vite" e "nodemon".
 * - Se não existir, abre dois processos simples: "node backend/server.js" e (quando houver) "vite".
 * Não falha se 'vite' não estiver disponível ainda (exibe aviso).
 */
const { spawn } = require('child_process');
const path = require('path');

function run(cmd, args, opts={}) {
  const p = spawn(cmd, args, { stdio: 'inherit', shell: true, ...opts });
  p.on('exit', (code)=> console.log(`[${cmd}] saiu com código ${code}`));
  return p;
}

function has(bin) {
  try { require('child_process').execSync(`${bin} --version`, {stdio:'ignore'}); return true; }
  catch { return false; }
}

if (has('concurrently')) {
  run('concurrently', [
    '-k','-n','FRONT,BACK',
    '"vite"',
    '"nodemon backend/server.js"'
  ]);
} else {
  console.log('⚠ concurrently não encontrado — usando fallback simples.');
  const back = run('node', ['backend/server.js']);
  if (has('vite')) {
    run('vite', []);
  } else {
    console.log('⚠ vite não encontrado; front não será iniciado agora.');
    console.log('  Quando o build destravar, rode: npm i && npm run dev');
  }
}
