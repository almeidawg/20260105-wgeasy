-- ============================================================
-- Script: Dividir lançamento entre dois centros de custo
-- Caso: "Pix enviado para Valdir Nascimento Santiago - obra Rafael e Raphael"
-- Data: 2026-01-08
-- ============================================================

-- 1. Identificar o lançamento a ser dividido
SELECT
  l.id,
  l.numero,
  l.descricao,
  l.valor_total,
  l.tipo,
  l.status,
  l.data_competencia,
  l.vencimento,
  l.data_pagamento,
  l.categoria_id,
  l.pessoa_id,
  l.nucleo
FROM financeiro_lancamentos l
WHERE LOWER(l.descricao) LIKE '%valdir%nascimento%santiago%'
   OR (LOWER(l.descricao) LIKE '%rafael%' AND LOWER(l.descricao) LIKE '%raphael%')
ORDER BY l.data_competencia DESC;

-- 2. Buscar os dois clientes
SELECT id, nome, tipo FROM pessoas WHERE LOWER(nome) LIKE '%rafael%lacerda%';
SELECT id, nome, tipo FROM pessoas WHERE LOWER(nome) LIKE '%raphael%henrique%';

-- ============================================================
-- 3. DIVIDIR O LANÇAMENTO (50% CADA)
-- ============================================================
DO $$
DECLARE
  v_lancamento_original RECORD;
  v_rafael_lacerda_id UUID;
  v_raphael_henrique_id UUID;
  v_valor_cada NUMERIC(14,2);
  v_novo_id_1 UUID;
  v_novo_id_2 UUID;
BEGIN
  -- Buscar ID do RAFAEL LACERDA
  SELECT id INTO v_rafael_lacerda_id
  FROM pessoas
  WHERE LOWER(nome) LIKE '%rafael%lacerda%'
  LIMIT 1;

  -- Buscar ID do RAPHAEL HENRIQUE PINTO PIRES
  SELECT id INTO v_raphael_henrique_id
  FROM pessoas
  WHERE LOWER(nome) LIKE '%raphael%henrique%'
     OR LOWER(nome) LIKE '%raphael%pinto%pires%'
  LIMIT 1;

  IF v_rafael_lacerda_id IS NULL THEN
    RAISE EXCEPTION 'Cliente RAFAEL LACERDA não encontrado!';
  END IF;

  IF v_raphael_henrique_id IS NULL THEN
    RAISE EXCEPTION 'Cliente RAPHAEL HENRIQUE não encontrado!';
  END IF;

  RAISE NOTICE 'RAFAEL LACERDA ID: %', v_rafael_lacerda_id;
  RAISE NOTICE 'RAPHAEL HENRIQUE ID: %', v_raphael_henrique_id;

  -- Buscar o lançamento original
  SELECT * INTO v_lancamento_original
  FROM financeiro_lancamentos
  WHERE LOWER(descricao) LIKE '%valdir%nascimento%santiago%'
     OR (LOWER(descricao) LIKE '%rafael%' AND LOWER(descricao) LIKE '%raphael%')
  ORDER BY data_competencia DESC
  LIMIT 1;

  IF v_lancamento_original.id IS NULL THEN
    RAISE EXCEPTION 'Lançamento original não encontrado!';
  END IF;

  -- Calcular 50% do valor
  v_valor_cada := ROUND(v_lancamento_original.valor_total / 2, 2);

  RAISE NOTICE 'Lançamento original: % - Valor: %', v_lancamento_original.descricao, v_lancamento_original.valor_total;
  RAISE NOTICE 'Valor para cada centro de custo: %', v_valor_cada;

  -- Criar primeiro lançamento (RAFAEL LACERDA)
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
    v_lancamento_original.descricao || ' (50% - Rafael Lacerda)',
    v_valor_cada,
    v_lancamento_original.tipo,
    v_lancamento_original.status,
    v_lancamento_original.data_competencia,
    v_lancamento_original.vencimento,
    v_lancamento_original.data_pagamento,
    v_lancamento_original.categoria_id,
    v_lancamento_original.pessoa_id,
    v_lancamento_original.nucleo,
    v_rafael_lacerda_id,
    NOW(),
    NOW()
  ) RETURNING id INTO v_novo_id_1;

  RAISE NOTICE 'Criado lançamento 1 (Rafael Lacerda): %', v_novo_id_1;

  -- Criar segundo lançamento (RAPHAEL HENRIQUE)
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
    v_lancamento_original.descricao || ' (50% - Raphael Henrique)',
    v_valor_cada,
    v_lancamento_original.tipo,
    v_lancamento_original.status,
    v_lancamento_original.data_competencia,
    v_lancamento_original.vencimento,
    v_lancamento_original.data_pagamento,
    v_lancamento_original.categoria_id,
    v_lancamento_original.pessoa_id,
    v_lancamento_original.nucleo,
    v_raphael_henrique_id,
    NOW(),
    NOW()
  ) RETURNING id INTO v_novo_id_2;

  RAISE NOTICE 'Criado lançamento 2 (Raphael Henrique): %', v_novo_id_2;

  -- Marcar o lançamento original como cancelado (ou delete se preferir)
  UPDATE financeiro_lancamentos
  SET
    status = 'cancelado',
    descricao = descricao || ' [DIVIDIDO EM 2 - VER IDs: ' || v_novo_id_1 || ' e ' || v_novo_id_2 || ']',
    updated_at = NOW()
  WHERE id = v_lancamento_original.id;

  RAISE NOTICE 'Lançamento original marcado como cancelado';
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'DIVISÃO CONCLUÍDA COM SUCESSO!';
END $$;

-- ============================================================
-- 4. VERIFICAÇÃO FINAL
-- ============================================================
SELECT
  l.id,
  l.descricao,
  l.valor_total,
  l.tipo,
  l.status,
  cc.nome as cliente_centro_custo
FROM financeiro_lancamentos l
LEFT JOIN pessoas cc ON cc.id = l.cliente_centro_custo_id
WHERE LOWER(l.descricao) LIKE '%valdir%nascimento%santiago%'
   OR LOWER(l.descricao) LIKE '%rafael%lacerda%'
   OR LOWER(l.descricao) LIKE '%raphael%henrique%'
ORDER BY l.created_at DESC
LIMIT 10;
