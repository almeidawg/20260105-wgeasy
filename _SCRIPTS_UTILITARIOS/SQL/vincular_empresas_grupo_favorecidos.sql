-- ============================================================
-- Script: Vincular Empresas do Grupo como Favorecidos
-- Cria cadastro em pessoas para cada empresa do grupo
-- Data: 2026-01-08
-- ============================================================

-- ============================================================
-- PARTE 1: VERIFICAR SITUACAO ATUAL
-- ============================================================
SELECT
  eg.id as empresa_grupo_id,
  eg.nome_fantasia,
  eg.razao_social,
  eg.cnpj,
  p.id as pessoa_id,
  p.nome as pessoa_nome,
  p.tipo as pessoa_tipo
FROM empresas_grupo eg
LEFT JOIN pessoas p ON p.cnpj = eg.cnpj
WHERE eg.ativo = true
ORDER BY eg.nome_fantasia;

-- ============================================================
-- PARTE 2: CRIAR/ATUALIZAR CADASTROS EM PESSOAS
-- ============================================================
DO $$
DECLARE
  emp RECORD;
  v_pessoa_id UUID;
  v_criados INTEGER := 0;
  v_atualizados INTEGER := 0;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Vinculando empresas do grupo como favorecidos...';
  RAISE NOTICE '========================================';

  FOR emp IN
    SELECT id, razao_social, nome_fantasia, cnpj
    FROM empresas_grupo
    WHERE ativo = true
    ORDER BY nome_fantasia
  LOOP
    -- Verificar se ja existe cadastro em pessoas com mesmo CNPJ
    SELECT id INTO v_pessoa_id
    FROM pessoas
    WHERE cnpj = emp.cnpj
    LIMIT 1;

    IF v_pessoa_id IS NULL THEN
      -- Criar novo cadastro como EMPRESA_GRUPO
      INSERT INTO pessoas (
        nome,
        tipo,
        cnpj,
        ativo,
        created_at,
        updated_at
      ) VALUES (
        COALESCE(NULLIF(emp.nome_fantasia, ''), emp.razao_social),
        'EMPRESA_GRUPO',
        emp.cnpj,
        true,
        NOW(),
        NOW()
      ) RETURNING id INTO v_pessoa_id;

      v_criados := v_criados + 1;
      RAISE NOTICE 'CRIADO: % (CNPJ: %) - ID: %',
        COALESCE(NULLIF(emp.nome_fantasia, ''), emp.razao_social),
        emp.cnpj,
        v_pessoa_id;
    ELSE
      -- Atualizar nome e tipo para EMPRESA_GRUPO
      UPDATE pessoas
      SET
        nome = COALESCE(NULLIF(emp.nome_fantasia, ''), emp.razao_social),
        tipo = 'EMPRESA_GRUPO',
        updated_at = NOW()
      WHERE id = v_pessoa_id;

      IF FOUND THEN
        v_atualizados := v_atualizados + 1;
        RAISE NOTICE 'ATUALIZADO: % - ID: %',
          COALESCE(NULLIF(emp.nome_fantasia, ''), emp.razao_social),
          v_pessoa_id;
      ELSE
        RAISE NOTICE 'JA EXISTE: % - ID: %',
          COALESCE(NULLIF(emp.nome_fantasia, ''), emp.razao_social),
          v_pessoa_id;
      END IF;
    END IF;
  END LOOP;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'CONCLUIDO!';
  RAISE NOTICE '  Criados: %', v_criados;
  RAISE NOTICE '  Atualizados: %', v_atualizados;
  RAISE NOTICE '========================================';
END $$;

-- ============================================================
-- VERIFICACAO FINAL
-- ============================================================
SELECT
  eg.nome_fantasia as empresa,
  eg.cnpj,
  p.id as pessoa_id,
  p.nome as favorecido_nome,
  p.tipo
FROM empresas_grupo eg
INNER JOIN pessoas p ON p.cnpj = eg.cnpj
WHERE eg.ativo = true
ORDER BY eg.nome_fantasia;
