-- ============================================================
-- MIGRATION: Ajustar notificacoes para referencias genericas
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-07 10:03:00
-- ============================================================

ALTER TABLE IF EXISTS notificacoes
  ADD COLUMN IF NOT EXISTS referencia_tipo TEXT,
  ADD COLUMN IF NOT EXISTS referencia_id UUID;
