-- ============================================================
-- Script: Vincular lançamentos GCEG
-- Centro de Custo: WG REFORMAS (empresa do grupo)
-- Favorecido: CRUZ E GOMES CONTABILIDADE
-- Categoria: CONTABILIDADE (criar se não existir)
-- Data: 2026-01-08
-- ============================================================

-- ============================================================
-- PARTE 1: VERIFICAR LANÇAMENTOS COM GCEG
-- ============================================================
SELECT
  l.id,
  l.descricao,
  l.valor_total,
  l.tipo,
  l.status,
  l.categoria_id,
  cat.name as categoria_atual,
  cc.nome as centro_custo_atual,
  fav.nome as favorecido_atual
FROM financeiro_lancamentos l
LEFT JOIN fin_categories cat ON cat.id = l.categoria_id
LEFT JOIN pessoas cc ON cc.id = l.cliente_centro_custo_id
LEFT JOIN pessoas fav ON fav.id = l.pessoa_id
WHERE LOWER(l.descricao) LIKE '%gceg%'
ORDER BY l.data_competencia DESC;

-- ============================================================
-- PARTE 2: VERIFICAR/CRIAR CATEGORIA CONTABILIDADE
-- ============================================================

-- 2.1 Verificar se categoria existe
SELECT id, name, kind FROM fin_categories
WHERE LOWER(name) LIKE '%contabilidade%';

-- ============================================================
-- PARTE 3: VERIFICAR CADASTROS NECESSÁRIOS
-- ============================================================

-- 3.1 Buscar WG REFORMAS (centro de custo)
SELECT id, nome, tipo FROM pessoas
WHERE LOWER(nome) LIKE '%wg%reforma%'
   OR LOWER(nome) LIKE '%wg almeida reforma%';

-- 3.2 Buscar CRUZ E GOMES (favorecido)
SELECT id, nome, tipo FROM pessoas
WHERE LOWER(nome) LIKE '%cruz%gomes%'
   OR LOWER(nome) LIKE '%contabilidade%';

-- ============================================================
-- PARTE 4: CRIAR CATEGORIA E VINCULAR LANÇAMENTOS
-- ============================================================
DO $$
DECLARE
  v_categoria_id UUID;
  v_wg_reformas_id UUID;
  v_cruz_gomes_id UUID;
  v_count INTEGER;
BEGIN
  -- ========================================
  -- 1. CRIAR/BUSCAR CATEGORIA CONTABILIDADE
  -- ========================================
  SELECT id INTO v_categoria_id
  FROM fin_categories
  WHERE LOWER(name) = 'contabilidade'
  LIMIT 1;

  IF v_categoria_id IS NULL THEN
    INSERT INTO fin_categories (
      name,
      kind,
      ordem,
      ativo,
      created_at,
      updated_at
    ) VALUES (
      'Contabilidade',
      'expense',
      100,
      true,
      NOW(),
      NOW()
    ) RETURNING id INTO v_categoria_id;

    RAISE NOTICE 'Categoria CONTABILIDADE criada: %', v_categoria_id;
  ELSE
    RAISE NOTICE 'Categoria CONTABILIDADE já existe: %', v_categoria_id;
  END IF;

  -- ========================================
  -- 2. BUSCAR WG REFORMAS (centro de custo)
  -- ========================================
  SELECT id INTO v_wg_reformas_id
  FROM pessoas
  WHERE LOWER(nome) LIKE '%wg almeida reforma%'
     OR LOWER(nome) LIKE '%wg reformas%'
  LIMIT 1;

  IF v_wg_reformas_id IS NULL THEN
    -- Criar cadastro WG REFORMAS se não existir (tipo CLIENTE para empresa do grupo)
    INSERT INTO pessoas (
      nome,
      tipo,
      ativo,
      created_at,
      updated_at
    ) VALUES (
      'WG ALMEIDA REFORMAS ESPECIALIZADAS LTDA',
      'CLIENTE',
      true,
      NOW(),
      NOW()
    ) RETURNING id INTO v_wg_reformas_id;

    RAISE NOTICE 'Cadastro WG REFORMAS criado: %', v_wg_reformas_id;
  ELSE
    RAISE NOTICE 'WG REFORMAS encontrado: %', v_wg_reformas_id;
  END IF;

  -- ========================================
  -- 3. BUSCAR/CRIAR CRUZ E GOMES (favorecido)
  -- ========================================
  SELECT id INTO v_cruz_gomes_id
  FROM pessoas
  WHERE LOWER(nome) LIKE '%cruz%gomes%'
  LIMIT 1;

  IF v_cruz_gomes_id IS NULL THEN
    -- Criar cadastro CRUZ E GOMES se não existir
    INSERT INTO pessoas (
      nome,
      tipo,
      ativo,
      created_at,
      updated_at
    ) VALUES (
      'CRUZ E GOMES CONTABILIDADE',
      'FORNECEDOR',
      true,
      NOW(),
      NOW()
    ) RETURNING id INTO v_cruz_gomes_id;

    RAISE NOTICE 'Cadastro CRUZ E GOMES CONTABILIDADE criado: %', v_cruz_gomes_id;
  ELSE
    RAISE NOTICE 'CRUZ E GOMES encontrado: %', v_cruz_gomes_id;
  END IF;

  -- ========================================
  -- 4. ATUALIZAR LANÇAMENTOS COM GCEG
  -- ========================================
  UPDATE financeiro_lancamentos
  SET
    categoria_id = v_categoria_id,
    cliente_centro_custo_id = v_wg_reformas_id,
    pessoa_id = v_cruz_gomes_id,
    updated_at = NOW()
  WHERE LOWER(descricao) LIKE '%gceg%';

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'VINCULAÇÃO CONCLUÍDA!';
  RAISE NOTICE '% lançamentos atualizados:', v_count;
  RAISE NOTICE '  - Categoria: CONTABILIDADE';
  RAISE NOTICE '  - Centro de Custo: WG REFORMAS';
  RAISE NOTICE '  - Favorecido: CRUZ E GOMES CONTABILIDADE';
END $$;

-- ============================================================
-- PARTE 5: VERIFICAÇÃO FINAL
-- ============================================================
SELECT
  l.id,
  l.descricao,
  l.valor_total,
  l.tipo,
  cat.name as categoria,
  cc.nome as centro_custo,
  fav.nome as favorecido
FROM financeiro_lancamentos l
LEFT JOIN fin_categories cat ON cat.id = l.categoria_id
LEFT JOIN pessoas cc ON cc.id = l.cliente_centro_custo_id
LEFT JOIN pessoas fav ON fav.id = l.pessoa_id
WHERE LOWER(l.descricao) LIKE '%gceg%'
ORDER BY l.data_competencia DESC;
