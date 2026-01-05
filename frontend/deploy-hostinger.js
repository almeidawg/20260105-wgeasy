/**
 * Script de Deploy para Hostinger via FTP
 *
 * Uso: node deploy-hostinger.js
 *
 * Requer as seguintes variáveis de ambiente (ou edite diretamente abaixo):
 * - FTP_HOST: Servidor FTP (ex: ftp.seudominio.com)
 * - FTP_USER: Usuário FTP
 * - FTP_PASS: Senha FTP
 * - FTP_PATH: Caminho remoto (ex: /public_html ou /domains/seusite.com/public_html)
 */

import { Client } from 'basic-ftp';
import { readdir, stat } from 'fs/promises';
import { join, relative } from 'path';

// ============================================
// CONFIGURAÇÃO - EDITE AQUI SE NECESSÁRIO
// ============================================
const config = {
  host: process.env.FTP_HOST || '147.93.64.151',
  user: process.env.FTP_USER || 'u968231423.easy.wgalmeida.com.br',
  password: process.env.FTP_PASS || 'WGEasy2026!',
  remotePath: process.env.FTP_PATH || '/public_html',
  localPath: './dist',                    // Pasta local para upload
  secure: false,                          // true para FTPS
};

// ============================================
// FUNÇÕES DE DEPLOY
// ============================================

async function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = await readdir(dirPath);

  for (const file of files) {
    const fullPath = join(dirPath, file);
    const fileStat = await stat(fullPath);

    if (fileStat.isDirectory()) {
      await getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }

  return arrayOfFiles;
}

async function deploy() {
  // Validação das credenciais
  if (!config.host || !config.user || !config.password) {
    console.error('\n========================================');
    console.error('ERRO: Credenciais FTP não configuradas!');
    console.error('========================================\n');
    console.error('Configure as variáveis de ambiente:');
    console.error('  set FTP_HOST=seu_host_ftp');
    console.error('  set FTP_USER=seu_usuario');
    console.error('  set FTP_PASS=sua_senha');
    console.error('  set FTP_PATH=/public_html\n');
    console.error('Ou edite as configurações diretamente no arquivo deploy-hostinger.js');
    process.exit(1);
  }

  const client = new Client();
  client.ftp.verbose = true; // Mostra logs detalhados

  try {
    console.log('\n========================================');
    console.log('INICIANDO DEPLOY PARA HOSTINGER');
    console.log('========================================\n');

    console.log(`Host: ${config.host}`);
    console.log(`Usuário: ${config.user}`);
    console.log(`Caminho remoto: ${config.remotePath}`);
    console.log(`Pasta local: ${config.localPath}\n`);

    // Conectar ao servidor FTP
    console.log('Conectando ao servidor FTP...');
    await client.access({
      host: config.host,
      user: config.user,
      password: config.password,
      secure: config.secure,
    });
    console.log('Conectado com sucesso!\n');

    // Navegar para o diretório remoto
    console.log(`Navegando para ${config.remotePath}...`);
    await client.ensureDir(config.remotePath);
    console.log('Diretório OK!\n');

    // Upload de todos os arquivos
    console.log('Iniciando upload dos arquivos...\n');
    await client.uploadFromDir(config.localPath, config.remotePath);

    console.log('\n========================================');
    console.log('DEPLOY CONCLUÍDO COM SUCESSO!');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n========================================');
    console.error('ERRO NO DEPLOY:');
    console.error('========================================');
    console.error(error.message);

    if (error.message.includes('530')) {
      console.error('\nCredenciais inválidas. Verifique usuário e senha.');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('\nServidor não encontrado. Verifique o host FTP.');
    } else if (error.message.includes('ETIMEDOUT')) {
      console.error('\nTimeout de conexão. Verifique sua rede ou o servidor.');
    }

    process.exit(1);
  } finally {
    client.close();
  }
}

// Executar deploy
deploy();
