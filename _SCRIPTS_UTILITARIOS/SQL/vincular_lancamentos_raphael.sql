-- ============================================================
-- Script: Vincular lançamentos RAPHAEL ao cliente
--         RAPHAEL HENRIQUE PINTO PIRES
-- Data: 2026-01-08
-- ============================================================

-- 1. Buscar o cliente RAPHAEL HENRIQUE PINTO PIRES
SELECT id, nome, tipo, email
FROM pessoas
WHERE LOWER(nome) LIKE '%raphael%henrique%'
   OR LOWER(nome) LIKE '%raphael%pinto%'
   OR LOWER(nome) LIKE '%raphael%pires%'
ORDER BY nome;

-- 2. Verificar quantos lançamentos serão atualizados
SELECT
  COUNT(*) as total_lancamentos,
  SUM(valor_total) as valor_total
FROM financeiro_lancamentos
WHERE LOWER(descricao) LIKE '%raphael%';

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
WHERE LOWER(l.descricao) LIKE '%raphael%'
ORDER BY l.data_competencia DESC;

-- ============================================================
-- ATUALIZAÇÃO (EXECUTE ESTE BLOCO)
-- ============================================================
DO $$
DECLARE
  v_cliente_id UUID;
  v_count INTEGER;
BEGIN
  -- Buscar ID do cliente RAPHAEL HENRIQUE PINTO PIRES
  SELECT id INTO v_cliente_id
  FROM pessoas
  WHERE LOWER(nome) LIKE '%raphael%henrique%'
     OR LOWER(nome) LIKE '%raphael%pinto%pires%'
  LIMIT 1;

  IF v_cliente_id IS NULL THEN
    RAISE EXCEPTION 'Cliente RAPHAEL HENRIQUE PINTO PIRES não encontrado!';
  END IF;

  RAISE NOTICE 'ID do cliente RAPHAEL HENRIQUE PINTO PIRES: %', v_cliente_id;

  -- Atualizar todos os lançamentos com RAPHAEL na descrição
  UPDATE financeiro_lancamentos
  SET
    cliente_centro_custo_id = v_cliente_id,
    updated_at = NOW()
  WHERE LOWER(descricao) LIKE '%raphael%'
    AND (cliente_centro_custo_id IS NULL OR cliente_centro_custo_id != v_cliente_id);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE '% lançamentos vinculados ao cliente RAPHAEL HENRIQUE PINTO PIRES', v_count;
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
WHERE LOWER(l.descricao) LIKE '%raphael%'
ORDER BY l.data_competencia DESC;
