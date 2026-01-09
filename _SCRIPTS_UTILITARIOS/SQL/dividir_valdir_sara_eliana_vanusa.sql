-- ============================================================
-- Script: Dividir lançamento VALDIR entre TRÊS centros de custo
-- Lançamento: "Pix enviado para Valdir Nascimento Santiago - ajudante obra Sara, Eliana e Vanusa"
-- ID: c14f80b2-3455-412b-884e-b21809f587fb
-- Valor: R$ 1.000,00
-- Data: 2026-01-08
-- ============================================================

-- 1. Verificar o lançamento específico
SELECT
  l.id,
  l.descricao,
  l.valor_total,
  l.status,
  cc.nome as centro_custo_atual
FROM financeiro_lancamentos l
LEFT JOIN pessoas cc ON cc.id = l.cliente_centro_custo_id
WHERE l.id = 'c14f80b2-3455-412b-884e-b21809f587fb';

-- ============================================================
-- 2. DIVIDIR O LANÇAMENTO (33,33% CADA)
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

  RAISE NOTICE 'SARA ID: %', v_sara_id;
  RAISE NOTICE 'ELIANA ID: %', v_eliana_id;
  RAISE NOTICE 'JVCORPORATE ID: %', v_jvcorporate_id;

  -- Buscar o lançamento original pelo ID específico
  SELECT * INTO v_lancamento_original
  FROM financeiro_lancamentos
  WHERE id = 'c14f80b2-3455-412b-884e-b21809f587fb';

  IF v_lancamento_original.id IS NULL THEN
    RAISE EXCEPTION 'Lançamento não encontrado!';
  END IF;

  -- Calcular 1/3 do valor (com ajuste para centavos)
  -- R$ 1000 / 3 = R$ 333,33 + R$ 333,33 + R$ 333,34
  v_valor_parte := 333.33;
  v_valor_ajuste := 333.34;

  RAISE NOTICE 'Lançamento: % - Valor: %', v_lancamento_original.descricao, v_lancamento_original.valor_total;

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
    'Pix enviado para Valdir Nascimento Santiago - ajudante obra (1/3 - Sara)',
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

  RAISE NOTICE 'Criado lançamento SARA: R$ %', v_valor_parte;

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
    'Pix enviado para Valdir Nascimento Santiago - ajudante obra (1/3 - Eliana)',
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

  RAISE NOTICE 'Criado lançamento ELIANA: R$ %', v_valor_parte;

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
    'Pix enviado para Valdir Nascimento Santiago - ajudante obra (1/3 - Jvcorporate/Vanusa)',
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

  RAISE NOTICE 'Criado lançamento JVCORPORATE: R$ %', v_valor_ajuste;

  -- Marcar o lançamento original como cancelado
  UPDATE financeiro_lancamentos
  SET
    status = 'cancelado',
    descricao = descricao || ' [DIVIDIDO EM 3]',
    updated_at = NOW()
  WHERE id = 'c14f80b2-3455-412b-884e-b21809f587fb';

  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'DIVISÃO CONCLUÍDA!';
  RAISE NOTICE 'Sara: R$ 333,33 | Eliana: R$ 333,33 | Jvcorporate: R$ 333,34';
END $$;

-- ============================================================
-- 3. VERIFICAÇÃO
-- ============================================================
SELECT
  l.id,
  l.descricao,
  l.valor_total,
  l.status,
  cc.nome as cliente_centro_custo
FROM financeiro_lancamentos l
LEFT JOIN pessoas cc ON cc.id = l.cliente_centro_custo_id
WHERE l.descricao LIKE '%Valdir%ajudante%'
ORDER BY l.created_at DESC;
