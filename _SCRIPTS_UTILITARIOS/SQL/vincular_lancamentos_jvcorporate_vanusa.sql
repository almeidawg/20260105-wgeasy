-- ============================================================
-- Script: Vincular lançamentos JVCORPORATE e VANUSA ao cliente JVCORPORATE LTDA
-- Data: 2026-01-08
-- Descrição: Atualiza o campo cliente_centro_custo_id dos lançamentos
--            que têm "JVCORPORATE" ou "VANUSA" na descrição
--            para vincular ao cliente JVCORPORATE LTDA
-- ============================================================

-- 1. Buscar o cliente JVCORPORATE LTDA
SELECT id, nome, tipo, email
FROM pessoas
WHERE LOWER(nome) LIKE '%jvcorporate%'
ORDER BY nome;

-- 2. Verificar quantos lançamentos serão atualizados
SELECT
  COUNT(*) as total_lancamentos,
  SUM(valor_total) as valor_total
FROM financeiro_lancamentos
WHERE LOWER(descricao) LIKE '%jvcorporate%'
   OR LOWER(descricao) LIKE '%vanusa%';

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
WHERE LOWER(l.descricao) LIKE '%jvcorporate%'
   OR LOWER(l.descricao) LIKE '%vanusa%'
ORDER BY l.data_competencia DESC;

-- ============================================================
-- ATUALIZAÇÃO (EXECUTE ESTE BLOCO)
-- ============================================================
DO $$
DECLARE
  v_jvcorporate_id UUID;
  v_count INTEGER;
BEGIN
  -- Buscar ID do cliente JVCORPORATE LTDA
  SELECT id INTO v_jvcorporate_id
  FROM pessoas
  WHERE LOWER(nome) LIKE '%jvcorporate%'
  LIMIT 1;

  IF v_jvcorporate_id IS NULL THEN
    RAISE EXCEPTION 'Cliente JVCORPORATE LTDA não encontrado!';
  END IF;

  RAISE NOTICE 'ID do cliente JVCORPORATE LTDA: %', v_jvcorporate_id;

  -- Atualizar todos os lançamentos com JVCORPORATE ou VANUSA na descrição
  UPDATE financeiro_lancamentos
  SET
    cliente_centro_custo_id = v_jvcorporate_id,
    updated_at = NOW()
  WHERE (LOWER(descricao) LIKE '%jvcorporate%' OR LOWER(descricao) LIKE '%vanusa%')
    AND (cliente_centro_custo_id IS NULL OR cliente_centro_custo_id != v_jvcorporate_id);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE '% lançamentos vinculados ao cliente JVCORPORATE LTDA', v_count;
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
WHERE LOWER(l.descricao) LIKE '%jvcorporate%'
   OR LOWER(l.descricao) LIKE '%vanusa%'
ORDER BY l.data_competencia DESC;
