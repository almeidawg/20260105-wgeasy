-- ============================================================
-- MIGRATION: Adicionar FK propostas.cliente_id -> pessoas.id
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-07
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'propostas'
      AND column_name = 'cliente_id'
  ) THEN
    ALTER TABLE public.propostas
      ADD COLUMN cliente_id UUID;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'propostas_cliente_id_fkey_pessoas'
      AND conrelid = 'public.propostas'::regclass
  ) THEN
    ALTER TABLE public.propostas
      ADD CONSTRAINT propostas_cliente_id_fkey_pessoas
      FOREIGN KEY (cliente_id) REFERENCES public.pessoas(id) ON DELETE SET NULL;
  END IF;
END $$;
