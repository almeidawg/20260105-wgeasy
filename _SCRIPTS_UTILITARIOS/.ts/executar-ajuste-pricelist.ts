// Script para executar ajustes do Pricelist + Modelos de Orçamento
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
    console.log('║  AJUSTE PRICELIST + MODELOS DE ORÇAMENTO                     ║');
    console.log('║  WGeasy - Grupo WG Almeida                                   ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    console.log('🔌 Conectando ao Supabase...');
    await client.connect();
    console.log('✅ Conectado com sucesso!\n');

    // Ler o arquivo SQL
    const sqlFile = readFileSync('./database/AJUSTAR-PRICELIST-MODELOS-ORCAMENTO.sql', 'utf-8');

    console.log('📄 Arquivo SQL carregado');
    console.log('⏳ Executando migrations...\n');

    // Executar o SQL
    const result = await client.query(sqlFile);

    console.log('✅ SQL executado com sucesso!\n');

    // Verificar contagens
    console.log('📊 Verificando resultados...\n');

    const categorias = await client.query('SELECT COUNT(*) FROM pricelist_categorias');
    const subcategorias = await client.query('SELECT COUNT(*) FROM pricelist_subcategorias');

    // Verificar se as tabelas de composição existem antes de contar
    try {
      const composicoes = await client.query('SELECT COUNT(*) FROM modelos_composicao');
      const composicoesItens = await client.query('SELECT COUNT(*) FROM modelos_composicao_itens');
      console.log(`   📦 modelos_composicao: ${composicoes.rows[0].count} registros`);
      console.log(`   📋 modelos_composicao_itens: ${composicoesItens.rows[0].count} registros`);
    } catch (e) {
      console.log('   ⚠️  Tabelas de composição ainda não existem');
    }

    // Contar itens com classificação
    const classificados = await client.query(`
      SELECT classificacao_orcamento, COUNT(*)
      FROM pricelist_itens
      WHERE classificacao_orcamento IS NOT NULL
      GROUP BY classificacao_orcamento
    `);

    console.log(`   🏷️  pricelist_categorias: ${categorias.rows[0].count} registros`);
    console.log(`   🏷️  pricelist_subcategorias: ${subcategorias.rows[0].count} registros`);

    if (classificados.rows.length > 0) {
      console.log('\n   📊 Itens classificados no pricelist:');
      for (const row of classificados.rows) {
        console.log(`      - ${row.classificacao_orcamento}: ${row.count}`);
      }
    }

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ AJUSTES CONCLUÍDOS COM SUCESSO!                          ║');
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
