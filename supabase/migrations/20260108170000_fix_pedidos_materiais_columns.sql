-- ============================================================================
-- MIGRAÇÃO: Corrigir colunas da tabela pedidos_materiais
-- Data: 2026-01-08
-- Descrição: Adiciona colunas faltantes à tabela pedidos_materiais
-- ============================================================================

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS pedidos_materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID REFERENCES contratos(id) ON DELETE SET NULL,
  descricao TEXT,
  prioridade TEXT DEFAULT 'normal',
  observacoes TEXT,
  itens JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'rascunho',
  criado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar colunas que podem estar faltando (ignora erro se já existir)
DO $$
BEGIN
  -- Adicionar coluna descricao se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedidos_materiais' AND column_name = 'descricao'
  ) THEN
    ALTER TABLE pedidos_materiais ADD COLUMN descricao TEXT;
  END IF;

  -- Adicionar coluna prioridade se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedidos_materiais' AND column_name = 'prioridade'
  ) THEN
    ALTER TABLE pedidos_materiais ADD COLUMN prioridade TEXT DEFAULT 'normal';
  END IF;

  -- Adicionar coluna observacoes se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedidos_materiais' AND column_name = 'observacoes'
  ) THEN
    ALTER TABLE pedidos_materiais ADD COLUMN observacoes TEXT;
  END IF;

  -- Adicionar coluna itens se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedidos_materiais' AND column_name = 'itens'
  ) THEN
    ALTER TABLE pedidos_materiais ADD COLUMN itens JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Adicionar coluna status se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedidos_materiais' AND column_name = 'status'
  ) THEN
    ALTER TABLE pedidos_materiais ADD COLUMN status TEXT DEFAULT 'rascunho';
  END IF;

  -- Adicionar coluna criado_por se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedidos_materiais' AND column_name = 'criado_por'
  ) THEN
    ALTER TABLE pedidos_materiais ADD COLUMN criado_por UUID REFERENCES auth.users(id);
  END IF;

  -- Adicionar coluna projeto_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedidos_materiais' AND column_name = 'projeto_id'
  ) THEN
    ALTER TABLE pedidos_materiais ADD COLUMN projeto_id UUID REFERENCES contratos(id) ON DELETE SET NULL;
  END IF;

  -- Adicionar timestamps se não existirem
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedidos_materiais' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE pedidos_materiais ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedidos_materiais' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE pedidos_materiais ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Habilitar RLS
ALTER TABLE pedidos_materiais ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Colaboradores podem ver seus próprios pedidos" ON pedidos_materiais;
CREATE POLICY "Colaboradores podem ver seus próprios pedidos"
  ON pedidos_materiais FOR SELECT
  USING (criado_por = auth.uid());

DROP POLICY IF EXISTS "Colaboradores podem criar pedidos" ON pedidos_materiais;
CREATE POLICY "Colaboradores podem criar pedidos"
  ON pedidos_materiais FOR INSERT
  WITH CHECK (criado_por = auth.uid());

DROP POLICY IF EXISTS "Colaboradores podem atualizar seus próprios pedidos" ON pedidos_materiais;
CREATE POLICY "Colaboradores podem atualizar seus próprios pedidos"
  ON pedidos_materiais FOR UPDATE
  USING (criado_por = auth.uid());

-- Admins podem tudo
DROP POLICY IF EXISTS "Admins podem gerenciar todos os pedidos" ON pedidos_materiais;
CREATE POLICY "Admins podem gerenciar todos os pedidos"
  ON pedidos_materiais FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('ADMIN', 'GERENTE')
    )
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_pedidos_materiais_criado_por ON pedidos_materiais(criado_por);
CREATE INDEX IF NOT EXISTS idx_pedidos_materiais_projeto_id ON pedidos_materiais(projeto_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_materiais_status ON pedidos_materiais(status);

COMMENT ON TABLE pedidos_materiais IS 'Pedidos de materiais feitos pelos colaboradores';
