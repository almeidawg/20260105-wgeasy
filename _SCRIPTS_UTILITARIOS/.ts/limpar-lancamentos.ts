// Script para limpar todos os lançamentos financeiros
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ahlqzzkxuutwoepirpzr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NzEyNDMsImV4cCI6MjA3NjE0NzI0M30.gLz5lpB5YlQpTfxzJjmILZwGp_H_XsT81nM2vXDbs7Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function limparLancamentos() {
  console.log('🗑️ Iniciando limpeza de lançamentos financeiros...');

  try {
    // 1. Verificar cobranças existentes
    console.log('📋 Verificando cobranças...');
    const { data: cobrancas, error: cobrancasError } = await supabase
      .from('cobrancas')
      .select('id, lancamento_id');

    if (cobrancasError) {
      console.error('❌ Erro ao buscar cobranças:', cobrancasError);
    } else {
      console.log(`📊 Encontradas ${cobrancas?.length || 0} cobranças`);

      if (cobrancas && cobrancas.length > 0) {
        // Deletar cada cobrança individualmente
        for (const cobranca of cobrancas) {
          const { error: delError } = await supabase
            .from('cobrancas')
            .delete()
            .eq('id', cobranca.id);

          if (delError) {
            console.error(`❌ Erro ao deletar cobrança ${cobranca.id}:`, delError);
          } else {
            console.log(`✅ Cobrança ${cobranca.id} deletada`);
          }
        }
      }
    }

    // 2. Buscar todos os lançamentos
    const { data: lancamentos, error: selectError } = await supabase
      .from('financeiro_lancamentos')
      .select('id');

    if (selectError) {
      console.error('❌ Erro ao buscar lançamentos:', selectError);
      return;
    }

    if (!lancamentos || lancamentos.length === 0) {
      console.log('✅ Nenhum lançamento encontrado para deletar.');
      return;
    }

    console.log(`📊 Encontrados ${lancamentos.length} lançamentos para deletar...`);

    // 3. Deletar cada lançamento individualmente
    let deletados = 0;
    for (const lanc of lancamentos) {
      const { error: deleteError } = await supabase
        .from('financeiro_lancamentos')
        .delete()
        .eq('id', lanc.id);

      if (deleteError) {
        console.error(`❌ Erro ao deletar lançamento ${lanc.id}:`, deleteError);
      } else {
        deletados++;
      }
    }

    console.log(`✅ Limpeza concluída! ${deletados} de ${lancamentos.length} lançamentos deletados.`);

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

limparLancamentos();
