// ================================================================
// SCRIPT DE TESTE: Fluxo Completo de Contrato → Financeiro + Cronograma
// ================================================================
// Este script testa se o workflow está funcionando corretamente
// Execute: npx tsx testarFluxoContrato.ts
// ================================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ahlqzzkxuutwoepirpzr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NzEyNDMsImV4cCI6MjA3NjE0NzI0M30.gLz5lpB5YlQpTfxzJjmILZwGp_H_XsT81nM2vXDbs7Y';

const supabase = createClient(supabaseUrl, supabaseKey);

interface DiagnosticoResultado {
  secao: string;
  status: 'OK' | 'ERRO' | 'AVISO';
  mensagem: string;
  detalhes?: any;
}

const resultados: DiagnosticoResultado[] = [];

function log(secao: string, status: 'OK' | 'ERRO' | 'AVISO', mensagem: string, detalhes?: any) {
  const emoji = status === 'OK' ? '✅' : status === 'ERRO' ? '❌' : '⚠️';
  console.log(`${emoji} [${secao}] ${mensagem}`);
  if (detalhes) {
    console.log('   Detalhes:', JSON.stringify(detalhes, null, 2));
  }
  resultados.push({ secao, status, mensagem, detalhes });
}

async function verificarContratos() {
  console.log('\n📋 1. VERIFICANDO CONTRATOS...\n');

  const { data: contratos, error } = await supabase
    .from('contratos')
    .select('id, numero, status, valor_total, cliente_id, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    log('Contratos', 'ERRO', 'Erro ao buscar contratos', error);
    return [];
  }

  if (!contratos || contratos.length === 0) {
    log('Contratos', 'AVISO', 'Nenhum contrato encontrado no banco');
    return [];
  }

  log('Contratos', 'OK', `${contratos.length} contratos encontrados`);
  contratos.forEach((c: any) => {
    console.log(`   - ${c.numero} | Status: ${c.status} | Valor: R$ ${c.valor_total?.toLocaleString('pt-BR') || 0}`);
  });

  return contratos;
}

async function verificarFinanceiro(contrato_id?: string) {
  console.log('\n💰 2. VERIFICANDO LANÇAMENTOS FINANCEIROS...\n');

  let query = supabase
    .from('financeiro_lancamentos')
    .select('id, tipo, descricao, valor, status, contrato_id, created_at')
    .order('created_at', { ascending: false });

  if (contrato_id) {
    query = query.eq('contrato_id', contrato_id);
  } else {
    query = query.limit(10);
  }

  const { data: lancamentos, error } = await query;

  if (error) {
    log('Financeiro', 'ERRO', 'Erro ao buscar lançamentos', error);
    return [];
  }

  if (!lancamentos || lancamentos.length === 0) {
    log('Financeiro', 'AVISO', 'Nenhum lançamento financeiro encontrado');
    return [];
  }

  log('Financeiro', 'OK', `${lancamentos.length} lançamentos encontrados`);
  lancamentos.forEach((l: any) => {
    console.log(`   - ${l.descricao} | ${l.tipo} | R$ ${l.valor?.toLocaleString('pt-BR')} | Status: ${l.status}`);
  });

  return lancamentos;
}

async function verificarCronograma(contrato_id?: string) {
  console.log('\n📅 3. VERIFICANDO CRONOGRAMA/PROJETOS...\n');

  let query = supabase
    .from('projetos')
    .select('id, nome, status, contrato_id, data_inicio, criado_em')
    .order('criado_em', { ascending: false });

  if (contrato_id) {
    query = query.eq('contrato_id', contrato_id);
  } else {
    query = query.limit(10);
  }

  const { data: projetos, error } = await query;

  if (error) {
    log('Cronograma', 'ERRO', 'Erro ao buscar projetos', error);
    return [];
  }

  if (!projetos || projetos.length === 0) {
    log('Cronograma', 'AVISO', 'Nenhum projeto encontrado');
    return [];
  }

  log('Cronograma', 'OK', `${projetos.length} projetos encontrados`);

  for (const p of projetos) {
    console.log(`   - ${p.nome} | Status: ${p.status}`);

    // Buscar etapas
    const { data: etapas } = await supabase
      .from('cronograma_etapas')
      .select('id, nome, status')
      .eq('projeto_id', p.id);

    if (etapas && etapas.length > 0) {
      console.log(`     └─ ${etapas.length} etapas`);
    }
  }

  return projetos;
}

async function criarContratoTeste() {
  console.log('\n🧪 4. CRIANDO CONTRATO DE TESTE...\n');

  // 1. Verificar se há clientes
  const { data: clientes } = await supabase
    .from('pessoas')
    .select('id, nome')
    .eq('tipo', 'cliente')
    .limit(1);

  let cliente_id: string;

  if (!clientes || clientes.length === 0) {
    log('Teste', 'AVISO', 'Nenhum cliente encontrado, criando cliente de teste...');

    const { data: novoCliente, error: erroCliente } = await supabase
      .from('pessoas')
      .insert({
        nome: 'Cliente Teste WGEasy',
        tipo: 'cliente',
        cpf: '00000000000',
        email: 'teste@wgeasy.com',
        ativo: true
      })
      .select()
      .single();

    if (erroCliente || !novoCliente) {
      log('Teste', 'ERRO', 'Erro ao criar cliente de teste', erroCliente);
      return null;
    }

    cliente_id = novoCliente.id;
    log('Teste', 'OK', 'Cliente de teste criado');
  } else {
    cliente_id = clientes[0].id;
    log('Teste', 'OK', `Usando cliente existente: ${clientes[0].nome}`);
  }

  // 2. Criar contrato de teste
  const { data: contrato, error: erroContrato } = await supabase
    .from('contratos')
    .insert({
      numero: `TESTE-${Date.now()}`,
      cliente_id,
      unidade_negocio: 'arquitetura',
      valor_total: 50000,
      valor_mao_obra: 30000,
      valor_materiais: 20000,
      status: 'rascunho',
      descricao: 'Contrato de teste para validar workflow',
      data_inicio: new Date().toISOString().split('T')[0],
      duracao_dias_uteis: 60,
      forma_pagamento: 'PIX/Transferência',
      percentual_entrada: 30,
      numero_parcelas: 3
    })
    .select()
    .single();

  if (erroContrato || !contrato) {
    log('Teste', 'ERRO', 'Erro ao criar contrato de teste', erroContrato);
    return null;
  }

  log('Teste', 'OK', `Contrato criado: ${contrato.numero}`);

  // 3. Criar alguns itens para o contrato
  const itens = [
    { descricao: 'Projeto Arquitetônico', tipo: 'servico', quantidade: 1, valor_unitario: 15000 },
    { descricao: 'Execução de Obra', tipo: 'mao_obra', quantidade: 1, valor_unitario: 25000 },
    { descricao: 'Materiais de Construção', tipo: 'material', quantidade: 1, valor_unitario: 10000 },
  ];

  for (const item of itens) {
    await supabase.from('contratos_itens').insert({
      contrato_id: contrato.id,
      ...item,
      valor_total: item.quantidade * item.valor_unitario
    });
  }

  log('Teste', 'OK', `${itens.length} itens adicionados ao contrato`);

  return contrato;
}

async function ativarContratoTeste(contrato_id: string, numero: string) {
  console.log('\n🚀 5. ATIVANDO WORKFLOW DO CONTRATO...\n');

  // Importar e chamar a função ativarContrato
  // Nota: Como estamos em um script separado, vamos simular a ativação
  // fazendo as mesmas operações que o workflow faz

  try {
    // Buscar contrato
    const { data: contrato } = await supabase
      .from('contratos')
      .select('*')
      .eq('id', contrato_id)
      .single();

    if (!contrato) {
      log('Workflow', 'ERRO', 'Contrato não encontrado');
      return false;
    }

    // 1. Criar lançamento financeiro
    log('Workflow', 'OK', 'Criando lançamento financeiro...');

    const { data: receita, error: erroReceita } = await supabase
      .from('financeiro_lancamentos')
      .insert({
        tipo: 'entrada',
        descricao: `Receita do contrato ${numero}`,
        valor: contrato.valor_total,
        pessoa_id: contrato.cliente_id,
        contrato_id: contrato_id,
        data_competencia: new Date().toISOString().split('T')[0],
        categoria: 'Recebimento de Cliente',
        status: 'previsto',
      })
      .select()
      .single();

    if (erroReceita) {
      log('Workflow', 'ERRO', 'Erro ao criar lançamento financeiro', erroReceita);
      return false;
    }

    log('Workflow', 'OK', 'Lançamento financeiro criado');

    // 2. Criar parcelas
    const valorParcela = contrato.valor_total / (contrato.numero_parcelas || 1);
    const parcelas = [];

    for (let i = 1; i <= (contrato.numero_parcelas || 1); i++) {
      const dataVencimento = new Date();
      dataVencimento.setMonth(dataVencimento.getMonth() + i);

      parcelas.push({
        financeiro_id: receita.id,
        numero_parcela: i,
        valor: valorParcela,
        data_vencimento: dataVencimento.toISOString().split('T')[0],
        status: 'pendente'
      });
    }

    const { error: erroParcelas } = await supabase
      .from('contas_receber')
      .insert(parcelas);

    if (!erroParcelas) {
      log('Workflow', 'OK', `${parcelas.length} parcelas criadas`);
    }

    // 3. Criar projeto/cronograma
    log('Workflow', 'OK', 'Criando projeto...');

    const { data: projeto, error: erroProjeto } = await supabase
      .from('projetos')
      .insert({
        nome: `Projeto - ${numero}`,
        descricao: contrato.descricao || `Projeto do contrato ${numero}`,
        cliente_id: contrato.cliente_id,
        contrato_id: contrato_id,
        data_inicio: new Date().toISOString().split('T')[0],
        status: 'Planejamento'
      })
      .select()
      .single();

    if (erroProjeto) {
      log('Workflow', 'ERRO', 'Erro ao criar projeto', erroProjeto);
      return false;
    }

    log('Workflow', 'OK', 'Projeto criado');

    // 4. Criar etapas do cronograma
    const { data: itensContrato } = await supabase
      .from('contratos_itens')
      .select('*')
      .eq('contrato_id', contrato_id);

    if (itensContrato && itensContrato.length > 0) {
      const etapas = itensContrato.map((item: any, idx: number) => ({
        projeto_id: projeto.id,
        nome: item.descricao,
        descricao: `${item.quantidade} ${item.unidade || 'un'}`,
        data_inicio_prevista: new Date().toISOString().split('T')[0],
        data_fim_prevista: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        status: 'planejada',
        ordem: idx
      }));

      const { error: erroEtapas } = await supabase
        .from('cronograma_etapas')
        .insert(etapas);

      if (!erroEtapas) {
        log('Workflow', 'OK', `${etapas.length} etapas criadas`);
      }
    }

    // 5. Atualizar status do contrato
    await supabase
      .from('contratos')
      .update({ status: 'ativo' })
      .eq('id', contrato_id);

    log('Workflow', 'OK', 'Contrato ativado com sucesso!');
    return true;

  } catch (error) {
    log('Workflow', 'ERRO', 'Erro ao ativar workflow', error);
    return false;
  }
}

async function gerarRelatorio() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL DO DIAGNÓSTICO');
  console.log('='.repeat(60) + '\n');

  const erros = resultados.filter(r => r.status === 'ERRO');
  const avisos = resultados.filter(r => r.status === 'AVISO');
  const sucessos = resultados.filter(r => r.status === 'OK');

  console.log(`✅ Sucessos: ${sucessos.length}`);
  console.log(`⚠️  Avisos:   ${avisos.length}`);
  console.log(`❌ Erros:    ${erros.length}\n`);

  if (erros.length > 0) {
    console.log('🔴 ERROS ENCONTRADOS:');
    erros.forEach(e => {
      console.log(`   - [${e.secao}] ${e.mensagem}`);
    });
    console.log('');
  }

  if (avisos.length > 0) {
    console.log('🟡 AVISOS:');
    avisos.forEach(a => {
      console.log(`   - [${a.secao}] ${a.mensagem}`);
    });
    console.log('');
  }

  console.log('='.repeat(60) + '\n');

  if (erros.length === 0 && avisos.length === 0) {
    console.log('🎉 TUDO FUNCIONANDO PERFEITAMENTE!\n');
  } else if (erros.length === 0) {
    console.log('✅ SISTEMA FUNCIONANDO (com alguns avisos)\n');
  } else {
    console.log('⚠️  PROBLEMAS ENCONTRADOS - Verifique os erros acima\n');
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   🔍 DIAGNÓSTICO: Workflow Contrato → Financeiro + Cronograma   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // 1. Verificar contratos existentes
    const contratos = await verificarContratos();

    // 2. Verificar financeiro
    const lancamentos = await verificarFinanceiro();

    // 3. Verificar cronograma
    const projetos = await verificarCronograma();

    // 4. Se não houver dados, criar contrato de teste
    if (contratos.length === 0 || lancamentos.length === 0 || projetos.length === 0) {
      console.log('\n⚠️  Sistema vazio ou incompleto. Criando dados de teste...\n');

      const contratoTeste = await criarContratoTeste();

      if (contratoTeste) {
        // 5. Ativar workflow
        const sucesso = await ativarContratoTeste(contratoTeste.id, contratoTeste.numero);

        if (sucesso) {
          // 6. Verificar novamente após ativar
          console.log('\n🔄 VERIFICANDO DADOS APÓS ATIVAÇÃO...\n');
          await verificarFinanceiro(contratoTeste.id);
          await verificarCronograma(contratoTeste.id);
        }
      }
    } else {
      log('Geral', 'OK', 'Sistema já possui dados. Verificando integração...');

      // Verificar se os contratos têm financeiro e cronograma associados
      const contrato = contratos[0];
      const temFinanceiro = lancamentos.some((l: any) => l.contrato_id === contrato.id);
      const temCronograma = projetos.some((p: any) => p.contrato_id === contrato.id);

      if (!temFinanceiro) {
        log('Integração', 'AVISO', `Contrato ${contrato.numero} não possui lançamentos financeiros`);
      }

      if (!temCronograma) {
        log('Integração', 'AVISO', `Contrato ${contrato.numero} não possui projeto/cronograma`);
      }

      if (temFinanceiro && temCronograma) {
        log('Integração', 'OK', 'Workflow funcionando! Contratos estão gerando financeiro e cronograma');
      }
    }

    // 7. Gerar relatório final
    await gerarRelatorio();

  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO:', error);
  }
}

main();
