/**
 * Aplica triggers de notificações para pedidos de materiais
 */
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Aplicando triggers de notificações...\n');

  // 1. Criar função de notificação para pedidos
  const sqlFuncao = `
    CREATE OR REPLACE FUNCTION notificar_novo_pedido_material()
    RETURNS TRIGGER AS $$
    DECLARE
      v_criador_nome TEXT;
      v_titulo TEXT;
      v_mensagem TEXT;
    BEGIN
      IF NEW.status = 'enviado' THEN
        SELECT p.nome INTO v_criador_nome
        FROM usuarios u
        LEFT JOIN pessoas p ON p.id = u.pessoa_id
        WHERE u.auth_user_id = NEW.criado_por::uuid OR u.id = NEW.criado_por::uuid
        LIMIT 1;

        v_titulo := 'Nova Solicitação de Material';
        v_mensagem := COALESCE(v_criador_nome, 'Colaborador') || ' enviou uma solicitação de materiais: ' ||
                      COALESCE(LEFT(NEW.descricao, 100), 'Sem descrição');

        INSERT INTO notificacoes_sistema (
          tipo, titulo, mensagem, referencia_tipo, referencia_id,
          para_todos_admins, url_acao, texto_acao
        ) VALUES (
          'nova_solicitacao', v_titulo, v_mensagem, 'pedidos_materiais', NEW.id,
          true, '/planejamento/aprovacoes', 'Ver Aprovações'
        );
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  const { error: errFunc } = await supabase.rpc('exec_sql', { sql: sqlFuncao });
  if (errFunc) {
    // Tentar via query direta se rpc não existir
    console.log('RPC não disponível, tentando criar função via alternativa...');
  }

  // 2. Testar criando uma notificação manual
  console.log('Criando notificação de teste...');

  const { data: notif, error: notifErr } = await supabase
    .from('notificacoes_sistema')
    .insert({
      tipo: 'nova_solicitacao',
      titulo: 'Teste de Notificação',
      mensagem: 'Esta é uma notificação de teste para validar o sistema',
      referencia_tipo: 'teste',
      para_todos_admins: true,
      url_acao: '/planejamento/aprovacoes',
      texto_acao: 'Ver Aprovações'
    })
    .select()
    .single();

  if (notifErr) {
    console.error('Erro ao criar notificação:', notifErr.message);
  } else {
    console.log('Notificação de teste criada com sucesso!');
    console.log('  ID:', notif.id);
    console.log('  Título:', notif.titulo);
  }

  // 3. Criar notificações para os pedidos existentes (últimos 5)
  console.log('\nCriando notificações para pedidos recentes...');

  const { data: pedidos } = await supabase
    .from('pedidos_materiais')
    .select('id, descricao, status, created_at, criado_por')
    .eq('status', 'enviado')
    .order('created_at', { ascending: false })
    .limit(5);

  if (pedidos && pedidos.length > 0) {
    for (const p of pedidos) {
      // Verificar se já existe notificação para este pedido
      const { data: existing } = await supabase
        .from('notificacoes_sistema')
        .select('id')
        .eq('referencia_tipo', 'pedidos_materiais')
        .eq('referencia_id', p.id)
        .limit(1);

      if (existing && existing.length > 0) {
        console.log('  Notificação já existe para pedido:', p.id);
        continue;
      }

      // Buscar nome do criador
      let criadorNome = 'Colaborador';
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('pessoa:pessoas!usuarios_pessoa_id_fkey(nome)')
        .or(`auth_user_id.eq.${p.criado_por},id.eq.${p.criado_por}`)
        .limit(1)
        .single();

      if (usuario?.pessoa?.nome) {
        criadorNome = usuario.pessoa.nome;
      }

      const { error: insertErr } = await supabase
        .from('notificacoes_sistema')
        .insert({
          tipo: 'nova_solicitacao',
          titulo: 'Nova Solicitação de Material',
          mensagem: `${criadorNome} enviou uma solicitação: ${p.descricao?.substring(0, 80) || 'Sem descrição'}...`,
          referencia_tipo: 'pedidos_materiais',
          referencia_id: p.id,
          para_todos_admins: true,
          url_acao: '/planejamento/aprovacoes',
          texto_acao: 'Ver Aprovações',
          criado_em: p.created_at
        });

      if (insertErr) {
        console.error('  Erro ao criar notificação para', p.id, ':', insertErr.message);
      } else {
        console.log('  Notificação criada para pedido:', p.descricao?.substring(0, 40));
      }
    }
  }

  // 4. Verificar total de notificações
  const { count } = await supabase
    .from('notificacoes_sistema')
    .select('*', { count: 'exact', head: true });

  console.log('\nTotal de notificações no sistema:', count);
  console.log('\nFeito!');
}

main().catch(console.error);
