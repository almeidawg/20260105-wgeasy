-- ============================================================
-- CORREÇÕES DO SCHEMA WG EASY
-- Data: 07/01/2026
-- Descrição: Correções críticas para evitar erros em futuros deploys
-- ============================================================

-- ============================================================
-- 1. TRIGGER contratos_preencher_campos
-- Corrige campos que não existem na tabela contratos
-- ============================================================

CREATE OR REPLACE FUNCTION public.contratos_preencher_campos()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Usar numero_contrato ao invés de numero
  IF NEW.numero_contrato IS NULL OR NEW.numero_contrato = '' THEN
    NEW.numero_contrato := contratos_gerar_numero();
  END IF;

  -- Usar previsao_inicio e dias_uteis ao invés de data_inicio e duracao_dias_uteis
  IF NEW.previsao_inicio IS NOT NULL AND NEW.dias_uteis IS NOT NULL THEN
    NEW.previsao_termino := contratos_calcular_data_termino(
      NEW.previsao_inicio,
      NEW.dias_uteis
    );
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$function$;

-- ============================================================
-- 2. FK contratos_nucleos_oportunidade_id_fkey
-- Corrige FK apontando para schema arquivado
-- ============================================================

DO $$
BEGIN
  -- Remove FK antiga se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'contratos_nucleos_oportunidade_id_fkey'
  ) THEN
    ALTER TABLE contratos_nucleos DROP CONSTRAINT contratos_nucleos_oportunidade_id_fkey;
  END IF;

  -- Cria FK apontando para public.oportunidades
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'contratos_nucleos_oportunidade_id_fkey'
    AND table_name = 'contratos_nucleos'
  ) THEN
    ALTER TABLE contratos_nucleos
    ADD CONSTRAINT contratos_nucleos_oportunidade_id_fkey
    FOREIGN KEY (oportunidade_id) REFERENCES public.oportunidades(id);
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'FK contratos_nucleos_oportunidade_id_fkey: %', SQLERRM;
END $$;

-- ============================================================
-- 3. FKs da tabela tasks
-- Remove/corrige FKs apontando para schema arquivado
-- ============================================================

DO $$
BEGIN
  -- Remove FK tasks_project_id_fkey se apontar para schema errado
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_name = 'tasks_project_id_fkey'
    AND ccu.table_schema LIKE 'z_archive%'
  ) THEN
    ALTER TABLE tasks DROP CONSTRAINT tasks_project_id_fkey;
    RAISE NOTICE 'FK tasks_project_id_fkey removida (apontava para schema arquivado)';
  END IF;

  -- Remove FK tasks_project_item_id_fkey se apontar para schema errado
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_name = 'tasks_project_item_id_fkey'
    AND ccu.table_schema LIKE 'z_archive%'
  ) THEN
    ALTER TABLE tasks DROP CONSTRAINT tasks_project_item_id_fkey;
    RAISE NOTICE 'FK tasks_project_item_id_fkey removida (apontava para schema arquivado)';
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'FKs tasks: %', SQLERRM;
END $$;

-- ============================================================
-- 4. VERIFICAÇÃO FINAL
-- Lista FKs que ainda apontam para schemas arquivados
-- ============================================================

DO $$
DECLARE
  fk_record RECORD;
  has_issues BOOLEAN := FALSE;
BEGIN
  FOR fk_record IN
    SELECT
      tc.table_name,
      tc.constraint_name,
      ccu.table_name AS foreign_table,
      ccu.table_schema AS foreign_schema
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_schema LIKE 'z_archive%'
  LOOP
    has_issues := TRUE;
    RAISE WARNING 'FK quebrada: %.% -> %.%',
      fk_record.table_name,
      fk_record.constraint_name,
      fk_record.foreign_schema,
      fk_record.foreign_table;
  END LOOP;

  IF NOT has_issues THEN
    RAISE NOTICE 'Nenhuma FK apontando para schema arquivado. Schema OK!';
  END IF;
END $$;

-- ============================================================
-- FIM DAS CORREÇÕES
-- ============================================================
