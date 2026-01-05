-- =====================================================
-- LISTAR USUÁRIOS E STATUS DE LOGIN
-- =====================================================

-- Ver todos os usuários cadastrados em "usuarios"
SELECT
  u.id,
  p.nome,
  p.email,
  u.cpf,
  u.tipo_usuario,
  u.auth_user_id,
  CASE
    WHEN u.auth_user_id IS NULL THEN '❌ SEM LOGIN'
    WHEN EXISTS (SELECT 1 FROM auth.users au WHERE au.id = u.auth_user_id) THEN '✅ PODE FAZER LOGIN'
    ELSE '⚠️ auth_user_id inválido'
  END as status_login,
  u.email_confirmed,
  u.account_status,
  u.ativo
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
ORDER BY p.nome;

-- =====================================================
-- RESUMO
-- =====================================================

-- Contar quantos podem fazer login
SELECT
  'Total de usuários' as metrica,
  COUNT(*) as quantidade
FROM usuarios

UNION ALL

SELECT
  'Usuários SEM LOGIN (auth_user_id IS NULL)',
  COUNT(*)
FROM usuarios
WHERE auth_user_id IS NULL

UNION ALL

SELECT
  'Usuários COM LOGIN válido',
  COUNT(*)
FROM usuarios u
WHERE u.auth_user_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM auth.users au WHERE au.id = u.auth_user_id)

UNION ALL

SELECT
  'Usuários com email_confirmed=true',
  COUNT(*)
FROM usuarios
WHERE email_confirmed = true

UNION ALL

SELECT
  'Usuários com account_status=active',
  COUNT(*)
FROM usuarios
WHERE account_status = 'active';
