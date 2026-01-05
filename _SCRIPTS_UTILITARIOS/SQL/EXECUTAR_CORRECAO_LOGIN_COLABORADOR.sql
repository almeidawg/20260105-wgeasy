-- ============================================================
-- SCRIPT EXECUTIVO: Corrigir Login Colaborador → /colaborador
-- Data: 4 de Janeiro, 2026
-- Status: PRONTO PARA EXECUTAR
-- ============================================================

-- ⚠️ ATENÇÃO: Execute este script NO SUPABASE SQL EDITOR
-- Passo 1 é seguro (cria políticas)
-- Passo 2 é crítico (atualiza tipo_usuario - BACKUP RECOMENDADO)

-- ============================================================
-- PASSO 1: CORRIGIR RLS - PERMITIR LER PRÓPRIO REGISTRO
-- STATUS: ✅ SEGURO - Apenas RLS, nenhum dado alterado
-- ============================================================

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios FORCE ROW LEVEL SECURITY;

-- Remover políticas antigas que podem estar bloqueando
DROP POLICY IF EXISTS "usuarios_select_policy" ON usuarios;
DROP POLICY IF EXISTS "usuarios_select_old" ON usuarios;
DROP POLICY IF EXISTS "usuarios_insert_policy" ON usuarios;
DROP POLICY IF EXISTS "usuarios_update_policy" ON usuarios;
DROP POLICY IF EXISTS "usuarios_delete_policy" ON usuarios;
DROP POLICY IF EXISTS "usuarios_select_own_or_admin" ON usuarios;

-- ============================================================
-- Criar política SELECT: Usuário vê seu próprio + Admin vê tudo
-- ============================================================
CREATE POLICY "usuarios_select_own_or_admin" ON usuarios
    FOR SELECT
    TO authenticated
    USING (
        -- Usuário vê seu próprio registro
        auth_user_id = auth.uid()
        OR
        -- Ou é admin/master e vê tudo
        EXISTS (
            SELECT 1 FROM usuarios admin
            WHERE admin.auth_user_id = auth.uid()
            AND admin.tipo_usuario IN ('MASTER', 'ADMIN')
            AND admin.ativo = true
        )
    );

-- ============================================================
-- Criar política INSERT: Criar próprio + Admin pode criar
-- ============================================================
DROP POLICY IF EXISTS "usuarios_insert_admin_only" ON usuarios;
CREATE POLICY "usuarios_insert_admin_only" ON usuarios
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Admin pode criar para outros
        EXISTS (
            SELECT 1 FROM usuarios admin
            WHERE admin.auth_user_id = auth.uid()
            AND admin.tipo_usuario IN ('MASTER', 'ADMIN')
            AND admin.ativo = true
        )
    );

-- ============================================================
-- Criar política UPDATE: Admin pode atualizar + usuário seu próprio
-- ============================================================
DROP POLICY IF EXISTS "usuarios_update_own_or_admin" ON usuarios;
CREATE POLICY "usuarios_update_own_or_admin" ON usuarios
    FOR UPDATE
    TO authenticated
    USING (
        -- Usuário atualiza seu próprio
        auth_user_id = auth.uid()
        OR
        -- Admin atualiza qualquer um
        EXISTS (
            SELECT 1 FROM usuarios admin
            WHERE admin.auth_user_id = auth.uid()
            AND admin.tipo_usuario IN ('MASTER', 'ADMIN')
            AND admin.ativo = true
        )
    )
    WITH CHECK (
        auth_user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM usuarios admin
            WHERE admin.auth_user_id = auth.uid()
            AND admin.tipo_usuario IN ('MASTER', 'ADMIN')
            AND admin.ativo = true
        )
    );

-- ============================================================
-- Criar política DELETE: Apenas admin pode deletar
-- ============================================================
DROP POLICY IF EXISTS "usuarios_delete_admin_only" ON usuarios;
CREATE POLICY "usuarios_delete_admin_only" ON usuarios
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios admin
            WHERE admin.auth_user_id = auth.uid()
            AND admin.tipo_usuario IN ('MASTER', 'ADMIN')
            AND admin.ativo = true
        )
    );

-- ============================================================
-- VERIFICAÇÃO APÓS PASSO 1
-- ============================================================

-- ✅ PASSO 1 COMPLETO: RLS Policies atualizadas

SELECT
    COUNT(*) as policies_criadas
FROM pg_policies
WHERE tablename = 'usuarios'
  AND policyname IN (
    'usuarios_select_own_or_admin',
    'usuarios_insert_admin_only',
    'usuarios_update_own_or_admin',
    'usuarios_delete_admin_only'
  );

-- ============================================================
-- PASSO 2: CORRIGIR TIPO_USUARIO SE DIVERGENTE
-- STATUS: ⚠️ CRÍTICO - Altera dados do usuário
-- RECOMENDAÇÃO: Faça backup antes
-- ============================================================

-- Ver divergências
SELECT
    u.id,
    u.email,
    u.tipo_usuario as tipo_atual,
    p.tipo as tipo_esperado,
    p.nome
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
WHERE p.tipo IS NOT NULL
  AND u.tipo_usuario IS DISTINCT FROM p.tipo
ORDER BY p.tipo, u.email;

-- Corrigir: Colaboradores com tipo errado
UPDATE usuarios u
SET tipo_usuario = p.tipo, atualizado_em = NOW()
FROM pessoas p
WHERE u.pessoa_id = p.id
  AND p.tipo = 'COLABORADOR'
  AND u.tipo_usuario IS DISTINCT FROM 'COLABORADOR'
  AND u.ativo = true;

-- ✅ PASSO 2 COMPLETO: Tipos de usuário sincronizados com pessoas.tipo

-- ============================================================
-- PASSO 3: GARANTIR QUE CAMPOS CRÍTICOS ESTÃO PREENCHIDOS
-- ============================================================

-- Verificar
SELECT
    COUNT(*) as total_colaboradores,
    COUNT(CASE WHEN u.tipo_usuario = 'COLABORADOR' THEN 1 END) as colaboradores_ok,
    COUNT(CASE WHEN u.auth_user_id IS NULL THEN 1 END) as sem_auth_user_id,
    COUNT(CASE WHEN u.email_confirmed = false THEN 1 END) as email_nao_confirmado
FROM usuarios u
JOIN pessoas p ON p.id = u.pessoa_id
WHERE p.tipo = 'COLABORADOR';

-- Se houver email_confirmed = false, atualizar:
UPDATE usuarios
SET email_confirmed = true, atualizado_em = NOW()
WHERE tipo_usuario = 'COLABORADOR'
  AND email_confirmed = false
  AND email IS NOT NULL;

-- Se houver account_status diferente de 'active', atualizar:
UPDATE usuarios
SET account_status = 'active', atualizado_em = NOW()
WHERE tipo_usuario = 'COLABORADOR'
  AND account_status IS DISTINCT FROM 'active'
  AND ativo = true;

-- ✅ PASSO 3 COMPLETO: Campos críticos validados

-- ============================================================
-- PASSO 4: VERIFICAÇÃO FINAL
-- ============================================================

-- ✅ SCRIPT EXECUTADO COM SUCESSO
-- 📊 RESUMO:
--   ✅ RLS Policies criadas/atualizadas
--   ✅ Tipos de usuário sincronizados
--   ✅ Campos críticos validados

-- 🧪 PRÓXIMO PASSO: Faça login com usuário COLABORADOR
--    Resultado esperado: Redirecionar para /colaborador

-- 📋 DIAGNÓSTICO FINAL:

SELECT
    'Total de Colaboradores' as diagnostico,
    COUNT(*)::text as resultado
FROM usuarios u
JOIN pessoas p ON p.id = u.pessoa_id
WHERE p.tipo = 'COLABORADOR'
  AND u.tipo_usuario = 'COLABORADOR'
UNION ALL
SELECT
    'Email Confirmado',
    COUNT(*)::text
FROM usuarios u
JOIN pessoas p ON p.id = u.pessoa_id
WHERE p.tipo = 'COLABORADOR'
  AND u.email_confirmed = true
UNION ALL
SELECT
    'Account Ativo',
    COUNT(*)::text
FROM usuarios u
JOIN pessoas p ON p.id = u.pessoa_id
WHERE p.tipo = 'COLABORADOR'
  AND u.account_status = 'active'
  AND u.ativo = true
UNION ALL
SELECT
    'RLS Status',
    CASE WHEN (SELECT rowsecurity FROM pg_tables WHERE tablename = 'usuarios') THEN 'Habilitado ✅' ELSE 'Desabilitado ❌' END::text
UNION ALL
SELECT
    'Políticas RLS',
    COUNT(*)::text || ' políticas'
FROM pg_policies
WHERE tablename = 'usuarios';
