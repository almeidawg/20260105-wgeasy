-- ============================================================
-- Script: Vincular lançamentos OBRA PERDIZES e ELIANA ao cliente
--         ELIANA KIELLANDER LOPES
-- Data: 2026-01-08
-- ============================================================

-- 1. Buscar o cliente ELIANA KIELLANDER LOPES
SELECT id, nome, tipo, email
FROM pessoas
WHERE LOWER(nome) LIKE '%eliana%kiellander%'
   OR LOWER(nome) LIKE '%kiellander%'
ORDER BY nome;

-- 2. Verificar quantos lançamentos serão atualizados
SELECT
  COUNT(*) as total_lancamentos,
  SUM(valor_total) as valor_total
FROM financeiro_lancamentos
WHERE LOWER(descricao) LIKE '%perdizes%'
   OR LOWER(descricao) LIKE '%eliana%';

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
WHERE LOWER(l.descricao) LIKE '%perdizes%'
   OR LOWER(l.descricao) LIKE '%eliana%'
ORDER BY l.data_competencia DESC;

-- ============================================================
-- ATUALIZAÇÃO (EXECUTE ESTE BLOCO)
-- ============================================================
DO $$
DECLARE
  v_cliente_id UUID;
  v_count INTEGER;
BEGIN
  -- Buscar ID do cliente ELIANA KIELLANDER LOPES
  SELECT id INTO v_cliente_id
  FROM pessoas
  WHERE LOWER(nome) LIKE '%eliana%kiellander%'
     OR LOWER(nome) LIKE '%kiellander%lopes%'
  LIMIT 1;

  IF v_cliente_id IS NULL THEN
    RAISE EXCEPTION 'Cliente ELIANA KIELLANDER LOPES não encontrado!';
  END IF;

  RAISE NOTICE 'ID do cliente ELIANA KIELLANDER LOPES: %', v_cliente_id;

  -- Atualizar todos os lançamentos com PERDIZES ou ELIANA na descrição
  UPDATE financeiro_lancamentos
  SET
    cliente_centro_custo_id = v_cliente_id,
    updated_at = NOW()
  WHERE (LOWER(descricao) LIKE '%perdizes%' OR LOWER(descricao) LIKE '%eliana%')
    AND (cliente_centro_custo_id IS NULL OR cliente_centro_custo_id != v_cliente_id);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE '% lançamentos vinculados ao cliente ELIANA KIELLANDER LOPES', v_count;
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
WHERE LOWER(l.descricao) LIKE '%perdizes%'
   OR LOWER(l.descricao) LIKE '%eliana%'
ORDER BY l.data_competencia DESC;
