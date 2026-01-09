-- ============================================================
-- Script: Vincular lançamentos RAFAEL LACERDA ao cliente
-- Data: 2026-01-08
-- ============================================================

-- 1. Buscar o cliente RAFAEL LACERDA
SELECT id, nome, tipo, email
FROM pessoas
WHERE LOWER(nome) LIKE '%rafael%lacerda%'
   OR LOWER(nome) LIKE '%lacerda%rafael%'
ORDER BY nome;

-- 2. Verificar quantos lançamentos serão atualizados
SELECT
  COUNT(*) as total_lancamentos,
  SUM(valor_total) as valor_total
FROM financeiro_lancamentos
WHERE LOWER(descricao) LIKE '%rafael%lacerda%'
   OR LOWER(descricao) LIKE '%lacerda%rafael%'
   OR (LOWER(descricao) LIKE '%rafael%' AND LOWER(descricao) LIKE '%lacerda%');

-- 3. Visualizar os lançamentos que serão atualizados
SELECT
  l.id,
  l.descricao,
  l.valor_total,
  l.tipo,
  l.status,
  l.data_competencia,
  cc.nome as centro_custo_atual
FROM financeiro_lancamentos l
LEFT JOIN pessoas cc ON cc.id = l.cliente_centro_custo_id
WHERE LOWER(l.descricao) LIKE '%rafael%lacerda%'
   OR LOWER(l.descricao) LIKE '%lacerda%rafael%'
   OR (LOWER(l.descricao) LIKE '%rafael%' AND LOWER(l.descricao) LIKE '%lacerda%')
ORDER BY l.data_competencia DESC;

-- ============================================================
-- ATUALIZAÇÃO (EXECUTE ESTE BLOCO)
-- ============================================================
DO $$
DECLARE
  v_cliente_id UUID;
  v_count INTEGER;
BEGIN
  -- Buscar ID do cliente RAFAEL LACERDA
  SELECT id INTO v_cliente_id
  FROM pessoas
  WHERE LOWER(nome) LIKE '%rafael%lacerda%'
     OR LOWER(nome) LIKE '%lacerda%rafael%'
  LIMIT 1;

  IF v_cliente_id IS NULL THEN
    RAISE EXCEPTION 'Cliente RAFAEL LACERDA não encontrado!';
  END IF;

  RAISE NOTICE 'ID do cliente RAFAEL LACERDA: %', v_cliente_id;

  -- Atualizar todos os lançamentos
  UPDATE financeiro_lancamentos
  SET
    cliente_centro_custo_id = v_cliente_id,
    updated_at = NOW()
  WHERE (
      LOWER(descricao) LIKE '%rafael%lacerda%'
      OR LOWER(descricao) LIKE '%lacerda%rafael%'
      OR (LOWER(descricao) LIKE '%rafael%' AND LOWER(descricao) LIKE '%lacerda%')
    )
    AND (cliente_centro_custo_id IS NULL OR cliente_centro_custo_id != v_cliente_id);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE '% lançamentos vinculados ao cliente RAFAEL LACERDA', v_count;
END $$;

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================
SELECT
  l.id,
  l.descricao,
  l.valor_total,
  l.tipo,
  cc.nome as cliente_centro_custo
FROM financeiro_lancamentos l
LEFT JOIN pessoas cc ON cc.id = l.cliente_centro_custo_id
WHERE LOWER(l.descricao) LIKE '%rafael%lacerda%'
   OR LOWER(l.descricao) LIKE '%lacerda%rafael%'
   OR (LOWER(l.descricao) LIKE '%rafael%' AND LOWER(l.descricao) LIKE '%lacerda%')
ORDER BY l.data_competencia DESC;
