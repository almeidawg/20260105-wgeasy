/**
 * Cria notificações para pedidos de materiais existentes
 */
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Criando notificações para pedidos de materiais...\n');

  // 1. Buscar usuários MASTER para receber notificações
  const { data: masters } = await supabase
    .from('usuarios')
    .select('id')
    .in('tipo_usuario', ['MASTER', 'ADMIN'])
    .limit(1);

  const masterUserId = masters?.[0]?.id;
  if (!masterUserId) {
    console.error('Nenhum usuário MASTER/ADMIN encontrado!');
    return;
  }

  console.log('Usando usuário MASTER:', masterUserId);

  // 2. Buscar pedidos com status 'enviado'
  const { data: pedidos } = await supabase
    .from('pedidos_materiais')
    .select('id, descricao, status, created_at, criado_por')
    .eq('status', 'enviado')
    .order('created_at', { ascending: false })
    .limit(10);

  console.log(`\nEncontrados ${pedidos?.length || 0} pedidos com status 'enviado'\n`);

  if (pedidos && pedidos.length > 0) {
    for (const p of pedidos) {
      // Verificar se já existe notificação
      const { data: existing } = await supabase
        .from('notificacoes_sistema')
        .select('id')
        .eq('referencia_tipo', 'pedidos_materiais')
        .eq('referencia_id', p.id)
        .limit(1);

      if (existing && existing.length > 0) {
        console.log('  [Skip] Notificação já existe para:', p.descricao?.substring(0, 40));
        continue;
      }

      // Buscar nome do criador
      let criadorNome = 'Colaborador';
      if (p.criado_por) {
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('pessoa_id')
          .eq('auth_user_id', p.criado_por)
          .limit(1)
          .single();

        if (usuario?.pessoa_id) {
          const { data: pessoa } = await supabase
            .from('pessoas')
            .select('nome')
            .eq('id', usuario.pessoa_id)
            .single();

          if (pessoa?.nome) {
            criadorNome = pessoa.nome;
          }
        }
      }

      // Criar notificação
      const { error: insertErr } = await supabase
        .from('notificacoes_sistema')
        .insert({
          tipo: 'info',
          titulo: 'Nova Solicitação de Material',
          mensagem: `${criadorNome} enviou: ${p.descricao?.substring(0, 80) || 'Solicitação de materiais'}`,
          usuario_id: masterUserId,
          referencia_tipo: 'pedidos_materiais',
          referencia_id: p.id,
          para_todos_admins: true,
          lida: false,
          url_acao: '/planejamento/aprovacoes',
          texto_acao: 'Ver Aprovações'
        });

      if (insertErr) {
        console.log('  [Erro]', p.id, ':', insertErr.message);
      } else {
        console.log('  [OK] Notificação criada:', p.descricao?.substring(0, 50));
      }
    }
  }

  // 3. Verificar total de notificações
  const { count } = await supabase
    .from('notificacoes_sistema')
    .select('*', { count: 'exact', head: true });

  console.log(`\nTotal de notificações no sistema: ${count}`);

  // 4. Listar notificações não lidas
  const { data: naoLidas } = await supabase
    .from('notificacoes_sistema')
    .select('id, titulo, mensagem, created_at')
    .eq('lida', false)
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('\nNotificações não lidas:');
  naoLidas?.forEach((n, i) => {
    console.log(`  ${i+1}. ${n.titulo}`);
    console.log(`     ${n.mensagem?.substring(0, 60)}...`);
  });

  console.log('\nConcluído!');
}

main().catch(console.error);
