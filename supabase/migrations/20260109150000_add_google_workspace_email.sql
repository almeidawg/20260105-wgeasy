-- ============================================================
-- Migration: Adicionar campo google_workspace_email
-- Sistema WG Easy - Grupo WG Almeida
-- ============================================================
-- Permite que cada usuário tenha seu próprio email do Google Workspace
-- para integração com Calendar e Keep
-- ============================================================

-- Adicionar campo google_workspace_email na tabela usuarios
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS google_workspace_email TEXT;

-- Comentário explicativo
COMMENT ON COLUMN usuarios.google_workspace_email IS 'Email do Google Workspace para integração com Calendar/Keep (Domain-wide Delegation)';

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_usuarios_google_workspace_email
ON usuarios (google_workspace_email)
WHERE google_workspace_email IS NOT NULL;
