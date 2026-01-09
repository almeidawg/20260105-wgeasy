/**
 * Verifica e corrige o pessoa_id do usuário
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ahlqzzkxuutwoepirpzr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const TEST_EMAIL = 'melowellyngton23@gmail.com';
  const AUTH_USER_ID = '4d2b8654-357f-4ecd-80a4-e26123a27202';

  console.log('Verificando usuário:', TEST_EMAIL);
  console.log('');

  // 1. Buscar usuário na tabela usuarios
  const { data: usuario, error: userErr } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_user_id', AUTH_USER_ID)
    .single();

  if (userErr) {
    console.log('❌ Usuário não encontrado na tabela usuarios');
    console.log('   Erro:', userErr.message);
    return;
  }

  console.log('📋 Dados do Usuário:');
  console.log('   ID:', usuario.id);
  console.log('   Nome:', usuario.nome);
  console.log('   Email:', usuario.email_contato);
  console.log('   Tipo:', usuario.tipo_usuario);
  console.log('   Pessoa ID:', usuario.pessoa_id || '❌ NÃO VINCULADO');
  console.log('');

  // 2. Se não tem pessoa_id, buscar pessoa pelo email
  if (!usuario.pessoa_id) {
    console.log('Buscando pessoa pelo email...');

    const { data: pessoa } = await supabase
      .from('pessoas')
      .select('id, nome, email, tipo')
      .or(`email.eq.${TEST_EMAIL},email.ilike.%${TEST_EMAIL}%`)
      .limit(1);

    if (pessoa && pessoa.length > 0) {
      console.log('✅ Pessoa encontrada:', pessoa[0].nome);
      console.log('   ID:', pessoa[0].id);

      // Atualizar o usuário com o pessoa_id
      const { error: updateErr } = await supabase
        .from('usuarios')
        .update({ pessoa_id: pessoa[0].id })
        .eq('id', usuario.id);

      if (updateErr) {
        console.log('❌ Erro ao atualizar:', updateErr.message);
      } else {
        console.log('✅ pessoa_id atualizado com sucesso!');
      }
    } else {
      console.log('⚠️ Nenhuma pessoa encontrada com este email');
      console.log('   Criando pessoa para o colaborador...');

      // Criar pessoa
      const { data: novaPessoa, error: createErr } = await supabase
        .from('pessoas')
        .insert({
          nome: usuario.nome || 'Wellyngton Melo',
          email: TEST_EMAIL,
          tipo: 'COLABORADOR',
          ativo: true
        })
        .select()
        .single();

      if (createErr) {
        console.log('❌ Erro ao criar pessoa:', createErr.message);
        return;
      }

      console.log('✅ Pessoa criada:', novaPessoa.id);

      // Atualizar usuário
      const { error: updateErr } = await supabase
        .from('usuarios')
        .update({ pessoa_id: novaPessoa.id })
        .eq('id', usuario.id);

      if (updateErr) {
        console.log('❌ Erro ao vincular:', updateErr.message);
      } else {
        console.log('✅ Usuário vinculado à pessoa!');
      }
    }
  }

  // 3. Verificar novamente
  const { data: usuarioAtualizado } = await supabase
    .from('usuarios')
    .select('id, nome, pessoa_id')
    .eq('auth_user_id', AUTH_USER_ID)
    .single();

  console.log('');
  console.log('📋 Resultado Final:');
  console.log('   pessoa_id:', usuarioAtualizado?.pessoa_id || 'Ainda não vinculado');
}

main().catch(console.error);
