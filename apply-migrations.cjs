// Script para aplicar migrations SQL no Supabase
// Executa via service role key

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SR_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function executeSql(sql, description) {
  console.log(`\n>>> Executando: ${description}`);

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    // Tentar via função postgres direta
    const { error: error2 } = await supabase.from('_migrations_log').select('*').limit(0);
    if (error2) {
      console.log(`   Nota: RPC exec_sql não disponível, tentando método alternativo...`);
    }
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

async function applyMigration() {
  console.log('='.repeat(60));
  console.log('APLICANDO MIGRATIONS SQL - WG Easy Sistema');
  console.log('='.repeat(60));
  console.log(`URL: ${supabaseUrl}`);

  // SQL dividido em partes menores para execução
  const sqlParts = [
    {
      name: '1. Remover trigger antigo',
      sql: `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`
    },
    {
      name: '2. Criar função handle_new_user',
      sql: `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_pessoa_id UUID;
  v_tipo_usuario TEXT;
BEGIN
  v_pessoa_id := (NEW.raw_user_meta_data->>'pessoa_id')::UUID;
  v_tipo_usuario := COALESCE(NEW.raw_user_meta_data->>'tipo_usuario', 'CLIENTE');

  IF v_pessoa_id IS NOT NULL THEN
    BEGIN
      INSERT INTO public.usuarios (
        auth_user_id,
        pessoa_id,
        cpf,
        tipo_usuario,
        ativo,
        primeiro_acesso,
        criado_em,
        atualizado_em
      ) VALUES (
        NEW.id,
        v_pessoa_id,
        COALESCE(NEW.raw_user_meta_data->>'cpf', ''),
        v_tipo_usuario,
        true,
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (auth_user_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Erro ao criar registro de usuario: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`
    },
    {
      name: '3. Criar novo trigger',
      sql: `
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();`
    },
    {
      name: '4. Garantir constraint única',
      sql: `
ALTER TABLE public.usuarios DROP CONSTRAINT IF EXISTS usuarios_auth_user_id_key;
ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_auth_user_id_key UNIQUE (auth_user_id);`
    },
    {
      name: '5. Permitir NULL em pessoa_id',
      sql: `ALTER TABLE public.usuarios ALTER COLUMN pessoa_id DROP NOT NULL;`
    },
    {
      name: '6. Permitir NULL em cpf',
      sql: `ALTER TABLE public.usuarios ALTER COLUMN cpf DROP NOT NULL;`
    }
  ];

  console.log('\nNota: As migrations precisam ser aplicadas manualmente no SQL Editor do Supabase.');
  console.log('Isso ocorre porque a API do Supabase não permite executar DDL diretamente.\n');

  console.log('='.repeat(60));
  console.log('COPIE E COLE O SQL ABAIXO NO SUPABASE SQL EDITOR:');
  console.log('='.repeat(60));

  // Ler arquivo completo
  const migrationPath = path.join(__dirname, 'supabase/migrations/20260109200000_fix_auth_user_trigger.sql');
  const fullSql = fs.readFileSync(migrationPath, 'utf8');

  console.log('\n' + fullSql);

  console.log('\n' + '='.repeat(60));
  console.log('INSTRUÇÕES:');
  console.log('='.repeat(60));
  console.log('1. Acesse: https://supabase.com/dashboard/project/ahlqzzkxuutwoepirpzr/sql');
  console.log('2. Cole o SQL acima');
  console.log('3. Clique em "Run"');
  console.log('4. Verifique se não há erros');
  console.log('='.repeat(60));
}

applyMigration().catch(console.error);
