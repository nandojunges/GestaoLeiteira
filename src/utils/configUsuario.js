import { carregarConfiguracao as carregarConfigSqlite, salvarConfiguracao as salvarConfigSqlite } from '../sqlite/ajustes';

export async function salvarConfiguracao(config) {
  try {
    await salvarConfigSqlite(config);
  } catch {
    // ignore storage errors
  }
}

export async function carregarConfiguracao() {
  try {
     return await carregarConfigSqlite();
  } catch {
    return {};
  }
}
