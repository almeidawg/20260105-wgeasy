/**
 * 🤖 TESTE AUTOMATIZADO COMPLETO - FLUXO PROPOSTA → CONTRATO → FINANCEIRO
 *
 * Este script testa automaticamente:
 * 1. Criar proposta com cliente existente
 * 2. Adicionar itens da pricelist
 * 3. Salvar proposta
 * 4. Aprovar proposta
 * 5. Verificar contrato criado automaticamente
 * 6. Verificar lançamentos no financeiro
 * 7. Verificar parcelas com nucleo
 * 8. Verificar cronograma
 * 9. Gerar relatório completo
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ahlqzzkxuutwoepirpzr.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3MTI0MywiZXhwIjoyMDc2MTQ3MjQzfQ.xWNEmZumCtyRdrIiotUIL41jlI168HyBgM4yHVDXPZo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface RelatorioTeste {
  sucesso: boolean;
  etapa: string;
  detalhes: any;
  erros: string[];
  tempo: number;
}

const relatorio: RelatorioTeste[] = [];

function log(emoji: string, msg: string) {
  console.log(`${emoji} ${msg}`);
}

function erro(msg: string, error?: any) {
  console.error(`❌ ${msg}`, error);
  relatorio.push({
    sucesso: false,
    etapa: msg,
    detalhes: error,
    erros: [error?.message || error],
    tempo: Date.now()
  });
}

function sucesso(etapa: string, detalhes: any) {
  log('✅', etapa);
  relatorio.push({
    sucesso: true,
    etapa,
    detalhes,
    erros: [],
    tempo: Date.now()
  });
}

async function buscarClienteTeste(): Promise<string | null> {
  log('🔍', 'Usando cliente pré-definido...');

  const clienteId = 'c88f1983-daf1-4cbd-9888-2d758ac13d3d';

  const { data, error } = await supabase
    .from('pessoas')
    .select('id, nome')
    .eq('id', clienteId)
    .single();

  if (error || !data) {
    erro('Cliente não encontrado', error);
    return null;
  }

  sucesso('Cliente encontrado', { id: data.id, nome: data.nome });
  return data.id;
}

async function buscarItensPricelist() {
  log('🔍', 'Buscando itens da pricelist...');

  const { data, error } = await supabase
    .from('pricelist_itens')
    .select('id, nome, preco, nucleo, nucleo_id, categoria')
    .limit(3);

  if (error) {
    erro('Erro ao buscar pricelist', error);
    return [];
  }

  if (!data || data.length === 0) {
    erro('Nenhum item encontrado na pricelist');
    return [];
  }

  sucesso('Itens da pricelist encontrados', { quantidade: data.length });
  return data;
}

async function buscarNucleoArquitetura() {
  const { data } = await supabase
    .from('nucleos')
    .select('id, nome')
    .ilike('nome', '%arquitetura%')
    .single();

  return data?.id || null;
}

async function criarProposta(clienteId: string, nucleoId: string | null): Promise<string | null> {
  log('📝', 'Criando proposta de teste...');

  const numero = `ARQ/${new Date().toISOString().split('T')[0].replace(/-/g, '')}-TESTE#ClienteTeste`;

  const { data, error } = await supabase
    .from('propostas')
    .insert({
      cliente_id: clienteId,
      nucleo_id: nucleoId,
      nucleo: 'arquitetura',
      titulo: 'Proposta Teste Automatizado',
      descricao: 'Proposta criada automaticamente para teste do fluxo completo',
      status: 'rascunho',
      numero: numero,
      numero_parcelas: 3
    })
    .select()
    .single();

  if (error) {
    erro('Erro ao criar proposta', error);
    return null;
  }

  sucesso('Proposta criada', { id: data.id, numero: data.numero });
  return data.id;
}

async function adicionarItens(propostaId: string, itens: any[]) {
  log('📦', 'Adicionando itens à proposta...');

  const itensParaInserir = itens.map((item, index) => ({
    proposta_id: propostaId,
    pricelist_item_id: item.id,
    nome: item.nome,
    quantidade: 10,
    valor_unitario: item.preco || 100,
    categoria: item.categoria,
    nucleo: item.nucleo,
    nucleo_id: item.nucleo_id,
    ordem: index + 1
  }));

  const { data, error } = await supabase
    .from('propostas_itens')
    .insert(itensParaInserir)
    .select();

  if (error) {
    erro('Erro ao adicionar itens', error);
    return false;
  }

  sucesso('Itens adicionados', { quantidade: data.length });
  return true;
}

async function calcularValorTotal(propostaId: string) {
  log('🧮', 'Calculando valor total da proposta...');

  const { data: itens } = await supabase
    .from('propostas_itens')
    .select('valor_subtotal')
    .eq('proposta_id', propostaId);

  const total = itens?.reduce((acc, item) => acc + (item.valor_subtotal || 0), 0) || 0;

  const { error } = await supabase
    .from('propostas')
    .update({ valor_total: total })
    .eq('id', propostaId);

  if (error) {
    erro('Erro ao atualizar valor total', error);
    return false;
  }

  sucesso('Valor total calculado', { valor: total });
  return true;
}

async function enviarProposta(propostaId: string) {
  log('📧', 'Enviando proposta...');

  const { error } = await supabase
    .from('propostas')
    .update({ status: 'enviada' })
    .eq('id', propostaId);

  if (error) {
    erro('Erro ao enviar proposta', error);
    return false;
  }

  sucesso('Proposta enviada', { status: 'enviada' });
  return true;
}

async function aprovarProposta(propostaId: string, userId: string) {
  log('✅', 'Aprovando proposta...');

  const { data, error } = await supabase.rpc('process_proposal_approval', {
    p_proposal_id: propostaId,
    p_user_id: userId
  });

  if (error) {
    erro('Erro ao aprovar proposta', error);
    return null;
  }

  if (data?.status === 'already_processed') {
    log('⚠️', 'Proposta já foi processada anteriormente');
    return null;
  }

  sucesso('Proposta aprovada', data);
  return data.contract_id;
}

async function verificarContrato(contratoId: string) {
  log('🔍', 'Verificando contrato criado...');

  const { data, error } = await supabase
    .from('contratos')
    .select('id, numero, status, valor_total, cliente_id')
    .eq('id', contratoId)
    .single();

  if (error || !data) {
    erro('Contrato não encontrado', error);
    return false;
  }

  sucesso('Contrato verificado', data);
  return true;
}

async function verificarItensContrato(contratoId: string) {
  log('🔍', 'Verificando itens do contrato...');

  const { data, error } = await supabase
    .from('contratos_itens')
    .select('id, descricao, quantidade, valor_total, nucleo, categoria')
    .eq('contrato_id', contratoId);

  if (error || !data || data.length === 0) {
    erro('Itens do contrato não encontrados', error);
    return false;
  }

  sucesso('Itens do contrato verificados', { quantidade: data.length, itens: data });
  return true;
}

async function verificarLancamentosFinanceiro(contratoId: string) {
  log('🔍', 'Verificando lançamentos no financeiro...');

  const { data, error } = await supabase
    .from('financeiro_lancamentos')
    .select('id, descricao, valor_total, nucleo, nucleo_id, tipo, status')
    .eq('contrato_id', contratoId);

  if (error) {
    erro('Erro ao buscar lançamentos', error);
    return false;
  }

  if (!data || data.length === 0) {
    erro('❌ CRÍTICO: Nenhum lançamento financeiro criado automaticamente!');
    return false;
  }

  sucesso('✅ Lançamentos financeiros criados automaticamente!', {
    quantidade: data.length,
    lancamentos: data
  });

  return data;
}

async function verificarParcelas(lancamentoId: string) {
  log('🔍', 'Verificando parcelas do lançamento...');

  const { data, error } = await supabase
    .from('financeiro_parcelas')
    .select('id, numero_parcela, valor, nucleo, nucleo_id, data_vencimento, status')
    .eq('lancamento_id', lancamentoId);

  if (error) {
    erro('Erro ao buscar parcelas', error);
    return false;
  }

  if (!data || data.length === 0) {
    erro('❌ CRÍTICO: Nenhuma parcela criada!');
    return false;
  }

  // Verificar se todas as parcelas têm nucleo preenchido
  const parcelasSemNucleo = data.filter(p => !p.nucleo);
  if (parcelasSemNucleo.length > 0) {
    erro('❌ CRÍTICO: Parcelas sem núcleo encontradas!', { parcelas: parcelasSemNucleo });
    return false;
  }

  sucesso('✅ Parcelas criadas COM núcleo preenchido!', {
    quantidade: data.length,
    parcelas: data
  });

  return true;
}

async function verificarCronograma(contratoId: string) {
  log('🔍', 'Verificando criação no cronograma...');

  const { data, error } = await supabase
    .from('projetos')
    .select('id, nome, status, cliente_id')
    .eq('contrato_id', contratoId);

  if (error) {
    erro('Erro ao buscar projeto', error);
    return false;
  }

  if (!data || data.length === 0) {
    log('⚠️', 'Nenhum projeto criado automaticamente no cronograma');
    return false;
  }

  sucesso('✅ Projeto criado automaticamente no cronograma!', data[0]);
  return true;
}

async function buscarUsuarioAdmin(): Promise<string | null> {
  const { data } = await supabase
    .from('usuarios')
    .select('id')
    .limit(1)
    .single();

  return data?.id || null;
}

async function gerarRelatorioFinal() {
  console.log('\n');
  console.log('═'.repeat(80));
  console.log('📊 RELATÓRIO FINAL DO TESTE AUTOMATIZADO');
  console.log('═'.repeat(80));
  console.log('\n');

  const sucessos = relatorio.filter(r => r.sucesso).length;
  const falhas = relatorio.filter(r => !r.sucesso).length;

  console.log(`✅ Sucessos: ${sucessos}`);
  console.log(`❌ Falhas: ${falhas}`);
  console.log('\n');

  console.log('📋 Detalhes por Etapa:');
  console.log('─'.repeat(80));

  relatorio.forEach((r, index) => {
    const emoji = r.sucesso ? '✅' : '❌';
    console.log(`${index + 1}. ${emoji} ${r.etapa}`);
    if (!r.sucesso && r.erros.length > 0) {
      console.log(`   Erro: ${r.erros[0]}`);
    }
  });

  console.log('\n');
  console.log('═'.repeat(80));

  // Verificações críticas
  const lancamentosOk = relatorio.some(r => r.etapa.includes('Lançamentos financeiros criados'));
  const parcelasOk = relatorio.some(r => r.etapa.includes('Parcelas criadas COM núcleo'));

  if (lancamentosOk && parcelasOk) {
    console.log('🎉 SUCESSO TOTAL! Fluxo automático funcionando perfeitamente!');
    console.log('✅ Lançamentos financeiros: OK');
    console.log('✅ Parcelas com núcleo: OK');
  } else {
    console.log('⚠️ PROBLEMAS ENCONTRADOS:');
    if (!lancamentosOk) {
      console.log('❌ Lançamentos financeiros NÃO estão sendo criados automaticamente');
    }
    if (!parcelasOk) {
      console.log('❌ Parcelas NÃO têm campo nucleo preenchido');
    }
  }

  console.log('═'.repeat(80));
}

async function executarTesteCompleto() {
  console.log('🤖 INICIANDO TESTE AUTOMATIZADO COMPLETO\n');

  try {
    // 1. Buscar cliente de teste
    const clienteId = await buscarClienteTeste();
    if (!clienteId) {
      throw new Error('Cliente de teste não encontrado');
    }

    // 2. Buscar usuário admin
    const userId = await buscarUsuarioAdmin();
    if (!userId) {
      throw new Error('Usuário admin não encontrado');
    }

    // 3. Buscar núcleo Arquitetura
    const nucleoId = await buscarNucleoArquitetura();

    // 4. Buscar itens da pricelist
    const itens = await buscarItensPricelist();
    if (itens.length === 0) {
      throw new Error('Nenhum item encontrado na pricelist');
    }

    // 5. Criar proposta
    const propostaId = await criarProposta(clienteId, nucleoId);
    if (!propostaId) {
      throw new Error('Falha ao criar proposta');
    }

    // 6. Adicionar itens
    const itensOk = await adicionarItens(propostaId, itens);
    if (!itensOk) {
      throw new Error('Falha ao adicionar itens');
    }

    // 7. Calcular valor total
    await calcularValorTotal(propostaId);

    // 8. Enviar proposta
    const enviadaOk = await enviarProposta(propostaId);
    if (!enviadaOk) {
      throw new Error('Falha ao enviar proposta');
    }

    // 9. Aprovar proposta
    const contratoId = await aprovarProposta(propostaId, userId);
    if (!contratoId) {
      throw new Error('Falha ao aprovar proposta');
    }

    // 10. Verificar contrato
    await verificarContrato(contratoId);

    // 11. Verificar itens do contrato
    await verificarItensContrato(contratoId);

    // 12. Verificar lançamentos financeiros (CRÍTICO)
    const lancamentos = await verificarLancamentosFinanceiro(contratoId);
    if (!lancamentos || lancamentos.length === 0) {
      throw new Error('CRÍTICO: Lançamentos financeiros não criados automaticamente!');
    }

    // 13. Verificar parcelas (CRÍTICO)
    for (const lancamento of lancamentos) {
      await verificarParcelas(lancamento.id);
    }

    // 14. Verificar cronograma
    await verificarCronograma(contratoId);

    // 15. Gerar relatório final
    await gerarRelatorioFinal();

  } catch (error: any) {
    console.error('\n❌ TESTE FALHOU:', error.message);
    await gerarRelatorioFinal();
    process.exit(1);
  }
}

// Executar teste
executarTesteCompleto().then(() => {
  console.log('\n✅ Teste finalizado!');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Erro fatal:', error);
  process.exit(1);
});
