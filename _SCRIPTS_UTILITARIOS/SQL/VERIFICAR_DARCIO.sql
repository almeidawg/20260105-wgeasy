-- =====================================================
-- VERIFICAR E CRIAR USUÁRIO EM SUPABASE AUTH
-- Usuário: DARCIO CANDIDO BARBOSA
-- Email: darcio@dbadvogados.com.br
-- =====================================================

-- PASSO 1: Ver se existe em auth.users
SELECT
  id,
  email,
  confirmed_at,
  created_at
FROM auth.users
WHERE email = 'darcio@dbadvogados.com.br';

-- PASSO 2: Ver dados em usuarios table
SELECT
  u.id,
  u.auth_user_id,
  p.nome,
  p.email,
  u.tipo_usuario,
  u.email_confirmed,
  u.account_status
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
WHERE LOWER(p.email) = 'darcio@dbadvogados.com.br'
OR LOWER(p.nome) LIKE '%darcio%';

-- PASSO 3: Comparar
-- Se PASSO 1 retornar NADA = usuário não existe em auth.users
-- Se PASSO 2 retornar dados = usuário existe em usuarios mas não em auth

-- SOLUÇÃO: Se usuário não existe em auth.users, precisa ser criado
-- Mas AVISO: Não é possível SET senha via SQL no Supabase
-- Solução: Usar "Reset Password" ou criar via API

-- PASSO 4: Se auth_user_id está NULL em usuarios, precisa atualizar
SELECT
  u.id as usuario_id,
  u.auth_user_id,
  p.email,
  'auth_user_id é NULL' as problema
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
WHERE LOWER(p.email) = 'darcio@dbadvogados.com.br'
AND u.auth_user_id IS NULL;
