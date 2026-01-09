-- ============================================================================
-- MIGRAÇÃO: Adicionar notificações automáticas para pedidos de materiais
-- Data: 2026-01-09
-- Descrição: Cria trigger para notificar MASTER/ADMIN quando colaborador envia pedido
-- ============================================================================

-- Função que cria notificação para todos os admins/masters
CREATE OR REPLACE FUNCTION notificar_novo_pedido_material()
RETURNS TRIGGER AS $$
DECLARE
  v_criador_nome TEXT;
  v_titulo TEXT;
  v_mensagem TEXT;
BEGIN
  -- Só notifica quando status é 'enviado'
  IF NEW.status = 'enviado' THEN
    -- Buscar nome do criador
    SELECT p.nome INTO v_criador_nome
    FROM usuarios u
    LEFT JOIN pessoas p ON p.id = u.pessoa_id
    WHERE u.auth_user_id = NEW.criado_por
    LIMIT 1;

    -- Se não encontrou pelo auth_user_id, tentar pelo id direto
    IF v_criador_nome IS NULL THEN
      SELECT p.nome INTO v_criador_nome
      FROM usuarios u
      LEFT JOIN pessoas p ON p.id = u.pessoa_id
      WHERE u.id::text = NEW.criado_por::text
      LIMIT 1;
    END IF;

    v_titulo := 'Nova Solicitação de Material';
    v_mensagem := COALESCE(v_criador_nome, 'Colaborador') || ' enviou uma solicitação de materiais: ' ||
                  COALESCE(LEFT(NEW.descricao, 100), 'Sem descrição');

    -- Criar notificação para todos os admins
    INSERT INTO notificacoes_sistema (
      tipo,
      titulo,
      mensagem,
      referencia_tipo,
      referencia_id,
      para_todos_admins,
      url_acao,
      texto_acao
    ) VALUES (
      'nova_solicitacao',
      v_titulo,
      v_mensagem,
      'pedidos_materiais',
      NEW.id,
      true,
      '/planejamento/aprovacoes',
      'Ver Aprovações'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS trigger_notificar_novo_pedido_material ON pedidos_materiais;

-- Criar trigger para novos pedidos
CREATE TRIGGER trigger_notificar_novo_pedido_material
  AFTER INSERT ON pedidos_materiais
  FOR EACH ROW
  EXECUTE FUNCTION notificar_novo_pedido_material();

-- Trigger para quando status muda para 'enviado' (update)
CREATE OR REPLACE FUNCTION notificar_pedido_enviado()
RETURNS TRIGGER AS $$
DECLARE
  v_criador_nome TEXT;
  v_titulo TEXT;
  v_mensagem TEXT;
BEGIN
  -- Só notifica quando status muda para 'enviado'
  IF NEW.status = 'enviado' AND (OLD.status IS NULL OR OLD.status != 'enviado') THEN
    -- Buscar nome do criador
    SELECT p.nome INTO v_criador_nome
    FROM usuarios u
    LEFT JOIN pessoas p ON p.id = u.pessoa_id
    WHERE u.auth_user_id = NEW.criado_por OR u.id::text = NEW.criado_por::text
    LIMIT 1;

    v_titulo := 'Nova Solicitação de Material';
    v_mensagem := COALESCE(v_criador_nome, 'Colaborador') || ' enviou uma solicitação de materiais: ' ||
                  COALESCE(LEFT(NEW.descricao, 100), 'Sem descrição');

    -- Criar notificação
    INSERT INTO notificacoes_sistema (
      tipo,
      titulo,
      mensagem,
      referencia_tipo,
      referencia_id,
      para_todos_admins,
      url_acao,
      texto_acao
    ) VALUES (
      'nova_solicitacao',
      v_titulo,
      v_mensagem,
      'pedidos_materiais',
      NEW.id,
      true,
      '/planejamento/aprovacoes',
      'Ver Aprovações'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS trigger_notificar_pedido_enviado ON pedidos_materiais;

-- Criar trigger para updates
CREATE TRIGGER trigger_notificar_pedido_enviado
  AFTER UPDATE ON pedidos_materiais
  FOR EACH ROW
  EXECUTE FUNCTION notificar_pedido_enviado();

-- ============================================================================
-- Notificação para diário de obra
-- ============================================================================

CREATE OR REPLACE FUNCTION notificar_novo_diario_obra()
RETURNS TRIGGER AS $$
DECLARE
  v_colaborador_nome TEXT;
  v_cliente_nome TEXT;
  v_titulo TEXT;
  v_mensagem TEXT;
BEGIN
  -- Buscar nome do colaborador
  SELECT nome INTO v_colaborador_nome
  FROM pessoas
  WHERE id = NEW.colaborador_id
  LIMIT 1;

  -- Buscar nome do cliente
  SELECT nome INTO v_cliente_nome
  FROM pessoas
  WHERE id = NEW.cliente_id
  LIMIT 1;

  v_titulo := 'Novo Registro no Diário de Obra';
  v_mensagem := COALESCE(v_colaborador_nome, 'Colaborador') ||
                ' registrou atividade na obra de ' ||
                COALESCE(v_cliente_nome, 'cliente');

  -- Criar notificação para todos os admins
  INSERT INTO notificacoes_sistema (
    tipo,
    titulo,
    mensagem,
    referencia_tipo,
    referencia_id,
    para_todos_admins,
    url_acao,
    texto_acao
  ) VALUES (
    'movimento_sistema',
    v_titulo,
    v_mensagem,
    'obra_registros',
    NEW.id,
    true,
    '/obras/diario/' || NEW.id,
    'Ver Registro'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS trigger_notificar_novo_diario_obra ON obra_registros;

-- Criar trigger
CREATE TRIGGER trigger_notificar_novo_diario_obra
  AFTER INSERT ON obra_registros
  FOR EACH ROW
  EXECUTE FUNCTION notificar_novo_diario_obra();

-- ============================================================================
-- Comentários
-- ============================================================================
COMMENT ON FUNCTION notificar_novo_pedido_material() IS 'Cria notificação para admins quando novo pedido de material é criado';
COMMENT ON FUNCTION notificar_pedido_enviado() IS 'Cria notificação quando pedido muda status para enviado';
COMMENT ON FUNCTION notificar_novo_diario_obra() IS 'Cria notificação quando novo registro de diário de obra é criado';
