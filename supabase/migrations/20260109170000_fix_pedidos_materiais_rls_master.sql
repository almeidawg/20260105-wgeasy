-- ============================================================================
-- Migration: Corrigir RLS de pedidos_materiais para incluir MASTER
-- Data: 2026-01-09
-- Problema: MASTER não consegue ver pedidos de materiais nas aprovações
-- ============================================================================

-- Remover política antiga
DROP POLICY IF EXISTS "Admins podem gerenciar todos os pedidos" ON pedidos_materiais;

-- Criar nova política incluindo MASTER
CREATE POLICY "Admins podem gerenciar todos os pedidos"
  ON pedidos_materiais FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'GERENTE')
    )
  );

-- Também criar política para SELECT específico (para garantir que funciona com supabaseRaw)
DROP POLICY IF EXISTS "Masters podem ver todos os pedidos" ON pedidos_materiais;
CREATE POLICY "Masters podem ver todos os pedidos"
  ON pedidos_materiais FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'MASTER'
    )
  );

-- Comentário para documentação
COMMENT ON POLICY "Admins podem gerenciar todos os pedidos" ON pedidos_materiais IS
  'Permite que MASTER, ADMIN e GERENTE vejam e gerenciem todos os pedidos de materiais';

-- Verificação
DO $$
BEGIN
  RAISE NOTICE 'RLS de pedidos_materiais atualizado para incluir MASTER';
END $$;
