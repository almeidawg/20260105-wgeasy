-- ============================================================
-- Script: Vincular lançamentos com "Sara" na descrição à cliente Sara
-- Data: 2026-01-08
-- Descrição: Atualiza o campo cliente_centro_custo_id dos lançamentos
--            que têm "Sara" na descrição para vincular à cliente Sara
-- ============================================================

-- 1. Verificar quantos lançamentos têm "Sara" na descrição
SELECT
  COUNT(*) as total_lancamentos,
  SUM(valor_total) as valor_total
FROM financeiro_lancamentos
WHERE LOWER(descricao) LIKE '%sara%';

-- 2. Buscar a cliente Sara (para confirmar o ID)
SELECT id, nome, tipo, email
FROM pessoas
WHERE LOWER(nome) LIKE '%sara%'
  AND tipo = 'CLIENTE'
ORDER BY nome;

-- 3. Visualizar os lançamentos que serão atualizados (ANTES)
SELECT
  l.id,
  l.numero,
  l.descricao,
  l.valor_total,
  l.tipo,
  l.status,
  l.data_competencia,
  l.cliente_centro_custo_id,
  cc.nome as cliente_centro_custo_atual
FROM financeiro_lancamentos l
LEFT JOIN pessoas cc ON cc.id = l.cliente_centro_custo_id
WHERE LOWER(l.descricao) LIKE '%sara%'
ORDER BY l.data_competencia DESC;

-- ============================================================
-- 4. ATUALIZAR OS LANÇAMENTOS
-- ============================================================
-- DESCOMENTE O BLOCO ABAIXO PARA EXECUTAR A ATUALIZAÇÃO
-- Substitua 'ID_DA_CLIENTE_SARA' pelo ID real encontrado no passo 2

/*
DO $$
DECLARE
  v_sara_id UUID;
  v_count INTEGER;
BEGIN
  -- Buscar ID da cliente Sara (ajuste o nome se necessário)
  SELECT id INTO v_sara_id
  FROM pessoas
  WHERE LOWER(nome) LIKE '%sara%'
    AND tipo = 'CLIENTE'
  LIMIT 1;

  IF v_sara_id IS NULL THEN
    RAISE EXCEPTION 'Cliente Sara não encontrada!';
  END IF;

  RAISE NOTICE 'ID da cliente Sara: %', v_sara_id;

  -- Atualizar os lançamentos
  UPDATE financeiro_lancamentos
  SET
    cliente_centro_custo_id = v_sara_id,
    updated_at = NOW()
  WHERE LOWER(descricao) LIKE '%sara%'
    AND (cliente_centro_custo_id IS NULL OR cliente_centro_custo_id != v_sara_id);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE '% lançamentos atualizados', v_count;
END $$;
*/

-- ============================================================
-- 5. VERSÃO DIRETA (se você já sabe o ID da Sara)
-- ============================================================
-- Substitua 'SEU_ID_AQUI' pelo UUID da cliente Sara

/*
UPDATE financeiro_lancamentos
SET
  cliente_centro_custo_id = 'SEU_ID_AQUI'::uuid,
  updated_at = NOW()
WHERE LOWER(descricao) LIKE '%sara%'
  AND (cliente_centro_custo_id IS NULL OR cliente_centro_custo_id != 'SEU_ID_AQUI'::uuid);
*/

-- 6. Verificar resultado (DEPOIS)
-- Execute após a atualização para confirmar
/*
SELECT
  l.id,
  l.numero,
  l.descricao,
  l.valor_total,
  l.tipo,
  l.cliente_centro_custo_id,
  cc.nome as cliente_centro_custo
FROM financeiro_lancamentos l
LEFT JOIN pessoas cc ON cc.id = l.cliente_centro_custo_id
WHERE LOWER(l.descricao) LIKE '%sara%'
ORDER BY l.data_competencia DESC;
*/
