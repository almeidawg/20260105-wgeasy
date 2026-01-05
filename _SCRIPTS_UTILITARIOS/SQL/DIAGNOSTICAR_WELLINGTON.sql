-- =====================================================
-- DIAGNOSTICAR WELLINGTON DE MELO DUARTE
-- Email: melowellyngton23@gmail.com
-- CPF: 113.326.754-84
-- =====================================================

-- PASSO 1: Ver dados em "usuarios"
SELECT
  u.id,
  p.nome,
  p.email,
  u.cpf,
  u.tipo_usuario,
  u.auth_user_id,
  u.email_confirmed,
  u.account_status,
  u.ativo
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
WHERE LOWER(p.email) = 'melowellyngton23@gmail.com'
OR LOWER(p.nome) LIKE '%wellington%';

-- PASSO 2: Ver se existe em auth.users
SELECT
  id,
  email,
  confirmed_at,
  created_at
FROM auth.users
WHERE email = 'melowellyngton23@gmail.com';

-- PASSO 3: Resumo
-- Se PASSO 1 retorna dados = usuario existe em "usuarios"
-- Se PASSO 2 retorna dados = usuario existe em "auth.users" (pode fazer login)
-- Se PASSO 2 está vazio = usuario NÃO existe em auth.users (precisa criar)
