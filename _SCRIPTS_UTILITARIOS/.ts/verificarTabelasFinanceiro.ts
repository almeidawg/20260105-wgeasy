// Script para verificar quais tabelas existem no Supabase
import { supabaseRaw as supabase } from './src/lib/supabaseClient';

async function verificarTabelas() {
  console.log('🔍 Verificando tabelas no Supabase...\n');

  const tabelasParaVerificar = [
    'fin_transactions',
    'financeiro_lancamentos',
    'fin_categories',
    'parties',
    'obras',
    'projetos',
    'pessoas'
  ];

  for (const tabela of tabelasParaVerificar) {
    try {
      const { data, error } = await supabase
        .from(tabela)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${tabela}: NÃO EXISTE ou sem permissão`);
        console.log(`   Erro: ${error.message}\n`);
      } else {
        console.log(`✅ ${tabela}: EXISTE`);
        console.log(`   Registros de exemplo: ${data?.length || 0}\n`);
      }
    } catch (err) {
      console.log(`❌ ${tabela}: ERRO ao verificar`);
      console.log(`   ${err}\n`);
    }
  }
}

verificarTabelas().then(() => {
  console.log('\n✅ Verificação concluída!');
  process.exit(0);
}).catch((err) => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
