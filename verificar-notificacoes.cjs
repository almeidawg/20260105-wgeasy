// ============================================================
// SCRIPT: Verificar e corrigir notificações em branco
// Executa consultas no Supabase para diagnosticar o problema
// ============================================================

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ahlqzzkxuutwoepirpzr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3MTI0MywiZXhwIjoyMDc2MTQ3MjQzfQ.xWNEmZumCtyRdrIiotUIL41jlI168HyBgM4yHVDXPZo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function verificarNotificacoes() {
  console.log('============================================================');
  console.log('DIAGNÓSTICO DE NOTIFICAÇÕES - WG Easy');
  console.log('============================================================\n');

  try {
    // 1. Contar total de notificações
    const { count: total } = await supabase
      .from('notificacoes_sistema')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Total de notificações: ${total}`);

    // 2. Contar notificações não lidas
    const { count: naoLidas } = await supabase
      .from('notificacoes_sistema')
      .select('*', { count: 'exact', head: true })
      .eq('lida', false);

    console.log(`📬 Notificações não lidas: ${naoLidas}`);

    // 3. Verificar notificações com título vazio ou null
    const { data: semTitulo, count: countSemTitulo } = await supabase
      .from('notificacoes_sistema')
      .select('*', { count: 'exact' })
      .or('titulo.is.null,titulo.eq.');

    console.log(`⚠️ Notificações SEM título: ${countSemTitulo || 0}`);

    // 4. Verificar notificações com mensagem vazia ou null
    const { data: semMensagem, count: countSemMensagem } = await supabase
      .from('notificacoes_sistema')
      .select('*', { count: 'exact' })
      .or('mensagem.is.null,mensagem.eq.');

    console.log(`⚠️ Notificações SEM mensagem: ${countSemMensagem || 0}`);

    // 5. Listar últimas 10 notificações
    const { data: ultimas, error } = await supabase
      .from('notificacoes_sistema')
      .select('id, tipo, titulo, mensagem, lida, criado_em')
      .order('criado_em', { ascending: false })
      .limit(10);

    if (error) {
      console.error('\n❌ Erro ao buscar notificações:', error.message);
      return;
    }

    console.log('\n📋 ÚLTIMAS 10 NOTIFICAÇÕES:');
    console.log('─'.repeat(80));

    if (ultimas && ultimas.length > 0) {
      ultimas.forEach((n, i) => {
        console.log(`\n${i + 1}. [${n.tipo || 'sem-tipo'}] ${n.lida ? '✓' : '○'}`);
        console.log(`   Título: "${n.titulo || '(VAZIO)'}"`);
        console.log(`   Mensagem: "${n.mensagem || '(VAZIO)'}"`);
        console.log(`   Data: ${n.criado_em}`);
      });
    } else {
      console.log('   Nenhuma notificação encontrada.');
    }

    // 6. Verificar estrutura da tabela
    console.log('\n\n📐 ESTRUTURA DA TABELA:');
    console.log('─'.repeat(80));

    const { data: colunas } = await supabase.rpc('get_table_columns', {
      p_table_name: 'notificacoes_sistema'
    }).catch(() => ({ data: null }));

    if (!colunas) {
      // Alternativa: listar uma linha para ver campos
      const { data: amostra } = await supabase
        .from('notificacoes_sistema')
        .select('*')
        .limit(1);

      if (amostra && amostra[0]) {
        console.log('Campos disponíveis:', Object.keys(amostra[0]).join(', '));
      }
    }

    // 7. Verificar políticas RLS
    console.log('\n\n🔒 VERIFICAÇÃO DE ACESSO:');
    console.log('─'.repeat(80));
    console.log('   Este script usa SERVICE_ROLE_KEY (bypass RLS)');
    console.log('   Se as notificações aparecem aqui mas não no frontend,');
    console.log('   o problema pode ser nas políticas RLS ou no usuário logado.');

    // 8. Sugerir correções
    if ((countSemTitulo || 0) > 0 || (countSemMensagem || 0) > 0) {
      console.log('\n\n💡 CORREÇÕES SUGERIDAS:');
      console.log('─'.repeat(80));
      console.log('   Execute o seguinte SQL no Supabase para corrigir notificações vazias:\n');
      console.log(`
UPDATE notificacoes_sistema
SET
  titulo = CASE
    WHEN titulo IS NULL OR titulo = '' THEN
      CASE tipo
        WHEN 'cadastro_pendente' THEN 'Novo Cadastro Pendente'
        WHEN 'nova_solicitacao' THEN 'Nova Solicitação'
        WHEN 'movimento_sistema' THEN 'Movimentação no Sistema'
        ELSE 'Notificação do Sistema'
      END
    ELSE titulo
  END,
  mensagem = CASE
    WHEN mensagem IS NULL OR mensagem = '' THEN 'Clique para ver detalhes'
    ELSE mensagem
  END
WHERE titulo IS NULL OR titulo = '' OR mensagem IS NULL OR mensagem = '';
      `);
    }

  } catch (err) {
    console.error('Erro geral:', err);
  }
}

verificarNotificacoes();
