-- =====================================================
-- DIAGNOSTICAR PROBLEMA DE SENHA
-- authApi.ts:320 - Invalid login credentials
-- =====================================================

-- PASSO 1: Ver estado de auth.users
SELECT
  id,
  email,
  phone,
  confirmed_at,
  last_sign_in_at,
  created_at,
  updated_at
FROM auth.users
ORDER BY created_at DESC;

-- PASSO 2: Comparar usuarios vs auth.users
SELECT
  u.id as usuario_id,
  p.nome,
  p.email as email_pessoas,
  u.auth_user_id,
  au.email as email_auth,
  u.email_confirmed,
  au.confirmed_at,
  CASE
    WHEN au.id IS NULL THEN '❌ NÃO EXISTE em auth.users'
    WHEN au.confirmed_at IS NULL THEN '⚠️ Email não confirmado em auth'
    WHEN p.email != au.email THEN '⚠️ Emails diferentes'
    ELSE '✅ OK'
  END as status
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
LEFT JOIN auth.users au ON au.id = u.auth_user_id
ORDER BY p.nome;

-- PASSO 3: Contar problemas
SELECT
  'Total de usuarios' as metrica,
  COUNT(*) as quantidade
FROM usuarios

UNION ALL

SELECT
  'Usuarios sem auth_user_id',
  COUNT(*)
FROM usuarios
WHERE auth_user_id IS NULL

UNION ALL

SELECT
  'Usuarios com auth_user_id inválido',
  COUNT(*)
FROM usuarios u
WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = u.auth_user_id)

UNION ALL

SELECT
  'Email diferente entre tabelas',
  COUNT(*)
FROM usuarios u
JOIN personas p ON p.id = u.pessoa_id
LEFT JOIN auth.users au ON au.id = u.auth_user_id
WHERE au.id IS NOT NULL AND p.email != au.email;

-- PASSO 4: Ver usuario specific (William)
SELECT
  u.id,
  u.auth_user_id,
  p.nome,
  p.email,
  u.email_confirmed,
  u.account_status,
  au.email as auth_email,
  au.confirmed_at,
  CASE
    WHEN au.id IS NULL THEN '❌ Não existe em auth.users'
    WHEN p.email != au.email THEN '❌ Email diferente'
    WHEN au.confirmed_at IS NULL THEN '❌ Email não confirmado em auth'
    ELSE '✅ Tudo OK - problema é a SENHA'
  END as diagnostico
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
LEFT JOIN auth.users au ON au.id = u.auth_user_id
WHERE LOWER(p.email) LIKE '%william%' OR LOWER(p.nome) LIKE '%william%';
