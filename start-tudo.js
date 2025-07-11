import { spawn, execSync } from 'child_process';
import ngrok from 'ngrok';
import fs from 'fs';
import path from 'path';
import net from 'net';
import 'dotenv/config';

// 🧹 Limpa a pasta dist com comando do Windows (rd /s /q dist)
const distPath = path.join('.', 'dist');
if (fs.existsSync(distPath)) {
  console.log('🧹 Limpando pasta dist...');
  try {
    execSync('rd /s /q dist');
  } catch {
    console.log('⚠️ Erro ao limpar dist (talvez já estava vazia ou em uso).');
  }
}

// 🔪 Mata processos da porta 3000
try {
  const output = execSync('netstat -aon | findstr :3000').toString();
  const lines = output.trim().split('\n');
  for (const line of lines) {
    const pid = line.trim().split(/\s+/).pop();
    if (pid) {
      console.log(`Finalizando processo na porta 3000 (PID ${pid})...`);
      try {
        execSync(`taskkill /PID ${pid} /F`);
      } catch {
        console.log(`✔️ PID ${pid} já estava finalizado.`);
      }
    }
  }
} catch {
  console.log('✔️ Porta 3000 já estava liberada.');
}

// 🎯 Build do frontend
console.log('\n🎯 Rodando build...');
const build = spawn('npm', ['run', 'build'], { stdio: 'inherit', shell: true });

build.on('exit', (code) => {
  if (code !== 0) {
    console.error('❌ Erro no build.');
    return;
  }

  // 🚀 Sobe o backend
  console.log('\n🚀 Iniciando backend...');
  spawn('nodemon', ['backend/server.js'], { stdio: 'inherit', shell: true });

  // ⏳ Aguarda a porta 3000 abrir
  const esperaBackend = setInterval(() => {
    const client = net.createConnection({ port: 3000 }, async () => {
      clearInterval(esperaBackend);
      client.end();

      // 🌐 Inicia o ngrok direto (sem agente local)
      try {
       const url = await ngrok.connect(3000);
console.log(`✅ NGROK rodando em: ${url}`);

       console.log('\n=============================');
        console.log(`✅ NGROK rodando em: ${url}`);
        console.log('=============================\n');
      } catch (error) {
        console.error('❌ Erro ao iniciar ngrok direto:', error.message || error);
      }
    });

    client.on('error', () => {
      // Porta ainda não disponível, aguarda...
    });
  }, 1500);
});
