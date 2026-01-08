import { Client } from 'basic-ftp';
import { readdir, stat } from 'fs/promises';

const config = {
  host: process.env.FTP_HOST || '147.93.64.151',
  user: process.env.FTP_USER || 'u968231423.easy.wgalmeida.com.br',
  password: process.env.FTP_PASS || 'WGEasy2026!',
  remotePath: process.env.FTP_PATH || '/public_html',
  localPath: 'E:/sistema/20260105-wgeasy/frontend/dist',
  secure: false,
};

function assertConfig() {
  const missing = ['host', 'user', 'password'].filter((key) => !config[key]);
  if (missing.length) {
    throw new Error(`Credenciais FTP incompletas: ${missing.join(', ')}`);
  }
}

async function assertLocalBuild() {
  try {
    const stats = await stat(config.localPath);
    if (!stats.isDirectory()) {
      throw new Error(`A pasta local "${config.localPath}" nao e um diretorio`);
    }
    const entries = await readdir(config.localPath);
    if (!entries.length) {
      throw new Error(`A pasta local "${config.localPath}" esta vazia`);
    }
  } catch (error) {
    throw new Error(`Erro ao validar build local: ${error.message}`);
  }
}

async function printRemoteListing(client) {
  const items = await client.list(config.remotePath);
  console.log(`\n${items.length} itens encontrados em ${config.remotePath}:`);
  items.forEach((item) => {
    console.log(` - ${item.name} (${item.type})`);
  });
}

async function validateConnection() {
  const client = new Client();
  client.ftp.verbose = false;

  try {
    console.log('\nValidando acesso FTP Hostinger...');
    console.log(`Host: ${config.host}`);
    console.log(`Usuario: ${config.user}`);
    console.log(`Caminho remoto: ${config.remotePath}`);
    await client.access({
      host: config.host,
      user: config.user,
      password: config.password,
      secure: config.secure,
    });
    await client.ensureDir(config.remotePath);
    await printRemoteListing(client);
    console.log('\nConexao testada com sucesso.');
  } finally {
    client.close();
  }
}

(async () => {
  try {
    assertConfig();
    await assertLocalBuild();
    await validateConnection();
  } catch (error) {
    console.error('\nVALIDACAO FALHOU:', error.message);
    process.exitCode = 1;
  }
})();
