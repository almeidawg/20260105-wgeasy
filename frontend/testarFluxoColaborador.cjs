/**
 * Script de Teste - Fluxo do Colaborador
 * Testa: Login, Solicitação de Material, Upload de Foto no Diário de Obra
 *
 * Uso: node testarFluxoColaborador.cjs
 */

require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ahlqzzkxuutwoepirpzr.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Credenciais de teste
const TEST_EMAIL = 'melowellyngton23@gmail.com';
const TEST_PASSWORD = 'WGZu6P6x8J!';

if (!supabaseAnonKey) {
  console.error('❌ Defina VITE_SUPABASE_ANON_KEY no .env');
  process.exit(1);
}

console.log('🔧 Supabase URL:', supabaseUrl);
console.log('🔧 Testando com email:', TEST_EMAIL);
console.log('🔧 Service Role Key:', supabaseServiceKey ? 'Disponível' : 'Não disponível');
console.log('');

// Cliente para login do usuário
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente admin para consultas que precisam contornar RLS
const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;

// ============================================================
// FUNÇÕES DE TESTE
// ============================================================

async function testarLogin() {
  console.log('📋 TESTE 1: Login do Colaborador');
  console.log('─'.repeat(50));

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (error) {
      console.error('❌ Erro no login:', error.message);
      return null;
    }

    console.log('✅ Login realizado com sucesso!');
    console.log('   User ID:', data.user.id);
    console.log('   Email:', data.user.email);

    // Buscar dados do usuário (usando admin para contornar RLS)
    const { data: usuario, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('id, nome, tipo_usuario, pessoa_id')
      .eq('auth_user_id', data.user.id)
      .single();

    if (usuario) {
      console.log('   Nome:', usuario.nome);
      console.log('   Tipo:', usuario.tipo_usuario);
      console.log('   Pessoa ID:', usuario.pessoa_id);
    }

    console.log('');
    return { user: data.user, usuario };
  } catch (e) {
    console.error('❌ Exceção no login:', e.message);
    return null;
  }
}

async function testarSolicitacaoMaterial(userId, pessoaId) {
  console.log('📋 TESTE 2: Solicitação de Material');
  console.log('─'.repeat(50));

  try {
    // 1. Buscar um cliente ativo
    console.log('   Buscando cliente ativo...');
    const { data: clientes, error: cliErr } = await supabase
      .from('pessoas')
      .select('id, nome')
      .eq('tipo', 'CLIENTE')
      .eq('ativo', true)
      .limit(1);

    if (cliErr || !clientes || clientes.length === 0) {
      console.log('⚠️ Nenhum cliente ativo encontrado. Pulando teste.');
      return null;
    }

    const cliente = clientes[0];
    console.log('   Cliente encontrado:', cliente.nome);

    // 2. Buscar contrato do cliente
    console.log('   Buscando contrato do cliente...');
    const { data: contratos } = await supabase
      .from('contratos')
      .select('id, numero')
      .eq('cliente_id', cliente.id)
      .limit(1);

    let projetoId = contratos?.[0]?.id || null;
    if (projetoId) {
      console.log('   Contrato encontrado:', contratos[0].numero);
    } else {
      console.log('   Nenhum contrato encontrado, criando pedido sem projeto');
    }

    // 3. Buscar itens do pricelist
    console.log('   Buscando itens no pricelist...');
    const { data: itens } = await supabase
      .from('pricelist_itens')
      .select('id, nome, unidade, preco')
      .eq('ativo', true)
      .limit(3);

    const itensParaPedido = (itens || []).map(item => ({
      nome: item.nome,
      quantidade: Math.floor(Math.random() * 10) + 1,
      unidade: item.unidade || 'un',
      pricelist_id: item.id,
      valor_unitario: item.preco || 0
    }));

    if (itensParaPedido.length === 0) {
      // Criar item manual se não houver pricelist
      itensParaPedido.push({
        nome: 'Material de Teste',
        quantidade: 5,
        unidade: 'un'
      });
    }

    console.log('   Itens para o pedido:', itensParaPedido.length);

    // 4. Criar o pedido de materiais
    console.log('   Criando pedido de materiais...');
    const { data: pedido, error: pedidoErr } = await supabase
      .from('pedidos_materiais')
      .insert({
        projeto_id: projetoId,
        descricao: `[TESTE] Pedido de materiais - ${new Date().toLocaleString('pt-BR')}`,
        prioridade: 'normal',
        observacoes: 'Pedido criado automaticamente via script de teste',
        itens: itensParaPedido,
        status: 'enviado',
        criado_por: userId
      })
      .select()
      .single();

    if (pedidoErr) {
      console.error('❌ Erro ao criar pedido:', pedidoErr.message);
      return null;
    }

    console.log('✅ Pedido criado com sucesso!');
    console.log('   ID:', pedido.id);
    console.log('   Status:', pedido.status);
    console.log('   Itens:', pedido.itens?.length || 0);
    console.log('');

    return pedido;
  } catch (e) {
    console.error('❌ Exceção ao criar pedido:', e.message);
    return null;
  }
}

async function testarDiarioObra(userId, pessoaId) {
  console.log('📋 TESTE 3: Diário de Obra (Upload de Foto)');
  console.log('─'.repeat(50));

  try {
    // Se não tem pessoaId, tentar buscar via admin
    let colaboradorId = pessoaId;
    if (!colaboradorId) {
      console.log('   Buscando pessoa_id via admin...');
      const { data: usuario } = await supabaseAdmin
        .from('usuarios')
        .select('pessoa_id')
        .eq('auth_user_id', userId)
        .single();
      colaboradorId = usuario?.pessoa_id;
      console.log('   pessoa_id encontrado:', colaboradorId || 'NÃO ENCONTRADO');
    }

    if (!colaboradorId) {
      console.log('❌ Não foi possível obter pessoa_id. Teste abortado.');
      return null;
    }

    // 1. Buscar um cliente ativo
    console.log('   Buscando cliente para diário...');
    const { data: clientes } = await supabase
      .from('pessoas')
      .select('id, nome')
      .eq('tipo', 'CLIENTE')
      .eq('ativo', true)
      .limit(1);

    if (!clientes || clientes.length === 0) {
      console.log('⚠️ Nenhum cliente ativo encontrado. Pulando teste.');
      return null;
    }

    const cliente = clientes[0];
    console.log('   Cliente:', cliente.nome);

    // 2. Criar registro de diário (usando admin para contornar RLS)
    console.log('   Criando registro de diário...');
    const dataHoje = new Date().toISOString().split('T')[0];

    const { data: diario, error: diarioErr } = await supabaseAdmin
      .from('obra_registros')
      .insert({
        cliente_id: cliente.id,
        colaborador_id: colaboradorId,
        data_registro: dataHoje,
        titulo: `[TESTE] Diário de Obra - ${new Date().toLocaleString('pt-BR')}`,
        descricao: 'Registro criado automaticamente via script de teste',
        clima: 'Ensolarado',
        equipe_presente: 3,
        percentual_avanco: 50,
        observacoes: 'Teste de upload de foto'
      })
      .select()
      .single();

    if (diarioErr) {
      console.error('❌ Erro ao criar diário:', diarioErr.message);
      console.error('   Detalhes:', JSON.stringify(diarioErr, null, 2));
      return null;
    }

    console.log('✅ Registro de diário criado!');
    console.log('   ID:', diario.id);

    // 3. Criar uma imagem de teste (PNG simples)
    console.log('   Preparando imagem de teste...');

    // Criar um pequeno arquivo PNG válido (1x1 pixel vermelho)
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, // IHDR length
      0x49, 0x48, 0x44, 0x52, // IHDR
      0x00, 0x00, 0x00, 0x01, // width: 1
      0x00, 0x00, 0x00, 0x01, // height: 1
      0x08, 0x02, // bit depth: 8, color type: RGB
      0x00, 0x00, 0x00, // compression, filter, interlace
      0x90, 0x77, 0x53, 0xDE, // CRC
      0x00, 0x00, 0x00, 0x0C, // IDAT length
      0x49, 0x44, 0x41, 0x54, // IDAT
      0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00, 0x00, 0x01, 0x01, 0x01, 0x00, // compressed data
      0x18, 0xDD, 0x8D, 0xB4, // CRC
      0x00, 0x00, 0x00, 0x00, // IEND length
      0x49, 0x45, 0x4E, 0x44, // IEND
      0xAE, 0x42, 0x60, 0x82  // CRC
    ]);

    const fileName = `${diario.id}/${Date.now()}_teste.png`;

    // 4. Upload para Supabase Storage
    console.log('   Fazendo upload da imagem...');
    console.log('   Bucket: diario-obra');
    console.log('   Path:', fileName);

    const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
      .from('diario-obra')
      .upload(fileName, pngData, {
        contentType: 'image/png',
        cacheControl: '3600'
      });

    if (uploadErr) {
      console.error('❌ Erro no upload:', uploadErr.message);
      // Tentar verificar se o bucket existe
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      console.log('   Buckets disponíveis:', buckets?.map(b => b.name).join(', ') || 'nenhum');
      return diario;
    }

    console.log('✅ Upload realizado!');
    console.log('   Path:', uploadData.path);

    // 5. Obter URL pública
    const { data: urlData } = supabaseAdmin.storage
      .from('diario-obra')
      .getPublicUrl(fileName);

    console.log('   URL:', urlData.publicUrl);

    // 6. Salvar registro da foto no banco
    console.log('   Salvando registro da foto...');
    const { data: foto, error: fotoErr } = await supabaseAdmin
      .from('obra_registros_fotos')
      .insert({
        registro_id: diario.id,
        arquivo_url: urlData.publicUrl,
        descricao: 'Foto de teste - upload via script',
        ordem: 0
      })
      .select()
      .single();

    if (fotoErr) {
      console.error('❌ Erro ao salvar foto:', fotoErr.message);
      return diario;
    }

    console.log('✅ Foto registrada com sucesso!');
    console.log('   Foto ID:', foto.id);
    console.log('');

    return { diario, foto };
  } catch (e) {
    console.error('❌ Exceção no diário:', e.message);
    return null;
  }
}

async function verificarResultados(userId) {
  console.log('📋 VERIFICAÇÃO FINAL');
  console.log('─'.repeat(50));

  try {
    // Verificar pedidos
    const { data: pedidos, count: pedidosCount } = await supabase
      .from('pedidos_materiais')
      .select('id, descricao, status, created_at', { count: 'exact' })
      .eq('criado_por', userId)
      .order('created_at', { ascending: false })
      .limit(3);

    console.log('📦 Pedidos de Materiais:', pedidosCount || 0, 'total');
    if (pedidos && pedidos.length > 0) {
      pedidos.forEach(p => {
        console.log(`   - ${p.descricao?.substring(0, 40)}... (${p.status})`);
      });
    }

    // Verificar diários
    const { data: diarios, count: diariosCount } = await supabase
      .from('obra_registros')
      .select('id, titulo, data_registro, obra_registros_fotos(count)', { count: 'exact' })
      .order('data_registro', { ascending: false })
      .limit(3);

    console.log('📸 Registros de Diário:', diariosCount || 0, 'total');
    if (diarios && diarios.length > 0) {
      diarios.forEach(d => {
        const fotosCount = d.obra_registros_fotos?.[0]?.count || 0;
        console.log(`   - ${d.titulo?.substring(0, 40)}... (${fotosCount} fotos)`);
      });
    }

    console.log('');
  } catch (e) {
    console.error('❌ Erro na verificação:', e.message);
  }
}

// ============================================================
// EXECUÇÃO PRINCIPAL
// ============================================================

async function main() {
  console.log('═'.repeat(60));
  console.log(' TESTE DE FLUXO DO COLABORADOR - WG EASY');
  console.log(' Data:', new Date().toLocaleString('pt-BR'));
  console.log('═'.repeat(60));
  console.log('');

  // 1. Login
  const loginResult = await testarLogin();
  if (!loginResult) {
    console.log('❌ Falha no login. Encerrando testes.');
    process.exit(1);
  }

  const { user, usuario } = loginResult;
  const pessoaId = usuario?.pessoa_id;

  if (!pessoaId) {
    console.log('⚠️ Usuário não tem pessoa_id vinculado. Alguns testes podem falhar.');
  }

  // 2. Solicitação de Material
  await testarSolicitacaoMaterial(user.id, pessoaId);

  // 3. Diário de Obra
  await testarDiarioObra(user.id, pessoaId);

  // 4. Verificação
  await verificarResultados(user.id);

  // Logout
  await supabase.auth.signOut();

  console.log('═'.repeat(60));
  console.log(' TESTES CONCLUÍDOS');
  console.log('═'.repeat(60));
}

main().catch(console.error);
