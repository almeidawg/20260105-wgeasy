-- =====================================================
-- DELETAR USUÁRIO DE auth.users (sem perder dados)
-- Email: darcio@dbadvogados.com.br
-- UUID: 4ce0f848-d7ba-4a16-9fbc-586b3355920c
-- =====================================================

-- PASSO 1: Ver o que vai ser deletado
SELECT
  id,
  email,
  created_at
FROM auth.users
WHERE id = '4ce0f848-d7ba-4a16-9fbc-586b3355920c';

-- PASSO 2: Limpar a referência em usuarios ANTES de deletar
UPDATE usuarios
SET auth_user_id = NULL
WHERE auth_user_id = '4ce0f848-d7ba-4a16-9fbc-586b3355920c';

-- PASSO 3: DELETAR o usuário de auth.users
-- ⚠️ AVISO: Isto é irreversível! Mas dados em "usuarios" não serão perdidos
DELETE FROM auth.users
WHERE id = '4ce0f848-d7ba-4a16-9fbc-586b3355920c';

-- PASSO 4: Verificar que foi deletado
SELECT COUNT(*) as usuarios_restantes
FROM auth.users
WHERE email = 'darcio@dbadvogados.com.br';

-- Resultado: 0 (significa que foi deletado com sucesso)
