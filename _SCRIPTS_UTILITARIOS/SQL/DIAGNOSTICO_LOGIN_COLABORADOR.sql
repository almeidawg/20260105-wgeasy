-- ============================================================
-- DIAGNÓSTICO E CORREÇÃO: LOGIN COLABORADOR INDO PARA /wgx
-- Problema: Usuário loga com sucesso mas redireciona para /wgx ao invés de /colaborador
-- ============================================================

-- ============================================================
-- PASSO 1: VERIFICAR RLS NA TABELA usuarios
-- ============================================================

-- Ver todas as políticas
SELECT schemaname, tablename, policyname, permissive, qual, with_check
FROM pg_policies
WHERE tablename = 'usuarios'
ORDER BY policyname;

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'usuarios';

-- ============================================================
-- PASSO 2: VERIFICAR USUÁRIOS COLABORADORES
-- ============================================================

-- Ver todos os colaboradores e seu tipo_usuario
SELECT
    u.id,
    u.auth_user_id,
    u.tipo_usuario,
    u.email,
    u.cpf,
    u.account_status,
    u.email_confirmed,
    u.ativo,
    p.nome,
    p.tipo as tipo_pessoa
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
WHERE u.tipo_usuario IN ('COLABORADOR', 'MASTER', 'ADMIN', 'COMERCIAL')
ORDER BY u.tipo_usuario, u.email;

-- ============================================================
-- PASSO 3: VERIFICAR RLS BLOQUEANDO LEITURA DO PRÓPRIO USUÁRIO
-- ============================================================

-- Teste: se você conhece o auth_user_id, tente ler como esse usuário
-- Comentário: depois de logado, tente executar como authenticated user:
/*
SELECT
    id,
    tipo_usuario,
    pessoa_id,
    email,
    cpf,
    account_status
FROM usuarios
WHERE auth_user_id = auth.uid()
LIMIT 1;
*/

-- ============================================================
-- PASSO 4: VERIFICAR RLS POLICIES CORRIGIDAS
-- ============================================================

-- Política para SELECT (ler próprio registro ou ser admin)
DROP POLICY IF EXISTS "usuarios_select_own_or_admin" ON usuarios;
CREATE POLICY "usuarios_select_own_or_admin" ON usuarios
    FOR SELECT
    TO authenticated
    USING (
        -- Usuário vê seu próprio registro
        auth_user_id = auth.uid()
        OR
        -- Admins veem todos
        EXISTS (
            SELECT 1 FROM usuarios admin
            WHERE admin.auth_user_id = auth.uid()
            AND admin.tipo_usuario IN ('MASTER', 'ADMIN')
            AND admin.ativo = true
        )
    );

-- Política para INSERT (apenas criar seu próprio)
DROP POLICY IF EXISTS "usuarios_insert_own" ON usuarios;
CREATE POLICY "usuarios_insert_own" ON usuarios
    FOR INSERT
    TO authenticated
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

-- Política para UPDATE (seu próprio ou admin)
DROP POLICY IF EXISTS "usuarios_update_own_or_admin" ON usuarios;
CREATE POLICY "usuarios_update_own_or_admin" ON usuarios
    FOR UPDATE
    TO authenticated
    USING (
        auth_user_id = auth.uid()
        OR
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
-- PASSO 5: DEPOIS DE APLICAR RLS, TESTAR LEITURA
-- ============================================================

-- Verificar se a RLS permite leitura do próprio usuário
-- (Executar como usuário autenticado para testar)
/*
SELECT
    u.id,
    u.tipo_usuario,
    u.pessoa_id,
    u.email,
    u.cpf,
    u.account_status
FROM usuarios u
WHERE u.auth_user_id = auth.uid()
LIMIT 1;
*/

-- ============================================================
-- PASSO 6: DIAGNOSTICAR TIPO_USUARIO INCORRETO
-- ============================================================

-- Se houver colaborador com tipo_usuario CLIENTE:
-- Você pode atualizar assim:
/*
UPDATE usuarios
SET tipo_usuario = 'COLABORADOR'
WHERE pessoa_id IN (
    SELECT id FROM pessoas
    WHERE tipo = 'COLABORADOR'
)
AND tipo_usuario != 'COLABORADOR';
*/

-- ============================================================
-- PASSO 7: FORÇAR RLS
-- ============================================================

-- Isso garante que até o table owner respeita RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios FORCE ROW LEVEL SECURITY;

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================

SELECT
    'RLS Status' as verificacao,
    rowsecurity as habilitado
FROM pg_tables
WHERE tablename = 'usuarios'
UNION ALL
SELECT
    'Políticas RLS' as verificacao,
    COUNT(*) || ' políticas' as habilitado
FROM pg_policies
WHERE tablename = 'usuarios';
