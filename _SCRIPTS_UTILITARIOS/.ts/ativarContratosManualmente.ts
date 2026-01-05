// ============================================================
// SCRIPT: Ativar Contratos Manualmente
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ahlqzzkxuutwoepirpzr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwMzI5NTIsImV4cCI6MjA0NzYwODk1Mn0.FiION-pEHdZIq0QAJQ8W51aGfg5_kRkWWH7i0Xhm7Mc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function ativarContratosManuais() {
  console.log('🚀 Iniciando ativação manual dos contratos...\n');

  // 1. Buscar contratos em rascunho
  const { data: contratos, error: contratosError } = await supabase
    .from('contratos')
    .select('*')
    .eq('status', 'rascunho')
    .in('numero', ['ENG-2025-0001', 'ARQ-2025-0001', 'MAR-2025-0001']);

  if (contratosError) {
    console.error('❌ Erro ao buscar contratos:', contratosError);
    return;
  }

  console.log(`📋 Encontrados ${contratos.length} contratos para ativar\n`);

  for (const contrato of contratos) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔄 Ativando contrato ${contrato.numero} (${contrato.unidade_negocio})`);
    console.log(`${'='.repeat(60)}\n`);

    try {
      // 1. Atualizar status do contrato para "ativo"
      console.log('1️⃣ Atualizando status do contrato...');
      const { error: updateError } = await supabase
        .from('contratos')
        .update({ status: 'ativo' })
        .eq('id', contrato.id);

      if (updateError) throw updateError;
      console.log('   ✅ Status atualizado para "ativo"\n');

      // 2. Criar projeto
      console.log('2️⃣ Criando projeto...');
      const { data: projeto, error: projetoError } = await supabase
        .from('projetos')
        .insert({
          nome: `Projeto - ${contrato.numero}`,
          descricao: contrato.descricao || `Projeto gerado do contrato ${contrato.numero}`,
          cliente_id: contrato.cliente_id,
          contrato_id: contrato.id,
          data_inicio: new Date().toISOString().split('T')[0],
          status: 'planejamento',
        })
        .select()
        .single();

      if (projetoError) throw projetoError;
      console.log(`   ✅ Projeto criado: ${projeto.nome}\n`);

      // 3. Criar lançamento financeiro
      console.log('3️⃣ Criando lançamento financeiro...');
      const { data: lancamento, error: lancamentoError } = await supabase
        .from('financeiro_lancamentos')
        .insert({
          tipo: 'entrada',
          descricao: `Receita do contrato ${contrato.numero} - ${contrato.unidade_negocio.toUpperCase()}`,
          valor_total: contrato.valor_total,
          pessoa_id: contrato.cliente_id,
          contrato_id: contrato.id,
          unidade_negocio: contrato.unidade_negocio,
          data_competencia: new Date().toISOString().split('T')[0],
          status: 'previsto',
        })
        .select()
        .single();

      if (lancamentoError) throw lancamentoError;
      console.log(`   ✅ Lançamento criado: R$ ${contrato.valor_total}\n`);

      console.log(`✅ Contrato ${contrato.numero} ativado com sucesso!`);
      console.log(`   - Projeto: ✅`);
      console.log(`   - Financeiro: ✅`);
      console.log(`   - Núcleo: ${contrato.unidade_negocio}\n`);

    } catch (error: any) {
      console.error(`❌ Erro ao ativar contrato ${contrato.numero}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ ATIVAÇÃO CONCLUÍDA!');
  console.log('='.repeat(60));
}

// Executar
ativarContratosManuais();
