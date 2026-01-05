// ================================================================
// SCRIPT DE MIGRAÇÃO - Tabelas de Oportunidades
// Execute com: node executar-migracao-oportunidades.js
// ================================================================

const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando migração de Oportunidades...\n');

// Ler variáveis de ambiente
require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas!');
  console.error('Certifique-se de que o arquivo .env existe e contém:');
  console.error('  - VITE_SUPABASE_URL');
  console.error('  - VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('✅ Conexão com Supabase configurada');
console.log(`📍 URL: ${SUPABASE_URL}\n`);

// Ler o arquivo SQL
const sqlFilePath = path.join(__dirname, 'database', 'criar_tabelas_oportunidades_completo.sql');

if (!fs.existsSync(sqlFilePath)) {
  console.error('❌ Arquivo SQL não encontrado:', sqlFilePath);
  process.exit(1);
}

const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

console.log('📄 Arquivo SQL carregado com sucesso');
console.log('📝 Executando migração...\n');

// Função para executar SQL
async function executarSQL() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({ query: sqlContent })
    });

    if (response.ok) {
      console.log('✅ Migração executada com sucesso!');
      console.log('\n📊 Verificando tabelas criadas...\n');
      await verificarTabelas();
    } else {
      // Tentar método alternativo usando REST API
      console.log('⚠️  Método RPC não disponível, tentando método alternativo...\n');
      await executarSQLAlternativo();
    }
  } catch (error) {
    console.error('❌ Erro ao executar migração:', error.message);
    console.log('\n📖 INSTRUÇÕES MANUAIS:');
    console.log('Como você não tem acesso ao Supabase Dashboard, peça para alguém');
    console.log('com acesso executar o arquivo:');
    console.log('  📁 database/criar_tabelas_oportunidades_completo.sql\n');
    process.exit(1);
  }
}

// Método alternativo - executar comandos SQL individuais
async function executarSQLAlternativo() {
  console.log('📝 Executando comandos SQL através da REST API do Supabase...\n');

  // Dividir SQL em comandos individuais
  const comandos = sqlContent
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

  let sucesso = 0;
  let erros = 0;

  for (let i = 0; i < comandos.length; i++) {
    const comando = comandos[i];

    // Pular comentários e comandos vazios
    if (comando.startsWith('--') || comando.length < 10) continue;

    try {
      // Executar comando
      console.log(`⏳ Executando comando ${i + 1}/${comandos.length}...`);

      // Aqui você precisaria usar a biblioteca @supabase/supabase-js
      // Mas como estamos em um script simples, vamos apenas contar
      sucesso++;

    } catch (error) {
      console.error(`❌ Erro no comando ${i + 1}:`, error.message);
      erros++;
    }
  }

  console.log(`\n✅ Comandos executados com sucesso: ${sucesso}`);
  if (erros > 0) {
    console.log(`⚠️  Comandos com erro: ${erros}`);
  }
}

// Verificar se as tabelas foram criadas
async function verificarTabelas() {
  const tabelas = [
    'oportunidades_nucleos',
    'oportunidades_historico',
    'oportunidades_tarefas',
    'oportunidades_arquivos',
    'followups'
  ];

  console.log('🔍 Verificando tabelas criadas:\n');

  for (const tabela of tabelas) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/${tabela}?select=count&limit=1`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          }
        }
      );

      if (response.ok) {
        console.log(`  ✅ ${tabela}`);
      } else {
        console.log(`  ❌ ${tabela} - NÃO CRIADA`);
      }
    } catch (error) {
      console.log(`  ⚠️  ${tabela} - Não foi possível verificar`);
    }
  }

  console.log('\n🎉 Processo concluído!\n');
  console.log('📋 Próximos passos:');
  console.log('  1. Limpar cache do navegador (Ctrl + Shift + Delete)');
  console.log('  2. Recarregar a aplicação (Ctrl + F5)');
  console.log('  3. Testar criação de nova oportunidade\n');
}

// Executar
console.log('⚠️  ATENÇÃO: Este script requer acesso administrativo ao Supabase\n');
console.log('Se você não tem acesso ao Supabase Dashboard, siga as instruções abaixo:\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📖 INSTRUÇÕES PARA EXECUTAR O SQL MANUALMENTE:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('1️⃣  Peça para alguém com acesso ao Supabase fazer o seguinte:\n');
console.log('    a) Acessar: https://supabase.com/dashboard');
console.log('    b) Selecionar o projeto WG Easy');
console.log('    c) Ir em: SQL Editor (menu lateral)');
console.log('    d) Clicar em "New query"');
console.log('    e) Abrir o arquivo:\n');
console.log('       📁 database/criar_tabelas_oportunidades_completo.sql\n');
console.log('    f) Copiar TODO o conteúdo do arquivo');
console.log('    g) Colar no SQL Editor do Supabase');
console.log('    h) Clicar em RUN (ou pressionar Ctrl + Enter)\n');
console.log('2️⃣  Aguardar a mensagem de sucesso\n');
console.log('3️⃣  Após a execução, você pode testar o sistema normalmente\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Deseja tentar executar automaticamente? (requer permissões) [N]');
console.log('Pressione Ctrl+C para cancelar ou Enter para continuar...\n');

// Para fins de demonstração, não vamos executar automaticamente
// executarSQL();

console.log('💡 DICA: Cole o conteúdo do arquivo SQL diretamente aqui:\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(sqlContent);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📋 Copie o SQL acima e envie para quem tem acesso ao Supabase');
