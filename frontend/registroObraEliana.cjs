/**
 * Cria registro de obra com foto para cliente Eliana
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
  console.log('Buscando cliente Eliana...');

  // 1. Buscar cliente Eliana
  const { data: clientes, error: cliErr } = await supabase
    .from('pessoas')
    .select('id, nome, email')
    .eq('tipo', 'CLIENTE')
    .ilike('nome', '%eliana%')
    .limit(5);

  if (cliErr || !clientes || clientes.length === 0) {
    console.error('Cliente Eliana não encontrada');
    console.log('Buscando todos os clientes para referência...');

    const { data: todosClientes } = await supabase
      .from('pessoas')
      .select('id, nome')
      .eq('tipo', 'CLIENTE')
      .eq('ativo', true)
      .limit(10);

    console.log('Clientes disponíveis:');
    todosClientes?.forEach(c => console.log('  -', c.nome));
    return;
  }

  console.log('Clientes encontrados:');
  clientes.forEach(c => console.log('  -', c.nome, '| ID:', c.id));

  const cliente = clientes[0];
  console.log('\nUsando cliente:', cliente.nome);

  // 2. Buscar colaborador (Wellington)
  const COLABORADOR_ID = '4d2c4cb0-c8af-4ea3-a2aa-030faa1f1a5b';

  // 3. Criar registro de diário de obra
  console.log('\nCriando registro de diário de obra...');
  const dataHoje = new Date().toISOString().split('T')[0];

  const { data: diario, error: diarioErr } = await supabase
    .from('obra_registros')
    .insert({
      cliente_id: cliente.id,
      colaborador_id: COLABORADOR_ID,
      data_registro: dataHoje,
      titulo: `Registro de Obra - ${cliente.nome}`,
      descricao: 'Acompanhamento da execução da obra',
      clima: 'Ensolarado',
      equipe_presente: 4,
      percentual_avanco: 35,
      observacoes: 'Progresso dentro do cronograma previsto'
    })
    .select()
    .single();

  if (diarioErr) {
    console.error('Erro ao criar diário:', diarioErr.message);
    return;
  }

  console.log('Registro criado com sucesso!');
  console.log('  ID:', diario.id);

  // 4. Criar imagem de teste (PNG 10x10 pixels azul)
  console.log('\nPreparando imagem...');

  // PNG header + IHDR + IDAT com pixels azuis + IEND
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
    0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00, 0x00, 0x01, 0x01, 0x01, 0x00,
    0x18, 0xDD, 0x8D, 0xB4, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);

  const fileName = `${diario.id}/${Date.now()}_obra_eliana.png`;

  // 5. Upload para Supabase Storage
  console.log('Fazendo upload da imagem...');
  console.log('  Bucket: diario-obra');
  console.log('  Path:', fileName);

  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from('diario-obra')
    .upload(fileName, pngData, {
      contentType: 'image/png',
      cacheControl: '3600'
    });

  if (uploadErr) {
    console.error('Erro no upload:', uploadErr.message);
    return;
  }

  console.log('Upload realizado!');

  // 6. Obter URL pública
  const { data: urlData } = supabase.storage
    .from('diario-obra')
    .getPublicUrl(fileName);

  console.log('  URL:', urlData.publicUrl);

  // 7. Salvar registro da foto
  console.log('\nSalvando registro da foto no banco...');
  const { data: foto, error: fotoErr } = await supabase
    .from('obra_registros_fotos')
    .insert({
      registro_id: diario.id,
      arquivo_url: urlData.publicUrl,
      descricao: `Foto do registro de obra - ${cliente.nome}`,
      ordem: 0
    })
    .select()
    .single();

  if (fotoErr) {
    console.error('Erro ao salvar foto:', fotoErr.message);
    return;
  }

  console.log('Foto registrada com sucesso!');
  console.log('  Foto ID:', foto.id);

  console.log('\n════════════════════════════════════════════════════════');
  console.log(' REGISTRO DE OBRA CRIADO COM SUCESSO');
  console.log('════════════════════════════════════════════════════════');
  console.log('  Cliente:', cliente.nome);
  console.log('  Registro ID:', diario.id);
  console.log('  Foto ID:', foto.id);
  console.log('  URL da Foto:', urlData.publicUrl);
  console.log('════════════════════════════════════════════════════════');
}

main().catch(console.error);
