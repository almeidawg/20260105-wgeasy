-- ============================================================================
-- MIGRAÇÃO: Adicionar colunas de aprovação do cliente em pedidos_materiais
-- Data: 2026-01-08
-- Descrição: Adiciona colunas para fluxo de envio e aprovação do cliente
-- ============================================================================

-- Adicionar colunas para fluxo de aprovação do cliente
DO $$
BEGIN
  -- Link único de aprovação (token)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedidos_materiais' AND column_name = 'link_aprovacao'
  ) THEN
    ALTER TABLE pedidos_materiais ADD COLUMN link_aprovacao TEXT UNIQUE;
    COMMENT ON COLUMN pedidos_materiais.link_aprovacao IS 'Token único para link de aprovação do cliente';
  END IF;

  -- Data/hora de envio para o cliente
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedidos_materiais' AND column_name = 'enviado_cliente_em'
  ) THEN
    ALTER TABLE pedidos_materiais ADD COLUMN enviado_cliente_em TIMESTAMPTZ;
    COMMENT ON COLUMN pedidos_materiais.enviado_cliente_em IS 'Data/hora em que foi enviado para aprovação do cliente';
  END IF;

  -- Canal de envio (email ou whatsapp)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedidos_materiais' AND column_name = 'enviado_cliente_canal'
  ) THEN
    ALTER TABLE pedidos_materiais ADD COLUMN enviado_cliente_canal TEXT;
    COMMENT ON COLUMN pedidos_materiais.enviado_cliente_canal IS 'Canal usado para envio: email ou whatsapp';
  END IF;

  -- Data/hora de aprovação pelo cliente
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedidos_materiais' AND column_name = 'aprovado_cliente_em'
  ) THEN
    ALTER TABLE pedidos_materiais ADD COLUMN aprovado_cliente_em TIMESTAMPTZ;
    COMMENT ON COLUMN pedidos_materiais.aprovado_cliente_em IS 'Data/hora em que o cliente aprovou';
  END IF;

  -- Data/hora de recusa pelo cliente
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedidos_materiais' AND column_name = 'recusado_cliente_em'
  ) THEN
    ALTER TABLE pedidos_materiais ADD COLUMN recusado_cliente_em TIMESTAMPTZ;
    COMMENT ON COLUMN pedidos_materiais.recusado_cliente_em IS 'Data/hora em que o cliente recusou';
  END IF;

  -- Observações do cliente
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedidos_materiais' AND column_name = 'observacoes_cliente'
  ) THEN
    ALTER TABLE pedidos_materiais ADD COLUMN observacoes_cliente TEXT;
    COMMENT ON COLUMN pedidos_materiais.observacoes_cliente IS 'Observações adicionadas pelo cliente na aprovação/recusa';
  END IF;

  -- Validade do link (opcional, para expirar links antigos)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedidos_materiais' AND column_name = 'link_validade'
  ) THEN
    ALTER TABLE pedidos_materiais ADD COLUMN link_validade TIMESTAMPTZ;
    COMMENT ON COLUMN pedidos_materiais.link_validade IS 'Data de validade do link de aprovação';
  END IF;
END $$;

-- Criar índice para busca por link_aprovacao
CREATE INDEX IF NOT EXISTS idx_pedidos_materiais_link_aprovacao
  ON pedidos_materiais(link_aprovacao)
  WHERE link_aprovacao IS NOT NULL;

-- Política RLS para acesso público via link de aprovação
-- Permite que qualquer pessoa com o link válido visualize e atualize o pedido
DROP POLICY IF EXISTS "Acesso público via link de aprovação" ON pedidos_materiais;
CREATE POLICY "Acesso público via link de aprovação"
  ON pedidos_materiais FOR ALL
  USING (
    -- Permite acesso se tiver link_aprovacao válido
    link_aprovacao IS NOT NULL
    AND status IN ('aguardando_aprovacao')
    AND (link_validade IS NULL OR link_validade > NOW())
  );

-- Comentário da tabela atualizado
COMMENT ON TABLE pedidos_materiais IS 'Pedidos de materiais feitos pelos colaboradores. Suporta fluxo de aprovação pelo cliente via email/whatsapp.';

-- ============================================================================
-- FLUXO DE STATUS DO PEDIDO DE MATERIAIS
-- ============================================================================
-- rascunho           → Criado mas não enviado
-- enviado            → Enviado para o setor de planejamento
-- em_orcamento       → Aprovado pelo gestor, em orçamentação
-- aguardando_aprovacao → Enviado para cliente aprovar via email/whatsapp
-- aprovado_cliente   → Aprovado pelo cliente
-- recusado_cliente   → Recusado pelo cliente
-- aprovado           → Aprovação final (pode prosseguir para compra)
-- em_compra          → Em processo de compra
-- concluido          → Materiais entregues
-- recusado           → Recusado pelo gestor
-- ============================================================================
