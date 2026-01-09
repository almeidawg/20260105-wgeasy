/**
 * Corrige o pessoa_id do usuário para testes
 */
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ahlqzzkxuutwoepirpzr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const TEST_EMAIL = 'melowellyngton23@gmail.com';
  const AUTH_USER_ID = '4d2b8654-357f-4ecd-80a4-e26123a27202';
  const PESSOA_ID = '4d2c4cb0-c8af-4ea3-a2aa-030faa1f1a5b'; // Wellington de Melo Duarte

  console.log('🔧 Corrigindo pessoa_id do usuário...');
  console.log('   Email:', TEST_EMAIL);
  console.log('   Auth User ID:', AUTH_USER_ID);
  console.log('   Pessoa ID para vincular:', PESSOA_ID);
  console.log('');

  // 1. Verificar se o usuário existe na tabela usuarios
  const { data: usuarios, error: userErr } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_user_id', AUTH_USER_ID);

  if (userErr) {
    console.error('❌ Erro ao buscar usuário:', userErr.message);
    return;
  }

  if (!usuarios || usuarios.length === 0) {
    console.log('⚠️ Usuário não encontrado. Criando registro...');

    const { data: novoUsuario, error: insertErr } = await supabase
      .from('usuarios')
      .insert({
        auth_user_id: AUTH_USER_ID,
        pessoa_id: PESSOA_ID,
        tipo_usuario: 'colaborador',
        ativo: true
      })
      .select()
      .single();

    if (insertErr) {
      console.error('❌ Erro ao criar usuário:', insertErr.message);
      return;
    }

    console.log('✅ Usuário criado com sucesso!');
    console.log('   ID:', novoUsuario.id);
    console.log('   pessoa_id:', novoUsuario.pessoa_id);
    return;
  }

  const usuario = usuarios[0];
  console.log('📋 Usuário encontrado:');
  console.log('   ID:', usuario.id);
  console.log('   Tipo:', usuario.tipo_usuario);
  console.log('   pessoa_id atual:', usuario.pessoa_id || '❌ NÃO VINCULADO');

  if (usuario.pessoa_id) {
    console.log('');
    console.log('✅ Usuário já possui pessoa_id vinculado!');
    return;
  }

  // 2. Atualizar o pessoa_id
  console.log('');
  console.log('Atualizando pessoa_id...');

  const { error: updateErr } = await supabase
    .from('usuarios')
    .update({ pessoa_id: PESSOA_ID })
    .eq('id', usuario.id);

  if (updateErr) {
    console.error('❌ Erro ao atualizar:', updateErr.message);
    return;
  }

  console.log('✅ pessoa_id atualizado com sucesso!');

  // 3. Verificar resultado
  const { data: usuarioAtualizado } = await supabase
    .from('usuarios')
    .select('id, pessoa_id, tipo_usuario')
    .eq('id', usuario.id)
    .single();

  console.log('');
  console.log('📋 Resultado Final:');
  console.log('   pessoa_id:', usuarioAtualizado?.pessoa_id);
}

main().catch(console.error);
