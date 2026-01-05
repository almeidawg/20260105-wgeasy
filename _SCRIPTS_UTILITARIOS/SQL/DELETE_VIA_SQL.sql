-- =====================================================
-- DELETAR VIA SQL (Contorna erro do Dashboard)
-- =====================================================

-- PASSO 1: Limpar referência em usuarios PRIMEIRO
UPDATE usuarios
SET auth_user_id = NULL
WHERE auth_user_id = '4ce0f848-d7ba-4a16-9fbc-586b3355920c';

-- PASSO 2: Agora deletar de auth.users
DELETE FROM auth.users
WHERE id = '4ce0f848-d7ba-4a16-9fbc-586b3355920c';

-- PASSO 3: Verificar se foi deletado
SELECT COUNT(*) as usuarios_com_email
FROM auth.users
WHERE email = 'darcio@dbadvogados.com.br';
-- Resultado: 0 (sucesso!)

-- Se resultado = 0, pode prosseguir com criação de novo usuário
