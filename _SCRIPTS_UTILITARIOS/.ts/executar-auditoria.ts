// Script para executar auditoria do workflow comercial
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ahlqzzkxuutwoepirpzr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NzEyNDMsImV4cCI6MjA3NjE0NzI0M30.gLz5lpB5YlQpTfxzJjmILZwGp_H_XsT81nM2vXDbs7Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executarAuditoria() {
  console.log('\n========================================');
  console.log('AUDITORIA WORKFLOW COMERCIAL - WGEasy');
  console.log('========================================\n');

  // 1. Contar propostas sem oportunidade
  console.log('📊 PROPOSTAS SEM OPORTUNIDADE:');
  const { data: propostas, error: errPropostas } = await supabase
    .from('propostas')
    .select('id, oportunidade_id', { count: 'exact' });

  if (errPropostas) {
    console.log('  Erro:', errPropostas.message);
  } else {
    const total = propostas?.length || 0;
    const comOportunidade = propostas?.filter(p => p.oportunidade_id).length || 0;
    const semOportunidade = total - comOportunidade;
    console.log(`  Total: ${total}`);
    console.log(`  Com oportunidade: ${comOportunidade}`);
    console.log(`  SEM oportunidade: ${semOportunidade}`);
  }

  // 2. Contar contratos sem proposta
  console.log('\n📊 CONTRATOS SEM PROPOSTA:');
  const { data: contratos, error: errContratos } = await supabase
    .from('contratos')
    .select('id, proposta_id', { count: 'exact' });

  if (errContratos) {
    console.log('  Erro:', errContratos.message);
  } else {
    const total = contratos?.length || 0;
    const comProposta = contratos?.filter(c => c.proposta_id).length || 0;
    const semProposta = total - comProposta;
    console.log(`  Total: ${total}`);
    console.log(`  Com proposta: ${comProposta}`);
    console.log(`  SEM proposta: ${semProposta}`);

    // Se houver contratos sem proposta, listar
    if (semProposta > 0) {
      console.log('\n⚠️  CONTRATOS ÓRFÃOS (sem proposta):');
      const orfaos = contratos?.filter(c => !c.proposta_id) || [];
      for (const c of orfaos.slice(0, 10)) {
        // Buscar detalhes
        const { data: detalhe } = await supabase
          .from('contratos')
          .select('numero, titulo, status, cliente_id')
          .eq('id', c.id)
          .single();
        if (detalhe) {
          console.log(`  - ${detalhe.numero || 'S/N'}: ${detalhe.titulo || 'Sem título'} (${detalhe.status})`);
        }
      }
      if (orfaos.length > 10) {
        console.log(`  ... e mais ${orfaos.length - 10} contratos`);
      }
    }
  }

  console.log('\n========================================');
  console.log('AUDITORIA CONCLUÍDA');
  console.log('========================================\n');
}

executarAuditoria().catch(console.error);
