-- ============================================================
-- Migration: Configurar emails do Google Workspace por usuário
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-09
-- ============================================================
-- Configura o google_workspace_email para cada usuário do sistema
-- permitindo que cada um acesse seu próprio Calendar e Keep
-- ============================================================

-- Julia Baeta (Admin)
UPDATE usuarios u
SET google_workspace_email = 'julia.baeta@wgalmeida.com.br'
FROM pessoas p
WHERE u.pessoa_id = p.id
  AND LOWER(p.nome) LIKE '%julia%baeta%'
  AND u.google_workspace_email IS NULL;

-- Rafael de Souza Lacerda (CEO/Master)
UPDATE usuarios u
SET google_workspace_email = 'rafael@wgalmeida.com.br'
FROM pessoas p
WHERE u.pessoa_id = p.id
  AND LOWER(p.nome) LIKE '%rafael%lacerda%'
  AND u.google_workspace_email IS NULL;

-- William (se existir)
UPDATE usuarios u
SET google_workspace_email = 'william@wgalmeida.com.br'
FROM pessoas p
WHERE u.pessoa_id = p.id
  AND LOWER(p.nome) LIKE '%william%'
  AND u.google_workspace_email IS NULL;

-- ============================================================
-- Auto-configurar usuários com email do domínio @wgalmeida.com.br
-- ============================================================
-- Para usuários que ainda não têm google_workspace_email configurado,
-- usar o email da pessoa se for do domínio wgalmeida.com.br
UPDATE usuarios u
SET google_workspace_email = p.email
FROM pessoas p
WHERE u.pessoa_id = p.id
  AND u.google_workspace_email IS NULL
  AND p.email LIKE '%@wgalmeida.com.br';

-- ============================================================
-- Verificação: Listar usuários com google_workspace_email configurado
-- ============================================================
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM usuarios
  WHERE google_workspace_email IS NOT NULL;

  RAISE NOTICE '% usuários com google_workspace_email configurado', v_count;
END $$;
