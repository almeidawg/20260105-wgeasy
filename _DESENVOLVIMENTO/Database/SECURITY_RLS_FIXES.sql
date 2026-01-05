-- ============================================================
-- CORREÇÕES DE SEGURANÇA - RLS (Row Level Security)
-- Execute este script no Supabase SQL Editor
-- Data: 2026-01-05
-- ATUALIZADO: Usando nomes reais das tabelas do sistema
-- ============================================================

-- ============================================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS CRÍTICAS
-- ============================================================

ALTER TABLE IF EXISTS usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS financeiro_lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS propostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS arquivos_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS acessos_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contratos_pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contratos_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. POLÍTICA PARA TABELA USUARIOS
-- ============================================================

-- Usuário só pode ver seus próprios dados
DROP POLICY IF EXISTS "usuarios_select_own" ON usuarios;
CREATE POLICY "usuarios_select_own" ON usuarios
  FOR SELECT
  USING (auth.uid() = auth_user_id);

-- ADMIN e MASTER podem ver todos
DROP POLICY IF EXISTS "usuarios_select_admin" ON usuarios;
CREATE POLICY "usuarios_select_admin" ON usuarios
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('ADMIN', 'MASTER')
    )
  );

-- Apenas ADMIN pode modificar
DROP POLICY IF EXISTS "usuarios_update_admin" ON usuarios;
CREATE POLICY "usuarios_update_admin" ON usuarios
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('ADMIN', 'MASTER')
    )
  );

-- ============================================================
-- 3. POLÍTICA PARA TABELA PESSOAS (CLIENTES)
-- ============================================================

-- Cliente só pode ver seus próprios dados
DROP POLICY IF EXISTS "pessoas_select_cliente" ON pessoas;
CREATE POLICY "pessoas_select_cliente" ON pessoas
  FOR SELECT
  USING (
    -- É a própria pessoa
    id = (SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid())
    OR
    -- Ou é ADMIN/MASTER/COMERCIAL
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('ADMIN', 'MASTER', 'COMERCIAL', 'ATENDIMENTO')
    )
  );

-- Cliente só pode atualizar seus próprios dados
DROP POLICY IF EXISTS "pessoas_update_cliente" ON pessoas;
CREATE POLICY "pessoas_update_cliente" ON pessoas
  FOR UPDATE
  USING (
    id = (SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('ADMIN', 'MASTER', 'COMERCIAL')
    )
  );

-- ============================================================
-- 4. POLÍTICA PARA TABELA OPORTUNIDADES
-- ============================================================

-- Cliente só vê suas oportunidades
DROP POLICY IF EXISTS "oportunidades_select" ON oportunidades;
CREATE POLICY "oportunidades_select" ON oportunidades
  FOR SELECT
  USING (
    -- É o cliente da oportunidade
    cliente_id = (SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid())
    OR
    -- Ou é equipe interna
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('ADMIN', 'MASTER', 'COMERCIAL', 'ATENDIMENTO', 'FINANCEIRO')
    )
  );

-- ============================================================
-- 5. POLÍTICA PARA TABELA CONTRATOS
-- ============================================================

DROP POLICY IF EXISTS "contratos_select" ON contratos;
CREATE POLICY "contratos_select" ON contratos
  FOR SELECT
  USING (
    -- É o cliente do contrato (via oportunidade)
    EXISTS (
      SELECT 1 FROM oportunidades o
      WHERE o.id = contratos.oportunidade_id
      AND o.cliente_id = (SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid())
    )
    OR
    -- Ou é equipe interna
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('ADMIN', 'MASTER', 'COMERCIAL', 'JURIDICO', 'FINANCEIRO')
    )
  );

-- ============================================================
-- 6. POLÍTICA PARA TABELA LANCAMENTOS (FINANCEIRO)
-- ============================================================

DROP POLICY IF EXISTS "lancamentos_select" ON lancamentos;
CREATE POLICY "lancamentos_select" ON lancamentos
  FOR SELECT
  USING (
    -- Cliente vê apenas seus lançamentos
    EXISTS (
      SELECT 1 FROM oportunidades o
      WHERE o.id = lancamentos.oportunidade_id
      AND o.cliente_id = (SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid())
    )
    OR
    -- Equipe financeira vê todos
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('ADMIN', 'MASTER', 'FINANCEIRO')
    )
  );

-- Apenas financeiro pode modificar lançamentos
DROP POLICY IF EXISTS "lancamentos_insert" ON lancamentos;
CREATE POLICY "lancamentos_insert" ON lancamentos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('ADMIN', 'MASTER', 'FINANCEIRO')
    )
  );

DROP POLICY IF EXISTS "lancamentos_update" ON lancamentos;
CREATE POLICY "lancamentos_update" ON lancamentos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('ADMIN', 'MASTER', 'FINANCEIRO')
    )
  );

-- ============================================================
-- 7. POLÍTICA PARA TABELA PROPOSTAS
-- ============================================================

DROP POLICY IF EXISTS "propostas_select" ON propostas;
CREATE POLICY "propostas_select" ON propostas
  FOR SELECT
  USING (
    -- Cliente vê suas propostas
    cliente_id = (SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid())
    OR
    -- Equipe comercial vê todas
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('ADMIN', 'MASTER', 'COMERCIAL')
    )
  );

-- ============================================================
-- 8. POLÍTICA PARA TABELA ARQUIVOS
-- ============================================================

DROP POLICY IF EXISTS "arquivos_select" ON arquivos;
CREATE POLICY "arquivos_select" ON arquivos
  FOR SELECT
  USING (
    -- Arquivo da pessoa do usuário
    pessoa_id = (SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid())
    OR
    -- Arquivo de oportunidade do cliente
    EXISTS (
      SELECT 1 FROM oportunidades o
      WHERE o.id = arquivos.oportunidade_id
      AND o.cliente_id = (SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid())
    )
    OR
    -- Equipe interna
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('ADMIN', 'MASTER', 'COMERCIAL', 'ATENDIMENTO')
    )
  );

-- ============================================================
-- 9. POLÍTICA PARA TABELA NOTIFICACOES
-- ============================================================

DROP POLICY IF EXISTS "notificacoes_select" ON notificacoes;
CREATE POLICY "notificacoes_select" ON notificacoes
  FOR SELECT
  USING (
    -- Usuário vê apenas suas notificações
    usuario_id = (SELECT id FROM usuarios WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "notificacoes_update" ON notificacoes;
CREATE POLICY "notificacoes_update" ON notificacoes
  FOR UPDATE
  USING (
    -- Usuário só pode marcar como lida suas próprias notificações
    usuario_id = (SELECT id FROM usuarios WHERE auth_user_id = auth.uid())
  );

-- ============================================================
-- 10. ADICIONAR COLUNA dados_confirmados SE NÃO EXISTIR
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'dados_confirmados'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN dados_confirmados BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ============================================================
-- 11. FUNÇÃO PARA VERIFICAR SE USUÁRIO É DONO DO RECURSO
-- ============================================================

CREATE OR REPLACE FUNCTION is_resource_owner(
  p_table_name TEXT,
  p_resource_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_pessoa_id UUID;
  v_is_owner BOOLEAN := FALSE;
BEGIN
  -- Obter ID do usuário autenticado
  v_user_id := auth.uid();

  -- Obter pessoa_id do usuário
  SELECT pessoa_id INTO v_pessoa_id
  FROM usuarios
  WHERE auth_user_id = v_user_id;

  -- Verificar propriedade baseado na tabela
  CASE p_table_name
    WHEN 'pessoas' THEN
      v_is_owner := (p_resource_id = v_pessoa_id);
    WHEN 'oportunidades' THEN
      SELECT EXISTS(
        SELECT 1 FROM oportunidades WHERE id = p_resource_id AND cliente_id = v_pessoa_id
      ) INTO v_is_owner;
    WHEN 'contratos' THEN
      SELECT EXISTS(
        SELECT 1 FROM contratos c
        JOIN oportunidades o ON o.id = c.oportunidade_id
        WHERE c.id = p_resource_id AND o.cliente_id = v_pessoa_id
      ) INTO v_is_owner;
    WHEN 'propostas' THEN
      SELECT EXISTS(
        SELECT 1 FROM propostas WHERE id = p_resource_id AND cliente_id = v_pessoa_id
      ) INTO v_is_owner;
    ELSE
      v_is_owner := FALSE;
  END CASE;

  RETURN v_is_owner;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 12. GRANT PARA FUNÇÃO
-- ============================================================

GRANT EXECUTE ON FUNCTION is_resource_owner TO authenticated;

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================

-- Lista todas as tabelas com RLS ativo
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'usuarios', 'pessoas', 'oportunidades', 'contratos',
  'lancamentos', 'propostas', 'arquivos', 'notificacoes'
)
ORDER BY tablename;

-- ============================================================
-- FIM DAS CORREÇÕES
-- ============================================================
