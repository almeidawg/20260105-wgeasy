-- ============================================================
-- Script: Dividir lançamento entre TRÊS centros de custo
-- Caso: "ajudante obra Sara, Eliana e Vanusa" - R$ 1.000,00
-- Dividir entre: SARA, ELIANA KIELLANDER LOPES, JVCORPORATE LTDA
-- Data: 2026-01-08
-- ============================================================

-- 1. Identificar o lançamento a ser dividido
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
WHERE LOWER(l.descricao) LIKE '%sara%eliana%vanusa%'
   OR LOWER(l.descricao) LIKE '%sara%' AND LOWER(l.descricao) LIKE '%eliana%' AND LOWER(l.descricao) LIKE '%vanusa%'
ORDER BY l.data_competencia DESC;

-- 2. Buscar os três clientes
SELECT id, nome, tipo FROM pessoas WHERE LOWER(nome) LIKE '%sara%' AND tipo = 'CLIENTE';
SELECT id, nome, tipo FROM pessoas WHERE LOWER(nome) LIKE '%eliana%kiellander%';
SELECT id, nome, tipo FROM pessoas WHERE LOWER(nome) LIKE '%jvcorporate%';

-- ============================================================
-- 3. DIVIDIR O LANÇAMENTO (33,33% CADA)
-- ============================================================
DO $$
DECLARE
  v_lancamento_original RECORD;
  v_sara_id UUID;
  v_eliana_id UUID;
  v_jvcorporate_id UUID;
  v_valor_parte NUMERIC(14,2);
  v_valor_ajuste NUMERIC(14,2);
  v_novo_id_1 UUID;
  v_novo_id_2 UUID;
  v_novo_id_3 UUID;
BEGIN
  -- Buscar ID da SARA
  SELECT id INTO v_sara_id
  FROM pessoas
  WHERE LOWER(nome) LIKE '%sara%'
    AND tipo = 'CLIENTE'
  LIMIT 1;

  -- Buscar ID da ELIANA KIELLANDER LOPES
  SELECT id INTO v_eliana_id
  FROM pessoas
  WHERE LOWER(nome) LIKE '%eliana%kiellander%'
  LIMIT 1;

  -- Buscar ID da JVCORPORATE LTDA (Vanusa)
  SELECT id INTO v_jvcorporate_id
  FROM pessoas
  WHERE LOWER(nome) LIKE '%jvcorporate%'
  LIMIT 1;

  IF v_sara_id IS NULL THEN
    RAISE EXCEPTION 'Cliente SARA não encontrado!';
  END IF;

  IF v_eliana_id IS NULL THEN
    RAISE EXCEPTION 'Cliente ELIANA KIELLANDER não encontrado!';
  END IF;

  IF v_jvcorporate_id IS NULL THEN
    RAISE EXCEPTION 'Cliente JVCORPORATE não encontrado!';
  END IF;

  RAISE NOTICE 'SARA ID: %', v_sara_id;
  RAISE NOTICE 'ELIANA ID: %', v_eliana_id;
  RAISE NOTICE 'JVCORPORATE ID: %', v_jvcorporate_id;

  -- Buscar o lançamento original
  SELECT * INTO v_lancamento_original
  FROM financeiro_lancamentos
  WHERE LOWER(descricao) LIKE '%sara%'
    AND LOWER(descricao) LIKE '%eliana%'
    AND LOWER(descricao) LIKE '%vanusa%'
  ORDER BY data_competencia DESC
  LIMIT 1;

  IF v_lancamento_original.id IS NULL THEN
    RAISE EXCEPTION 'Lançamento original não encontrado!';
  END IF;

  -- Calcular 1/3 do valor (com ajuste para centavos)
  v_valor_parte := FLOOR(v_lancamento_original.valor_total / 3 * 100) / 100;
  v_valor_ajuste := v_lancamento_original.valor_total - (v_valor_parte * 2); -- Último pega o resto

  RAISE NOTICE 'Lançamento original: % - Valor: %', v_lancamento_original.descricao, v_lancamento_original.valor_total;
  RAISE NOTICE 'Valor para Sara e Eliana: % cada', v_valor_parte;
  RAISE NOTICE 'Valor para Jvcorporate (ajuste): %', v_valor_ajuste;

  -- Criar primeiro lançamento (SARA)
  INSERT INTO financeiro_lancamentos (
    descricao,
    valor_total,
    tipo,
    status,
    data_competencia,
    vencimento,
    data_pagamento,
    categoria_id,
    pessoa_id,
    nucleo,
    cliente_centro_custo_id,
    created_at,
    updated_at
  ) VALUES (
    v_lancamento_original.descricao || ' (1/3 - Sara)',
    v_valor_parte,
    v_lancamento_original.tipo,
    v_lancamento_original.status,
    v_lancamento_original.data_competencia,
    v_lancamento_original.vencimento,
    v_lancamento_original.data_pagamento,
    v_lancamento_original.categoria_id,
    v_lancamento_original.pessoa_id,
    v_lancamento_original.nucleo,
    v_sara_id,
    NOW(),
    NOW()
  ) RETURNING id INTO v_novo_id_1;

  RAISE NOTICE 'Criado lançamento 1 (Sara): % - R$ %', v_novo_id_1, v_valor_parte;

  -- Criar segundo lançamento (ELIANA)
  INSERT INTO financeiro_lancamentos (
    descricao,
    valor_total,
    tipo,
    status,
    data_competencia,
    vencimento,
    data_pagamento,
    categoria_id,
    pessoa_id,
    nucleo,
    cliente_centro_custo_id,
    created_at,
    updated_at
  ) VALUES (
    v_lancamento_original.descricao || ' (1/3 - Eliana)',
    v_valor_parte,
    v_lancamento_original.tipo,
    v_lancamento_original.status,
    v_lancamento_original.data_competencia,
    v_lancamento_original.vencimento,
    v_lancamento_original.data_pagamento,
    v_lancamento_original.categoria_id,
    v_lancamento_original.pessoa_id,
    v_lancamento_original.nucleo,
    v_eliana_id,
    NOW(),
    NOW()
  ) RETURNING id INTO v_novo_id_2;

  RAISE NOTICE 'Criado lançamento 2 (Eliana): % - R$ %', v_novo_id_2, v_valor_parte;

  -- Criar terceiro lançamento (JVCORPORATE/VANUSA)
  INSERT INTO financeiro_lancamentos (
    descricao,
    valor_total,
    tipo,
    status,
    data_competencia,
    vencimento,
    data_pagamento,
    categoria_id,
    pessoa_id,
    nucleo,
    cliente_centro_custo_id,
    created_at,
    updated_at
  ) VALUES (
    v_lancamento_original.descricao || ' (1/3 - Jvcorporate/Vanusa)',
    v_valor_ajuste,
    v_lancamento_original.tipo,
    v_lancamento_original.status,
    v_lancamento_original.data_competencia,
    v_lancamento_original.vencimento,
    v_lancamento_original.data_pagamento,
    v_lancamento_original.categoria_id,
    v_lancamento_original.pessoa_id,
    v_lancamento_original.nucleo,
    v_jvcorporate_id,
    NOW(),
    NOW()
  ) RETURNING id INTO v_novo_id_3;

  RAISE NOTICE 'Criado lançamento 3 (Jvcorporate/Vanusa): % - R$ %', v_novo_id_3, v_valor_ajuste;

  -- Marcar o lançamento original como cancelado
  UPDATE financeiro_lancamentos
  SET
    status = 'cancelado',
    descricao = descricao || ' [DIVIDIDO EM 3]',
    updated_at = NOW()
  WHERE id = v_lancamento_original.id;

  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'DIVISÃO EM 3 CONCLUÍDA COM SUCESSO!';
  RAISE NOTICE 'Total: R$ % + R$ % + R$ % = R$ %',
    v_valor_parte, v_valor_parte, v_valor_ajuste,
    (v_valor_parte + v_valor_parte + v_valor_ajuste);
END $$;

-- ============================================================
-- 4. VERIFICAÇÃO FINAL
-- ============================================================
SELECT
  l.id,
  l.descricao,
  l.valor_total,
  l.status,
  cc.nome as cliente_centro_custo
FROM financeiro_lancamentos l
LEFT JOIN pessoas cc ON cc.id = l.cliente_centro_custo_id
WHERE LOWER(l.descricao) LIKE '%sara%eliana%vanusa%'
ORDER BY l.created_at DESC;
