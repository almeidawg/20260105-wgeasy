/**
 * Cria solicitação de material para cliente Rafael Lacerda
 */
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ahlqzzkxuutwoepirpzr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY não encontrada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Buscando cliente Rafael Lacerda...');

  // 1. Buscar cliente Rafael Lacerda
  const { data: clientes, error: cliErr } = await supabase
    .from('pessoas')
    .select('id, nome, email')
    .eq('tipo', 'CLIENTE')
    .ilike('nome', '%rafael%lacerda%')
    .limit(5);

  if (cliErr || !clientes || clientes.length === 0) {
    // Tentar busca mais ampla
    const { data: clientesAlt } = await supabase
      .from('pessoas')
      .select('id, nome, email')
      .eq('tipo', 'CLIENTE')
      .or('nome.ilike.%rafael%,nome.ilike.%lacerda%')
      .limit(10);

    if (!clientesAlt || clientesAlt.length === 0) {
      console.error('Cliente Rafael Lacerda não encontrado');
      return;
    }

    console.log('Clientes encontrados com nome similar:');
    clientesAlt.forEach(c => console.log('  -', c.nome, '| ID:', c.id));
    return;
  }

  console.log('Cliente encontrado:');
  clientes.forEach(c => console.log('  -', c.nome, '| ID:', c.id));

  const cliente = clientes[0];
  console.log('\nUsando cliente:', cliente.nome);

  // 2. Buscar contrato do cliente
  console.log('\nBuscando contrato vinculado...');
  const { data: contratos } = await supabase
    .from('contratos')
    .select('id, numero, descricao')
    .eq('cliente_id', cliente.id)
    .limit(1);

  let projetoId = null;
  if (contratos && contratos.length > 0) {
    projetoId = contratos[0].id;
    console.log('  Contrato encontrado:', contratos[0].numero || contratos[0].id);
  } else {
    console.log('  Nenhum contrato encontrado, criando pedido avulso');
  }

  // 3. Buscar itens do pricelist para o pedido
  console.log('\nBuscando itens do pricelist...');
  const { data: itens } = await supabase
    .from('pricelist_itens')
    .select('id, nome, unidade, preco')
    .eq('ativo', true)
    .limit(5);

  // Criar lista de itens para o pedido
  const itensParaPedido = [];

  if (itens && itens.length > 0) {
    // Usar itens do pricelist
    itens.slice(0, 3).forEach(item => {
      itensParaPedido.push({
        nome: item.nome,
        quantidade: Math.floor(Math.random() * 10) + 5,
        unidade: item.unidade || 'un',
        pricelist_id: item.id,
        valor_unitario: item.preco || 0
      });
    });
  } else {
    // Criar itens manuais típicos de obra
    itensParaPedido.push(
      { nome: 'Cimento CP II 50kg', quantidade: 20, unidade: 'sc' },
      { nome: 'Areia média', quantidade: 3, unidade: 'm³' },
      { nome: 'Brita 1', quantidade: 2, unidade: 'm³' },
      { nome: 'Vergalhão CA-50 10mm', quantidade: 50, unidade: 'barras' },
      { nome: 'Arame recozido', quantidade: 5, unidade: 'kg' }
    );
  }

  console.log('  Itens preparados:', itensParaPedido.length);
  itensParaPedido.forEach(i => console.log('    -', i.nome, `(${i.quantidade} ${i.unidade})`));

  // 4. Criar o pedido de materiais
  const USUARIO_ID = '4d2b8654-357f-4ecd-80a4-e26123a27202'; // Wellington

  console.log('\nCriando pedido de materiais...');
  const { data: pedido, error: pedidoErr } = await supabase
    .from('pedidos_materiais')
    .insert({
      projeto_id: projetoId,
      descricao: `Solicitação de Materiais - Obra ${cliente.nome}`,
      prioridade: 'normal',
      observacoes: `Materiais necessários para continuidade da obra do cliente ${cliente.nome}. Favor providenciar entrega no local da obra.`,
      itens: itensParaPedido,
      status: 'enviado',
      criado_por: USUARIO_ID
    })
    .select()
    .single();

  if (pedidoErr) {
    console.error('Erro ao criar pedido:', pedidoErr.message);
    return;
  }

  console.log('\n════════════════════════════════════════════════════════');
  console.log(' SOLICITACAO DE MATERIAL CRIADA COM SUCESSO');
  console.log('════════════════════════════════════════════════════════');
  console.log('  Cliente:', cliente.nome);
  console.log('  Pedido ID:', pedido.id);
  console.log('  Status:', pedido.status);
  console.log('  Prioridade:', pedido.prioridade);
  console.log('  Total de Itens:', itensParaPedido.length);
  console.log('  Criado em:', new Date(pedido.created_at).toLocaleString('pt-BR'));
  console.log('════════════════════════════════════════════════════════');
  console.log('\nItens solicitados:');
  itensParaPedido.forEach((i, idx) => {
    console.log(`  ${idx + 1}. ${i.nome} - ${i.quantidade} ${i.unidade}`);
  });
  console.log('════════════════════════════════════════════════════════');
}

main().catch(console.error);
