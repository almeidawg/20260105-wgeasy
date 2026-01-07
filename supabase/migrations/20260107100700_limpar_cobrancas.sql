-- ============================================================================
-- MIGRAÇÃO: Limpar Cobranças
-- Data: 2026-01-07
-- Descrição: Remove todas as cobranças para permitir exclusão de contratos
-- ============================================================================

-- Limpar cobranças
DELETE FROM cobrancas;
