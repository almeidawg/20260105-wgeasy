-- =====================================================
-- ATIVAR TODOS OS USUÁRIOS PARA LOGIN
-- Data: 2 de Janeiro, 2026
-- =====================================================

-- PASSO 1: Ver estado atual dos usuários
SELECT
  COUNT(*) as total_usuarios,
  SUM(CASE WHEN email_confirmed = false THEN 1 ELSE 0 END) as bloqueados_email,
  SUM(CASE WHEN account_status != 'active' THEN 1 ELSE 0 END) as bloqueados_status,
  SUM(CASE WHEN email_confirmed = true AND account_status = 'active' THEN 1 ELSE 0 END) as pode_fazer_login
FROM usuarios;

-- PASSO 2: Ativar todos os usuários
UPDATE usuarios
SET
  email_confirmed = true,
  account_status = 'active',
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  atualizado_em = now()
WHERE
  email_confirmed = false
  OR account_status != 'active';

-- PASSO 3: Verificar que funcionou
SELECT
  COUNT(*) as total_usuarios,
  SUM(CASE WHEN email_confirmed = true THEN 1 ELSE 0 END) as agora_confirmados,
  SUM(CASE WHEN account_status = 'active' THEN 1 ELSE 0 END) as agora_ativos
FROM usuarios;

-- PASSO 4: Listar usuários que agora podem fazer login
SELECT
  p.nome,
  p.email,
  u.cpf,
  u.tipo_usuario,
  u.ativo,
  u.email_confirmed,
  u.account_status
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
WHERE u.email_confirmed = true AND u.account_status = 'active'
ORDER BY p.nome;
