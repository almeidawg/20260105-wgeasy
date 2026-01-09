-- ============================================================
-- Script: Mesclar 3 núcleos em 1 para W.G. DESIGNER DE INTERIORES
-- IDs a mesclar:
--   b6bb3ce2-c801-466f-a560-2826e345964e
--   3d1ffba1-eb6f-4e3f-8c98-a45762bb67f1
--   84c50071-f328-4561-ac42-a1e89d34e925
-- Data: 2026-01-08
-- ============================================================

-- ============================================================
-- PARTE 1: VERIFICAR OS 3 NÚCLEOS
-- ============================================================
SELECT * FROM nucleos
WHERE id IN (
  'b6bb3ce2-c801-466f-a560-2826e345964e',
  '3d1ffba1-eb6f-4e3f-8c98-a45762bb67f1',
  '84c50071-f328-4561-ac42-a1e89d34e925'
);

-- ============================================================
-- PARTE 2: MESCLAR NÚCLEOS E VINCULAR À EMPRESA
-- ============================================================
DO $$
DECLARE
  v_principal_id UUID := 'b6bb3ce2-c801-466f-a560-2826e345964e'; -- Núcleo principal (primeiro)
  v_duplicado1_id UUID := '3d1ffba1-eb6f-4e3f-8c98-a45762bb67f1';
  v_duplicado2_id UUID := '84c50071-f328-4561-ac42-a1e89d34e925';
  v_empresa_id UUID := 'c2c4e93d-3911-46de-b02b-7ed10f2b61e2'; -- W.G. DESIGNER DE INTERIORES
BEGIN
  RAISE NOTICE 'Núcleo PRINCIPAL: %', v_principal_id;

  -- ========================================
  -- 1. MIGRAR REFERÊNCIAS DOS DUPLICADOS
  -- ========================================
  RAISE NOTICE 'Migrando referências dos núcleos duplicados...';

  -- Migrar empresas_grupo
  UPDATE empresas_grupo
  SET nucleo_id = v_principal_id
  WHERE nucleo_id IN (v_duplicado1_id, v_duplicado2_id);

  -- Excluir precificacao_nucleos dos duplicados (nucleo_id é UNIQUE)
  DELETE FROM precificacao_nucleos
  WHERE nucleo_id IN (v_duplicado1_id, v_duplicado2_id);

  RAISE NOTICE 'Referências migradas para núcleo principal';

  -- ========================================
  -- 3. EXCLUIR NÚCLEOS DUPLICADOS
  -- ========================================
  DELETE FROM nucleos
  WHERE id IN (v_duplicado1_id, v_duplicado2_id);

  RAISE NOTICE 'Núcleos % e % excluídos', v_duplicado1_id, v_duplicado2_id;

  -- ========================================
  -- 4. ATUALIZAR NÚCLEO PRINCIPAL
  -- ========================================
  UPDATE nucleos
  SET nome = 'WG Designer de Interiores'
  WHERE id = v_principal_id;

  RAISE NOTICE 'Núcleo principal atualizado para: WG Designer de Interiores';

  -- ========================================
  -- 5. VINCULAR EMPRESA AO NÚCLEO
  -- ========================================
  UPDATE empresas_grupo
  SET nucleo_id = v_principal_id
  WHERE id = v_empresa_id;

  RAISE NOTICE 'Empresa W.G. DESIGNER DE INTERIORES vinculada ao núcleo %', v_principal_id;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'MESCLAGEM CONCLUÍDA!';
END $$;

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================

-- Verificar núcleos
SELECT id, nome, ativo FROM nucleos
WHERE id IN (
  'b6bb3ce2-c801-466f-a560-2826e345964e',
  '3d1ffba1-eb6f-4e3f-8c98-a45762bb67f1',
  '84c50071-f328-4561-ac42-a1e89d34e925'
);

-- Verificar empresa
SELECT id, razao_social, nome_fantasia, nucleo_id
FROM empresas_grupo
WHERE id = 'c2c4e93d-3911-46de-b02b-7ed10f2b61e2';
