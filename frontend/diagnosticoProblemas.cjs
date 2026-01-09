/**
 * Diagnóstico dos problemas reportados:
 * 1. Fotos não indo para Google Drive
 * 2. Verificar notificações
 */
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ahlqzzkxuutwoepirpzr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('════════════════════════════════════════════════════════');
  console.log(' DIAGNÓSTICO DE PROBLEMAS');
  console.log('════════════════════════════════════════════════════════\n');

  // 1. Verificar cliente Eliana e seu drive_link
  console.log('1. VERIFICANDO CLIENTE ELIANA E GOOGLE DRIVE');
  console.log('─'.repeat(50));

  const { data: eliana } = await supabase
    .from('pessoas')
    .select('id, nome, drive_link, email')
    .ilike('nome', '%eliana%')
    .limit(1)
    .single();

  if (eliana) {
    console.log('   Nome:', eliana.nome);
    console.log('   ID:', eliana.id);
    console.log('   Email:', eliana.email || 'Não informado');
    console.log('   Drive Link:', eliana.drive_link || '❌ NÃO CONFIGURADO');

    if (!eliana.drive_link) {
      console.log('\n   ⚠️ PROBLEMA: Cliente não tem Google Drive configurado!');
      console.log('   As fotos estão sendo salvas apenas no Supabase Storage.');
    }
  }

  // 2. Verificar última foto enviada
  console.log('\n\n2. ÚLTIMA FOTO ENVIADA PARA ELIANA');
  console.log('─'.repeat(50));

  const { data: registros } = await supabase
    .from('obra_registros')
    .select(`
      id,
      titulo,
      data_registro,
      obra_registros_fotos (
        id,
        arquivo_url,
        criado_em
      )
    `)
    .eq('cliente_id', eliana?.id)
    .order('data_registro', { ascending: false })
    .limit(3);

  if (registros && registros.length > 0) {
    registros.forEach(r => {
      console.log(`\n   Registro: ${r.titulo || r.id}`);
      console.log(`   Data: ${r.data_registro}`);
      console.log(`   Fotos: ${r.obra_registros_fotos?.length || 0}`);
      if (r.obra_registros_fotos?.length > 0) {
        r.obra_registros_fotos.forEach((f, i) => {
          console.log(`     ${i+1}. ${f.arquivo_url}`);
        });
      }
    });
  } else {
    console.log('   Nenhum registro encontrado para esta cliente');
  }

  // 3. Verificar notificações no sistema
  console.log('\n\n3. NOTIFICAÇÕES RECENTES NO SISTEMA');
  console.log('─'.repeat(50));

  const { data: notificacoes } = await supabase
    .from('notificacoes_sistema')
    .select('*')
    .order('criado_em', { ascending: false })
    .limit(10);

  if (notificacoes && notificacoes.length > 0) {
    console.log(`   Total encontrado: ${notificacoes.length} notificações recentes\n`);
    notificacoes.forEach((n, i) => {
      console.log(`   ${i+1}. [${n.tipo}] ${n.titulo}`);
      console.log(`      Lida: ${n.lida ? 'Sim' : 'Não'}`);
      console.log(`      Para todos admins: ${n.para_todos_admins ? 'Sim' : 'Não'}`);
      console.log(`      Criado em: ${new Date(n.criado_em).toLocaleString('pt-BR')}`);
      console.log('');
    });
  } else {
    console.log('   ❌ Nenhuma notificação encontrada no sistema');
  }

  // 4. Verificar se há trigger/função que cria notificações para pedidos_materiais
  console.log('\n\n4. PEDIDOS DE MATERIAIS RECENTES (sem notificação?)');
  console.log('─'.repeat(50));

  const { data: pedidos } = await supabase
    .from('pedidos_materiais')
    .select('id, descricao, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (pedidos && pedidos.length > 0) {
    pedidos.forEach((p, i) => {
      console.log(`   ${i+1}. ${p.descricao?.substring(0, 50)}...`);
      console.log(`      Status: ${p.status}`);
      console.log(`      Criado em: ${new Date(p.created_at).toLocaleString('pt-BR')}`);
      console.log('');
    });
  }

  // 5. Verificar usuários master/admin
  console.log('\n\n5. USUÁRIOS MASTER/ADMIN (para notificações)');
  console.log('─'.repeat(50));

  const { data: admins } = await supabase
    .from('usuarios')
    .select('id, nome, tipo_usuario, email_contato')
    .in('tipo_usuario', ['MASTER', 'ADMIN', 'master', 'admin', 'GESTOR', 'gestor'])
    .limit(10);

  if (admins && admins.length > 0) {
    admins.forEach((a, i) => {
      console.log(`   ${i+1}. ${a.nome || 'Sem nome'} (${a.tipo_usuario})`);
      console.log(`      ID: ${a.id}`);
      console.log(`      Email: ${a.email_contato || 'Não informado'}`);
    });
  } else {
    console.log('   ❌ Nenhum usuário master/admin encontrado');
  }

  console.log('\n════════════════════════════════════════════════════════');
  console.log(' FIM DO DIAGNÓSTICO');
  console.log('════════════════════════════════════════════════════════');
}

main().catch(console.error);
