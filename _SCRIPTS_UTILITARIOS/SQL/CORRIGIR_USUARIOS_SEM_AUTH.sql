-- =============================================
-- SCRIPT: Verificar e listar usuários sem conta no Auth
-- Descrição: Identifica usuários na tabela 'usuarios' que não têm
--            uma conta correspondente no auth.users
-- =============================================

-- 1. VERIFICAR USUÁRIOS SEM AUTH_USER_ID
-- (Usuários que foram criados na tabela mas não no Supabase Auth)
SELECT
    u.id AS usuario_id,
    u.tipo_usuario,
    u.cpf,
    u.ativo,
    u.auth_user_id,
    p.nome,
    p.email,
    p.telefone,
    CASE
        WHEN u.auth_user_id IS NULL THEN '❌ SEM AUTH'
        ELSE '✅ COM AUTH'
    END AS status_auth
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
WHERE u.auth_user_id IS NULL
   OR u.auth_user_id::text = ''
ORDER BY u.criado_em DESC;

-- 2. VERIFICAR SE EXISTEM EMAILS DUPLICADOS QUE IMPEDEM CRIAÇÃO
SELECT
    p.email,
    COUNT(*) AS quantidade,
    STRING_AGG(p.nome, ', ') AS nomes
FROM pessoas p
WHERE p.email IS NOT NULL AND p.email != ''
GROUP BY p.email
HAVING COUNT(*) > 1;

-- 3. LISTAR TODOS OS USUÁRIOS COM STATUS COMPLETO
SELECT
    u.id,
    u.tipo_usuario,
    u.ativo,
    COALESCE(p.nome, 'N/A') AS nome,
    COALESCE(p.email, 'N/A') AS email,
    u.cpf,
    CASE
        WHEN u.auth_user_id IS NOT NULL THEN '✅ Vinculado'
        ELSE '❌ Não vinculado'
    END AS auth_status,
    u.criado_em
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
ORDER BY
    CASE WHEN u.auth_user_id IS NULL THEN 0 ELSE 1 END,
    u.criado_em DESC;
