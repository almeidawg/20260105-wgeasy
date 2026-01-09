-- ============================================================
-- Script: Sincronizar Empresas do Grupo com tabela Pessoas
-- Para permitir usar empresas do grupo como Centro de Custo
-- Data: 2026-01-08
-- ============================================================

-- ============================================================
-- PARTE 1: VERIFICAR EMPRESAS DO GRUPO
-- ============================================================
SELECT
  eg.id as empresa_grupo_id,
  eg.razao_social,
  eg.nome_fantasia,
  eg.cnpj,
  p.id as pessoa_id,
  p.nome as pessoa_nome
FROM empresas_grupo eg
LEFT JOIN pessoas p ON p.cnpj = eg.cnpj OR LOWER(p.nome) LIKE '%' || LOWER(COALESCE(eg.nome_fantasia, eg.razao_social)) || '%'
WHERE eg.ativo = true
ORDER BY eg.nome_fantasia;

-- ============================================================
-- PARTE 2: CRIAR CADASTRO EM PESSOAS PARA EMPRESAS SEM
-- ============================================================
DO $$
DECLARE
  emp RECORD;
  v_pessoa_id UUID;
  v_count INTEGER := 0;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Sincronizando empresas do grupo com pessoas...';
  RAISE NOTICE '========================================';

  FOR emp IN
    SELECT id, razao_social, nome_fantasia, cnpj
    FROM empresas_grupo
    WHERE ativo = true
    ORDER BY nome_fantasia
  LOOP
    -- Verificar se já existe cadastro em pessoas com mesmo CNPJ
    SELECT id INTO v_pessoa_id
    FROM pessoas
    WHERE cnpj = emp.cnpj
    LIMIT 1;

    IF v_pessoa_id IS NULL THEN
      -- Verificar por nome similar
      SELECT id INTO v_pessoa_id
      FROM pessoas
      WHERE LOWER(nome) LIKE '%' || LOWER(COALESCE(emp.nome_fantasia, '')) || '%'
         OR LOWER(nome) LIKE '%' || LOWER(emp.razao_social) || '%'
      LIMIT 1;
    END IF;

    -- Se não existe, criar cadastro em pessoas
    IF v_pessoa_id IS NULL THEN
      INSERT INTO pessoas (
        nome,
        tipo,
        cnpj,
        ativo,
        created_at,
        updated_at
      ) VALUES (
        COALESCE(emp.nome_fantasia, emp.razao_social),
        'CLIENTE',
        emp.cnpj,
        true,
        NOW(),
        NOW()
      ) RETURNING id INTO v_pessoa_id;

      v_count := v_count + 1;
      RAISE NOTICE 'CRIADO: % (ID: %)', COALESCE(emp.nome_fantasia, emp.razao_social), v_pessoa_id;
    ELSE
      RAISE NOTICE 'JA EXISTE: % (ID: %)', COALESCE(emp.nome_fantasia, emp.razao_social), v_pessoa_id;
    END IF;
  END LOOP;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Sincronizacao concluida! % novos cadastros criados.', v_count;
  RAISE NOTICE '========================================';
END $$;

-- ============================================================
-- VERIFICACAO FINAL
-- ============================================================
SELECT
  eg.id as empresa_grupo_id,
  eg.nome_fantasia,
  eg.cnpj,
  p.id as pessoa_id,
  p.nome as pessoa_nome,
  p.tipo
FROM empresas_grupo eg
LEFT JOIN pessoas p ON p.cnpj = eg.cnpj
WHERE eg.ativo = true
ORDER BY eg.nome_fantasia;
