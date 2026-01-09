const fs = require('fs');
const { Client } = require('pg');

const sql = fs.readFileSync('./supabase/migrations/20260109100000_fix_missing_views_and_functions.sql', 'utf8');

const client = new Client({
  host: 'aws-1-sa-east-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.ahlqzzkxuutwoepirpzr',
  password: '130300@$Wgalmeida',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    await client.connect();
    console.log('Conectado ao Supabase!');
    await client.query(sql);
    console.log('Migration executada com sucesso!');
  } catch (err) {
    console.error('Erro:', err.message);
    if (err.detail) console.error('Detalhe:', err.detail);
    if (err.hint) console.error('Dica:', err.hint);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
