/**
 * 🔍 DIAGNÓSTICO DO MÓDULO CRONOGRAMA
 * Execute este script para verificar se tudo está configurado corretamente
 */

import { supabaseRaw } from './lib/supabaseClient';

async function diagnosticoCronograma() {
  console.log('='.repeat(80));
  console.log('🔍 INICIANDO DIAGNÓSTICO DO MÓDULO CRONOGRAMA');
  console.log('='.repeat(80));

  const erros: string[] = [];
  const avisos: string[] = [];
  const sucessos: string[] = [];

  // 1. VERIFICAR AUTENTICAÇÃO
  console.log('\n1️⃣ VERIFICANDO AUTENTICAÇÃO...');
  try {
    const { data: { user }, error } = await supabaseRaw.auth.getUser();
    if (error) throw error;

    if (user) {
      sucessos.push(`✅ Usuário autenticado: ${user.email}`);
      console.log(`✅ Usuário autenticado: ${user.email}`);
    } else {
      erros.push('❌ Nenhum usuário autenticado');
      console.log('❌ Nenhum usuário autenticado');
    }
  } catch (error: any) {
    erros.push(`❌ Erro de autenticação: ${error.message}`);
    console.log(`❌ Erro de autenticação: ${error.message}`);
  }

  // 2. VERIFICAR TABELA ENTITIES (usada pelos projetos)
  console.log('\n2️⃣ VERIFICANDO TABELA ENTITIES (Clientes)...');
  try {
    const { data, error } = await supabaseRaw
      .from('entities')
      .select('id, nome_razao_social, tipo, endereco')
      .eq('tipo', 'cliente')
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
      sucessos.push(`✅ Tabela entities OK - ${data.length} cliente encontrado`);
      console.log(`✅ Tabela entities OK - Estrutura correta`);
      console.log(`   Campos: id, nome_razao_social, tipo, endereco`);
    } else {
      avisos.push('⚠️ Tabela entities existe mas não tem clientes cadastrados');
      console.log('⚠️ Tabela entities existe mas não tem clientes cadastrados');
      console.log('   Você precisa cadastrar clientes antes de criar projetos!');
    }
  } catch (error: any) {
    erros.push(`❌ Erro na tabela entities: ${error.message}`);
    console.log(`❌ Erro na tabela entities: ${error.message}`);
  }

  // 3. VERIFICAR TABELA TEAM_MEMBERS
  console.log('\n3️⃣ VERIFICANDO TABELA TEAM_MEMBERS...');
  try {
    const { data, error, count } = await supabaseRaw
      .from('team_members')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    sucessos.push(`✅ Tabela team_members OK - ${count || 0} membros`);
    console.log(`✅ Tabela team_members OK - ${count || 0} membros cadastrados`);
  } catch (error: any) {
    erros.push(`❌ Tabela team_members: ${error.message}`);
    console.log(`❌ Tabela team_members: ${error.message}`);
    console.log('   ⚠️ Você executou o SQL no Supabase?');
  }

  // 4. VERIFICAR TABELA CATALOG_ITEMS
  console.log('\n4️⃣ VERIFICANDO TABELA CATALOG_ITEMS...');
  try {
    const { data, error, count } = await supabaseRaw
      .from('catalog_items')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    sucessos.push(`✅ Tabela catalog_items OK - ${count || 0} itens`);
    console.log(`✅ Tabela catalog_items OK - ${count || 0} itens no catálogo`);
  } catch (error: any) {
    erros.push(`❌ Tabela catalog_items: ${error.message}`);
    console.log(`❌ Tabela catalog_items: ${error.message}`);
  }

  // 5. VERIFICAR TABELA PROJECTS
  console.log('\n5️⃣ VERIFICANDO TABELA PROJECTS...');
  try {
    const { data, error, count } = await supabaseRaw
      .from('projects')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    sucessos.push(`✅ Tabela projects OK - ${count || 0} projetos`);
    console.log(`✅ Tabela projects OK - ${count || 0} projetos cadastrados`);
  } catch (error: any) {
    erros.push(`❌ Tabela projects: ${error.message}`);
    console.log(`❌ Tabela projects: ${error.message}`);
  }

  // 6. VERIFICAR TABELA PROJECT_ITEMS
  console.log('\n6️⃣ VERIFICANDO TABELA PROJECT_ITEMS...');
  try {
    const { data, error, count } = await supabaseRaw
      .from('project_items')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    sucessos.push(`✅ Tabela project_items OK`);
    console.log(`✅ Tabela project_items OK`);
  } catch (error: any) {
    erros.push(`❌ Tabela project_items: ${error.message}`);
    console.log(`❌ Tabela project_items: ${error.message}`);
  }

  // 7. VERIFICAR TABELA TASKS
  console.log('\n7️⃣ VERIFICANDO TABELA TASKS...');
  try {
    const { data, error, count } = await supabaseRaw
      .from('tasks')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    sucessos.push(`✅ Tabela tasks OK`);
    console.log(`✅ Tabela tasks OK`);
  } catch (error: any) {
    erros.push(`❌ Tabela tasks: ${error.message}`);
    console.log(`❌ Tabela tasks: ${error.message}`);
  }

  // 8. VERIFICAR STORAGE BUCKET AVATARES
  console.log('\n8️⃣ VERIFICANDO STORAGE BUCKET AVATARES...');
  try {
    const { data, error } = await supabaseRaw.storage.getBucket('avatars');

    if (error) throw error;

    sucessos.push(`✅ Bucket avatars OK`);
    console.log(`✅ Bucket avatars configurado corretamente`);
  } catch (error: any) {
    avisos.push(`⚠️ Bucket avatars: ${error.message}`);
    console.log(`⚠️ Bucket avatars pode não estar configurado`);
    console.log('   Upload de fotos pode não funcionar');
  }

  // RESUMO FINAL
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESUMO DO DIAGNÓSTICO');
  console.log('='.repeat(80));

  console.log(`\n✅ SUCESSOS: ${sucessos.length}`);
  sucessos.forEach(s => console.log(`   ${s}`));

  if (avisos.length > 0) {
    console.log(`\n⚠️ AVISOS: ${avisos.length}`);
    avisos.forEach(a => console.log(`   ${a}`));
  }

  if (erros.length > 0) {
    console.log(`\n❌ ERROS: ${erros.length}`);
    erros.forEach(e => console.log(`   ${e}`));
  }

  console.log('\n' + '='.repeat(80));

  if (erros.length === 0) {
    console.log('🎉 TUDO FUNCIONANDO PERFEITAMENTE!');
    console.log('   Você pode usar o módulo cronograma normalmente.');
  } else {
    console.log('⚠️ AÇÃO NECESSÁRIA:');
    console.log('   1. Verifique se executou o SQL no Supabase');
    console.log('   2. Verifique as RLS policies das tabelas');
    console.log('   3. Verifique se está autenticado no sistema');
  }

  console.log('='.repeat(80) + '\n');

  return {
    sucessos,
    avisos,
    erros,
    todosOk: erros.length === 0
  };
}

// Exportar para uso
export default diagnosticoCronograma;

// Se executado diretamente
if (typeof window !== 'undefined') {
  (window as any).diagnosticoCronograma = diagnosticoCronograma;
  console.log('💡 Execute "diagnosticoCronograma()" no console para testar!');
}
