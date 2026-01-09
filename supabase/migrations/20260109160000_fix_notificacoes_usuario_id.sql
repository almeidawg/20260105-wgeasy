-- ============================================================================
-- Migration: Corrigir constraint usuario_id em notificacoes_sistema
-- Data: 2026-01-09
-- Problema: Coluna usuario_id com NOT NULL impede inserção via trigger
-- ============================================================================

-- Verificar se a coluna usuario_id existe e remover constraint NOT NULL
DO $$
BEGIN
  -- Se a coluna usuario_id existe, torná-la nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notificacoes_sistema'
      AND column_name = 'usuario_id'
  ) THEN
    ALTER TABLE public.notificacoes_sistema
    ALTER COLUMN usuario_id DROP NOT NULL;
    RAISE NOTICE 'Constraint NOT NULL removida de usuario_id';
  END IF;

  -- Garantir que destinatario_id existe e é nullable
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notificacoes_sistema'
      AND column_name = 'destinatario_id'
  ) THEN
    ALTER TABLE public.notificacoes_sistema
    ADD COLUMN destinatario_id UUID;
    RAISE NOTICE 'Coluna destinatario_id adicionada';
  END IF;

  -- Garantir que para_todos_admins existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notificacoes_sistema'
      AND column_name = 'para_todos_admins'
  ) THEN
    ALTER TABLE public.notificacoes_sistema
    ADD COLUMN para_todos_admins BOOLEAN DEFAULT false;
    RAISE NOTICE 'Coluna para_todos_admins adicionada';
  END IF;
END $$;

-- Atualizar a função de notificação do diário de obra para usar destinatario_id se existir
CREATE OR REPLACE FUNCTION notificar_novo_diario_obra()
RETURNS TRIGGER AS $$
DECLARE
  v_colaborador_nome TEXT;
  v_cliente_nome TEXT;
  v_titulo TEXT;
  v_mensagem TEXT;
  v_has_usuario_id BOOLEAN;
BEGIN
  -- Verificar se a coluna usuario_id existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notificacoes_sistema'
      AND column_name = 'usuario_id'
  ) INTO v_has_usuario_id;

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
  IF v_has_usuario_id THEN
    -- Tabela antiga com usuario_id
    INSERT INTO notificacoes_sistema (
      tipo,
      titulo,
      mensagem,
      referencia_tipo,
      referencia_id,
      para_todos_admins,
      url_acao,
      texto_acao,
      usuario_id
    ) VALUES (
      'movimento_sistema',
      v_titulo,
      v_mensagem,
      'obra_registros',
      NEW.id,
      true,
      '/obras/diario/' || NEW.id,
      'Ver Registro',
      NULL
    );
  ELSE
    -- Tabela nova com destinatario_id
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
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mesma correção para pedidos de materiais
CREATE OR REPLACE FUNCTION notificar_novo_pedido_material()
RETURNS TRIGGER AS $$
DECLARE
  v_criador_nome TEXT;
  v_titulo TEXT;
  v_mensagem TEXT;
  v_has_usuario_id BOOLEAN;
BEGIN
  -- Só notifica quando status é 'enviado'
  IF NEW.status = 'enviado' THEN
    -- Verificar se a coluna usuario_id existe
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'notificacoes_sistema'
        AND column_name = 'usuario_id'
    ) INTO v_has_usuario_id;

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
    IF v_has_usuario_id THEN
      INSERT INTO notificacoes_sistema (
        tipo,
        titulo,
        mensagem,
        referencia_tipo,
        referencia_id,
        para_todos_admins,
        url_acao,
        texto_acao,
        usuario_id
      ) VALUES (
        'nova_solicitacao',
        v_titulo,
        v_mensagem,
        'pedidos_materiais',
        NEW.id,
        true,
        '/planejamento/aprovacoes',
        'Ver Aprovações',
        NULL
      );
    ELSE
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
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mesma correção para pedido enviado (update)
CREATE OR REPLACE FUNCTION notificar_pedido_enviado()
RETURNS TRIGGER AS $$
DECLARE
  v_criador_nome TEXT;
  v_titulo TEXT;
  v_mensagem TEXT;
  v_has_usuario_id BOOLEAN;
BEGIN
  -- Só notifica quando status muda para 'enviado'
  IF NEW.status = 'enviado' AND (OLD.status IS NULL OR OLD.status != 'enviado') THEN
    -- Verificar se a coluna usuario_id existe
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'notificacoes_sistema'
        AND column_name = 'usuario_id'
    ) INTO v_has_usuario_id;

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
    IF v_has_usuario_id THEN
      INSERT INTO notificacoes_sistema (
        tipo,
        titulo,
        mensagem,
        referencia_tipo,
        referencia_id,
        para_todos_admins,
        url_acao,
        texto_acao,
        usuario_id
      ) VALUES (
        'nova_solicitacao',
        v_titulo,
        v_mensagem,
        'pedidos_materiais',
        NEW.id,
        true,
        '/planejamento/aprovacoes',
        'Ver Aprovações',
        NULL
      );
    ELSE
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
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificação
DO $$
DECLARE
  v_is_nullable TEXT;
BEGIN
  SELECT is_nullable INTO v_is_nullable
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'notificacoes_sistema'
    AND column_name = 'usuario_id';

  IF v_is_nullable IS NOT NULL THEN
    RAISE NOTICE 'Coluna usuario_id: nullable = %', v_is_nullable;
  ELSE
    RAISE NOTICE 'Coluna usuario_id não existe na tabela';
  END IF;
END $$;
