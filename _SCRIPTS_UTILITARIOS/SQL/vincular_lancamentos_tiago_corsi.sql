-- ============================================================
-- Script: Vincular lançamentos MAIRARÊ / TIAGO CORSI
-- Termos de busca: mairare, mairarê, tiago corsi
-- Centro de Custo: Cliente TIAGO CORSI
-- Data: 2026-01-08
-- ============================================================

-- ============================================================
-- PARTE 1: VERIFICAR CLIENTE TIAGO CORSI
-- ============================================================
SELECT id, nome, tipo, email, ativo
FROM pessoas
WHERE LOWER(nome) LIKE '%tiago%corsi%'
   OR LOWER(nome) LIKE '%corsi%'
ORDER BY nome;

-- ============================================================
-- PARTE 2: VERIFICAR LANÇAMENTOS
-- ============================================================
SELECT
  COUNT(*) as total_lancamentos,
  SUM(valor_total) as valor_total
FROM financeiro_lancamentos
WHERE LOWER(descricao) LIKE '%mairare%'
   OR LOWER(descricao) LIKE '%mairarê%'
   OR LOWER(descricao) LIKE '%tiago%corsi%';

-- Visualizar os lançamentos
SELECT
  l.id,
  l.descricao,
  l.valor_total,
  l.tipo,
  l.status,
  cc.nome as centro_custo_atual
FROM financeiro_lancamentos l
LEFT JOIN pessoas cc ON cc.id = l.cliente_centro_custo_id
WHERE LOWER(l.descricao) LIKE '%mairare%'
   OR LOWER(l.descricao) LIKE '%mairarê%'
   OR LOWER(l.descricao) LIKE '%tiago%corsi%'
ORDER BY l.data_competencia DESC;

-- ============================================================
-- PARTE 3: VINCULAR LANÇAMENTOS
-- ============================================================
DO $$
DECLARE
  v_cliente_id UUID;
  v_count INTEGER;
BEGIN
  -- Buscar ID do cliente TIAGO CORSI
  SELECT id INTO v_cliente_id
  FROM pessoas
  WHERE LOWER(nome) LIKE '%tiago%corsi%'
  LIMIT 1;

  IF v_cliente_id IS NULL THEN
    RAISE EXCEPTION 'Cliente TIAGO CORSI não encontrado!';
  END IF;

  RAISE NOTICE 'ID do cliente TIAGO CORSI: %', v_cliente_id;

  -- Atualizar lançamentos
  UPDATE financeiro_lancamentos
  SET
    cliente_centro_custo_id = v_cliente_id,
    updated_at = NOW()
  WHERE (
      LOWER(descricao) LIKE '%mairare%'
      OR LOWER(descricao) LIKE '%mairarê%'
      OR LOWER(descricao) LIKE '%tiago%corsi%'
    )
    AND (cliente_centro_custo_id IS NULL OR cliente_centro_custo_id != v_cliente_id);

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE '% lançamentos vinculados ao cliente TIAGO CORSI', v_count;
END $$;

-- ============================================================
-- PARTE 4: VERIFICAÇÃO FINAL
-- ============================================================
SELECT
  l.id,
  l.descricao,
  l.valor_total,
  l.tipo,
  cc.nome as cliente_centro_custo
FROM financeiro_lancamentos l
LEFT JOIN pessoas cc ON cc.id = l.cliente_centro_custo_id
WHERE LOWER(l.descricao) LIKE '%mairare%'
   OR LOWER(l.descricao) LIKE '%mairarê%'
   OR LOWER(l.descricao) LIKE '%tiago%corsi%'
ORDER BY l.data_competencia DESC;
