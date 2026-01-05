-- ============================================================
-- CORREÇÕES DE SEGURANÇA - RLS (Row Level Security)
-- Execute este script no Supabase SQL Editor
-- Data: 2026-01-05
-- VERSÃO 2: Usando nomes REAIS das tabelas do WGEasy
-- ============================================================

-- ============================================================
-- 1. HABILITAR RLS EM TABELAS CRÍTICAS (que existem)
-- ============================================================

ALTER TABLE IF EXISTS usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS financeiro_lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contratos_pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contratos_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS acessos_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS arquivos_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comissoes ENABLE ROW LEVEL SECURITY;

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
-- 4. POLÍTICA PARA TABELA CONTRATOS
-- (contratos tem cliente_id diretamente, não via oportunidade)
-- ============================================================

DROP POLICY IF EXISTS "contratos_select" ON contratos;
CREATE POLICY "contratos_select" ON contratos
  FOR SELECT
  USING (
    -- É o cliente do contrato
    cliente_id = (SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid())
    OR
    -- Ou é equipe interna
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('ADMIN', 'MASTER', 'COMERCIAL', 'JURIDICO', 'FINANCEIRO', 'ATENDIMENTO')
    )
  );

DROP POLICY IF EXISTS "contratos_update" ON contratos;
CREATE POLICY "contratos_update" ON contratos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('ADMIN', 'MASTER', 'COMERCIAL', 'JURIDICO')
    )
  );

-- ============================================================
-- 5. POLÍTICA PARA TABELA FINANCEIRO_LANCAMENTOS
-- ============================================================

DROP POLICY IF EXISTS "financeiro_lancamentos_select" ON financeiro_lancamentos;
CREATE POLICY "financeiro_lancamentos_select" ON financeiro_lancamentos
  FOR SELECT
  USING (
    -- Cliente vê apenas seus lançamentos (via contrato)
    EXISTS (
      SELECT 1 FROM contratos c
      WHERE c.id = financeiro_lancamentos.contrato_id
      AND c.cliente_id = (SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid())
    )
    OR
    -- Equipe financeira vê todos
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('ADMIN', 'MASTER', 'FINANCEIRO')
    )
  );

-- Apenas financeiro pode inserir lançamentos
DROP POLICY IF EXISTS "financeiro_lancamentos_insert" ON financeiro_lancamentos;
CREATE POLICY "financeiro_lancamentos_insert" ON financeiro_lancamentos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('ADMIN', 'MASTER', 'FINANCEIRO')
    )
  );

-- Apenas financeiro pode modificar lançamentos
DROP POLICY IF EXISTS "financeiro_lancamentos_update" ON financeiro_lancamentos;
CREATE POLICY "financeiro_lancamentos_update" ON financeiro_lancamentos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('ADMIN', 'MASTER', 'FINANCEIRO')
    )
  );

-- ============================================================
-- 6. POLÍTICA PARA TABELA CONTRATOS_PAGAMENTOS
-- ============================================================

DROP POLICY IF EXISTS "contratos_pagamentos_select" ON contratos_pagamentos;
CREATE POLICY "contratos_pagamentos_select" ON contratos_pagamentos
  FOR SELECT
  USING (
    -- Cliente vê pagamentos do seu contrato
    EXISTS (
      SELECT 1 FROM contratos c
      WHERE c.id = contratos_pagamentos.contrato_id
      AND c.cliente_id = (SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid())
    )
    OR
    -- Equipe financeira vê todos
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('ADMIN', 'MASTER', 'FINANCEIRO', 'COMERCIAL')
    )
  );

-- ============================================================
-- 7. POLÍTICA PARA TABELA CONTRATOS_DOCUMENTOS
-- ============================================================

DROP POLICY IF EXISTS "contratos_documentos_select" ON contratos_documentos;
CREATE POLICY "contratos_documentos_select" ON contratos_documentos
  FOR SELECT
  USING (
    -- Cliente vê documentos do seu contrato
    EXISTS (
      SELECT 1 FROM contratos c
      WHERE c.id = contratos_documentos.contrato_id
      AND c.cliente_id = (SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid())
    )
    OR
    -- Equipe interna vê todos
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('ADMIN', 'MASTER', 'COMERCIAL', 'JURIDICO', 'ATENDIMENTO')
    )
  );

-- ============================================================
-- 8. POLÍTICA PARA TABELA ACESSOS_CLIENTE
-- ============================================================

DROP POLICY IF EXISTS "acessos_cliente_select" ON acessos_cliente;
CREATE POLICY "acessos_cliente_select" ON acessos_cliente
  FOR SELECT
  USING (
    -- Cliente vê apenas seus próprios acessos
    cliente_id = (SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid())
    OR
    -- Admin vê todos
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('ADMIN', 'MASTER')
    )
  );

-- ============================================================
-- 9. POLÍTICA PARA TABELA ARQUIVOS_METADATA
-- (usa entidade_tipo e entidade_id para relacionar com outras tabelas)
-- ============================================================

DROP POLICY IF EXISTS "arquivos_metadata_select" ON arquivos_metadata;
CREATE POLICY "arquivos_metadata_select" ON arquivos_metadata
  FOR SELECT
  USING (
    -- Arquivo da pessoa do usuário (entidade_tipo = 'pessoa')
    (
      entidade_tipo = 'pessoa'
      AND entidade_id = (SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid())
    )
    OR
    -- Arquivo de contrato do cliente (entidade_tipo = 'contrato')
    (
      entidade_tipo = 'contrato'
      AND EXISTS (
        SELECT 1 FROM contratos c
        WHERE c.id = arquivos_metadata.entidade_id
        AND c.cliente_id = (SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid())
      )
    )
    OR
    -- Equipe interna vê todos
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('ADMIN', 'MASTER', 'COMERCIAL', 'ATENDIMENTO')
    )
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
    WHEN 'contratos' THEN
      SELECT EXISTS(
        SELECT 1 FROM contratos WHERE id = p_resource_id AND cliente_id = v_pessoa_id
      ) INTO v_is_owner;
    WHEN 'financeiro_lancamentos' THEN
      SELECT EXISTS(
        SELECT 1 FROM financeiro_lancamentos fl
        JOIN contratos c ON c.id = fl.contrato_id
        WHERE fl.id = p_resource_id AND c.cliente_id = v_pessoa_id
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
  'usuarios', 'pessoas', 'contratos', 'financeiro_lancamentos',
  'contratos_pagamentos', 'contratos_documentos', 'acessos_cliente',
  'arquivos_metadata', 'audit_logs'
)
ORDER BY tablename;

-- ============================================================
-- FIM DAS CORREÇÕES V2
-- ============================================================
