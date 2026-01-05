// Script para popular composições completas
import { readFileSync } from 'fs';
import pg from 'pg';

const { Client } = pg;

// Conexão direta ao banco
const connectionString = 'postgresql://postgres:130300%40%24Wgalmeida@db.ahlqzzkxuutwoepirpzr.supabase.co:5432/postgres';

async function executarSQL() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║  POPULAR COMPOSIÇÕES COMPLETAS                               ║');
    console.log('║  WGeasy - Grupo WG Almeida                                   ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    console.log('🔌 Conectando ao Supabase...');
    await client.connect();
    console.log('✅ Conectado com sucesso!\n');

    // Ler o arquivo SQL
    const sqlFile = readFileSync('./database/POPULAR-COMPOSICOES-COMPLETAS.sql', 'utf-8');

    console.log('📄 Arquivo SQL carregado');
    console.log('⏳ Executando inserções de composições...\n');

    // Executar o SQL
    await client.query(sqlFile);

    console.log('✅ SQL executado com sucesso!\n');

    // Verificar contagens
    console.log('📊 Verificando resultados...\n');

    const composicoes = await client.query('SELECT COUNT(*) FROM modelos_composicao');
    const composicoesItens = await client.query('SELECT COUNT(*) FROM modelos_composicao_itens');

    console.log(`   📦 modelos_composicao: ${composicoes.rows[0].count} registros`);
    console.log(`   📋 modelos_composicao_itens: ${composicoesItens.rows[0].count} registros`);

    // Listar composições por disciplina
    const porDisciplina = await client.query(`
      SELECT disciplina, COUNT(*) as total
      FROM modelos_composicao
      GROUP BY disciplina
      ORDER BY disciplina
    `);

    console.log('\n   📊 Composições por disciplina:');
    for (const row of porDisciplina.rows) {
      console.log(`      - ${row.disciplina}: ${row.total}`);
    }

    // Listar todas as composições
    const todasComposicoes = await client.query(`
      SELECT c.codigo, c.nome, c.disciplina, COUNT(i.id) as itens
      FROM modelos_composicao c
      LEFT JOIN modelos_composicao_itens i ON c.id = i.composicao_id
      GROUP BY c.id, c.codigo, c.nome, c.disciplina
      ORDER BY c.disciplina, c.codigo
    `);

    console.log('\n   📋 Todas as composições:');
    let currentDisciplina = '';
    for (const row of todasComposicoes.rows) {
      if (row.disciplina !== currentDisciplina) {
        currentDisciplina = row.disciplina;
        console.log(`\n      [${currentDisciplina}]`);
      }
      console.log(`         ${row.codigo} - ${row.nome} (${row.itens} itens)`);
    }

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ COMPOSIÇÕES POPULADAS COM SUCESSO!                       ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');

  } catch (error: any) {
    console.error('\n❌ ERRO:', error.message || error);

    if (error.detail) {
      console.error('   Detalhe:', error.detail);
    }
    if (error.hint) {
      console.error('   Dica:', error.hint);
    }
    if (error.position) {
      console.error('   Posição no SQL:', error.position);
    }
  } finally {
    await client.end();
    console.log('\n🔌 Conexão fechada.');
  }
}

executarSQL();
