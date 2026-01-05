-- =====================================================
-- VERIFICAR USUÁRIO EM auth.users
-- Email: darcio@dbadvogados.com.br
-- =====================================================

-- Ver se existe em auth.users
SELECT
  id,
  email,
  confirmed_at,
  created_at,
  updated_at,
  CASE WHEN confirmed_at IS NOT NULL THEN '✅ Email confirmado'
       ELSE '❌ Email NÃO confirmado'
  END as status_confirmacao
FROM auth.users
WHERE email = 'darcio@dbadvogados.com.br';

-- Se o resultado mostrar um UUID, usuário existe
-- Se resultado estiver vazio, usuário NÃO existe em auth.users
