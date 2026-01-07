-- ============================================================
-- MIGRATION: Garantir FK contratos.cliente_id -> pessoas.id
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-07
-- ============================================================

DO $$
BEGIN
  IF to_regclass('public.contratos') IS NOT NULL
    AND to_regclass('public.pessoas') IS NOT NULL
  THEN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'contratos'
        AND column_name = 'cliente_id'
    ) THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_contratos_cliente'
          AND conrelid = 'public.contratos'::regclass
      ) THEN
        ALTER TABLE public.contratos
          ADD CONSTRAINT fk_contratos_cliente
          FOREIGN KEY (cliente_id) REFERENCES public.pessoas(id) ON DELETE SET NULL;
      END IF;
    END IF;
  END IF;
END $$;

