// Script para executar SQL usando pg library
import { readFileSync } from 'fs';
import pg from 'pg';

const { Client } = pg;

// Conexão direta ao banco
const connectionString = 'postgresql://postgres:WGEasy2024!@db.ahlqzzkxuutwoepirpzr.supabase.co:5432/postgres';

async function executarSQL() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('=== CONECTANDO AO SUPABASE ===\n');
    await client.connect();
    console.log('Conectado com sucesso!\n');

    // Ler o arquivo SQL
    const sqlFile = readFileSync('./database/CRIAR-SISTEMA-COMISSIONAMENTO.sql', 'utf-8');

    console.log('=== EXECUTANDO SQL DO SISTEMA DE COMISSIONAMENTO ===\n');

    // Executar o SQL
    const result = await client.query(sqlFile);

    console.log('SQL executado com sucesso!');
    console.log('Resultado:', result);

  } catch (error: any) {
    console.error('ERRO:', error.message || error);

    // Se houver detalhes do erro
    if (error.detail) {
      console.error('Detalhe:', error.detail);
    }
    if (error.hint) {
      console.error('Dica:', error.hint);
    }
  } finally {
    await client.end();
    console.log('\nConexão fechada.');
  }
}

executarSQL();
