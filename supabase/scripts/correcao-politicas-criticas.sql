-- ============================================================
-- CORREÇÃO DE POLÍTICAS CRÍTICAS - Sistema WG Easy
-- Data: 2026-01-09
-- ============================================================
-- ATENÇÃO: Execute cada seção SEPARADAMENTE
-- Faça backup antes de executar
-- ============================================================

-- ============================================================
-- 1. FIN_TRANSACTIONS - Tabela Financeira Crítica
-- ============================================================

-- Remover políticas permissivas
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar transações" ON fin_transactions;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar transações" ON fin_transactions;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir transações" ON fin_transactions;
DROP POLICY IF EXISTS "Usuários autenticados podem ver transações" ON fin_transactions;

-- Criar políticas seguras
CREATE POLICY fin_transactions_select_by_empresa ON fin_transactions
  FOR SELECT TO authenticated
  USING (
    -- Admin/Master vê tudo
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'FINANCEIRO')
      AND u.ativo = true
    )
    OR
    -- Outros usuários veem apenas da sua empresa/nucleo
    empresa_id IN (
      SELECT nucleo_id FROM usuarios WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY fin_transactions_insert_authenticated ON fin_transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'FINANCEIRO')
      AND u.ativo = true
    )
  );

CREATE POLICY fin_transactions_update_by_role ON fin_transactions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'FINANCEIRO')
      AND u.ativo = true
    )
  );

CREATE POLICY fin_transactions_delete_admin_only ON fin_transactions
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN')
      AND u.ativo = true
    )
  );

-- ============================================================
-- 2. CONTRATOS - Dados Contratuais
-- ============================================================

-- Remover políticas permissivas
DROP POLICY IF EXISTS "Usuarios autenticados podem ver contratos" ON contratos;
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar contratos" ON contratos;
DROP POLICY IF EXISTS "contratos_all" ON contratos;

-- Criar políticas seguras
CREATE POLICY contratos_select_by_nucleo ON contratos
  FOR SELECT TO authenticated
  USING (
    -- Admin/Master/Comercial/Atendimento vê tudo
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'COMERCIAL', 'ATENDIMENTO', 'JURIDICO', 'FINANCEIRO')
      AND u.ativo = true
    )
    OR
    -- Cliente vê apenas seus próprios contratos
    cliente_id IN (
      SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid()
    )
    OR
    -- Usuário vê contratos do seu núcleo
    nucleo_id IN (
      SELECT nucleo_id FROM usuarios WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY contratos_insert_comercial ON contratos
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'COMERCIAL', 'ATENDIMENTO', 'JURIDICO')
      AND u.ativo = true
    )
  );

CREATE POLICY contratos_update_by_role ON contratos
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'COMERCIAL', 'ATENDIMENTO', 'JURIDICO')
      AND u.ativo = true
    )
  );

CREATE POLICY contratos_delete_admin_only ON contratos
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN')
      AND u.ativo = true
    )
  );

-- ============================================================
-- 3. PESSOAS - Dados Pessoais (LGPD)
-- ============================================================

-- Remover políticas permissivas
DROP POLICY IF EXISTS "pessoas_update_self" ON pessoas;
DROP POLICY IF EXISTS "pessoas_select_auth" ON pessoas;
DROP POLICY IF EXISTS "pessoas_select_by_email" ON pessoas;

-- Criar políticas seguras
CREATE POLICY pessoas_select_internal ON pessoas
  FOR SELECT TO authenticated
  USING (
    -- Usuários internos podem ver todas as pessoas
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'COMERCIAL', 'ATENDIMENTO', 'JURIDICO', 'FINANCEIRO', 'COLABORADOR')
      AND u.ativo = true
    )
    OR
    -- Usuário pode ver seu próprio registro
    id IN (
      SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY pessoas_insert_internal ON pessoas
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'COMERCIAL', 'ATENDIMENTO')
      AND u.ativo = true
    )
  );

CREATE POLICY pessoas_update_self_or_admin ON pessoas
  FOR UPDATE TO authenticated
  USING (
    -- Admin pode atualizar qualquer pessoa
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'COMERCIAL', 'ATENDIMENTO')
      AND u.ativo = true
    )
    OR
    -- Usuário pode atualizar seu próprio registro
    id IN (
      SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY pessoas_delete_admin_only ON pessoas
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN')
      AND u.ativo = true
    )
  );

-- ============================================================
-- 4. REEMBOLSOS - Financeiro
-- ============================================================

DROP POLICY IF EXISTS "Permitir DELETE para usuários autenticados" ON reembolsos;
DROP POLICY IF EXISTS "Permitir SELECT para usuários autenticados" ON reembolsos;
DROP POLICY IF EXISTS "Permitir UPDATE para usuários autenticados" ON reembolsos;
DROP POLICY IF EXISTS "Permitir INSERT para usuários autenticados" ON reembolsos;

CREATE POLICY reembolsos_select_own_or_admin ON reembolsos
  FOR SELECT TO authenticated
  USING (
    -- Financeiro/Admin vê tudo
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'FINANCEIRO')
      AND u.ativo = true
    )
    OR
    -- Usuário vê seus próprios reembolsos
    solicitante_id IN (
      SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY reembolsos_insert_authenticated ON reembolsos
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY reembolsos_update_financeiro ON reembolsos
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'FINANCEIRO')
      AND u.ativo = true
    )
    OR
    -- Solicitante pode atualizar se ainda estiver pendente
    (
      solicitante_id IN (SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid())
      AND status = 'pendente'
    )
  );

CREATE POLICY reembolsos_delete_admin_only ON reembolsos
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN')
      AND u.ativo = true
    )
  );

-- ============================================================
-- 5. COMISSOES - Financeiro
-- ============================================================

DROP POLICY IF EXISTS "Permitir SELECT para usuários autenticados" ON comissoes;
DROP POLICY IF EXISTS "Permitir DELETE para usuários autenticados" ON comissoes;
DROP POLICY IF EXISTS "Permitir UPDATE para usuários autenticados" ON comissoes;
DROP POLICY IF EXISTS "Permitir INSERT para usuários autenticados" ON comissoes;

CREATE POLICY comissoes_select_financeiro ON comissoes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'FINANCEIRO', 'COMERCIAL')
      AND u.ativo = true
    )
    OR
    -- Beneficiário vê suas próprias comissões
    beneficiario_id IN (
      SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY comissoes_insert_financeiro ON comissoes
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'FINANCEIRO')
      AND u.ativo = true
    )
  );

CREATE POLICY comissoes_update_financeiro ON comissoes
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'FINANCEIRO')
      AND u.ativo = true
    )
  );

CREATE POLICY comissoes_delete_admin_only ON comissoes
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN')
      AND u.ativo = true
    )
  );

-- ============================================================
-- 6. USUARIOS_PERFIS - Permissões do Sistema
-- ============================================================

DROP POLICY IF EXISTS "permitir_select_user" ON usuarios_perfis;
DROP POLICY IF EXISTS "usuarios_perfis_select" ON usuarios_perfis;
DROP POLICY IF EXISTS "permitir_update_user" ON usuarios_perfis;
DROP POLICY IF EXISTS "usuarios_perfis_update" ON usuarios_perfis;

CREATE POLICY usuarios_perfis_select_own ON usuarios_perfis
  FOR SELECT TO authenticated
  USING (
    -- Admin vê tudo
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN')
      AND u.ativo = true
    )
    OR
    -- Usuário vê seu próprio perfil
    usuario_id IN (
      SELECT id FROM usuarios WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY usuarios_perfis_insert_admin ON usuarios_perfis
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN')
      AND u.ativo = true
    )
  );

CREATE POLICY usuarios_perfis_update_admin ON usuarios_perfis
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN')
      AND u.ativo = true
    )
  );

CREATE POLICY usuarios_perfis_delete_admin ON usuarios_perfis
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN')
      AND u.ativo = true
    )
  );

-- ============================================================
-- 7. OPORTUNIDADES - Comercial
-- ============================================================

DROP POLICY IF EXISTS "Permitir acesso autenticado" ON oportunidades;

CREATE POLICY oportunidades_select_comercial ON oportunidades
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'COMERCIAL', 'ATENDIMENTO')
      AND u.ativo = true
    )
    OR
    -- Vendedor vê suas próprias oportunidades
    vendedor_id IN (
      SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY oportunidades_insert_comercial ON oportunidades
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'COMERCIAL', 'ATENDIMENTO')
      AND u.ativo = true
    )
  );

CREATE POLICY oportunidades_update_comercial ON oportunidades
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN', 'COMERCIAL', 'ATENDIMENTO')
      AND u.ativo = true
    )
    OR
    vendedor_id IN (
      SELECT pessoa_id FROM usuarios WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY oportunidades_delete_admin ON oportunidades
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('MASTER', 'ADMIN')
      AND u.ativo = true
    )
  );
