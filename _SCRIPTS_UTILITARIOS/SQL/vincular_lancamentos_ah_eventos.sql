-- ============================================================
-- Script: Mesclar UMA UMA com AH EVENTOS E PRODUCOES LTDA
-- e vincular lançamentos
-- Centro de Custo Principal: AH EVENTOS E PRODUCOES LTDA
-- Data: 2026-01-08
-- ============================================================

-- ============================================================
-- PARTE 1: VERIFICAR CADASTROS
-- ============================================================
SELECT id, nome, tipo, email, ativo
FROM pessoas
WHERE LOWER(nome) LIKE '%ah%evento%'
   OR LOWER(nome) LIKE '%uma%uma%'
   OR LOWER(nome) = 'uma'
ORDER BY nome;

-- ============================================================
-- PARTE 2: VERIFICAR LANÇAMENTOS
-- ============================================================
SELECT
  l.id,
  l.descricao,
  l.valor_total,
  l.tipo,
  l.status,
  cc.nome as centro_custo_atual
FROM financeiro_lancamentos l
LEFT JOIN pessoas cc ON cc.id = l.cliente_centro_custo_id
WHERE LOWER(l.descricao) LIKE '%ah evento%'
   OR LOWER(l.descricao) LIKE '%uma uma%'
ORDER BY l.data_competencia DESC;

-- ============================================================
-- PARTE 3: MESCLAR CADASTROS E VINCULAR LANÇAMENTOS
-- ============================================================
DO $$
DECLARE
  v_principal_id UUID;
  v_duplicado_id UUID;
  v_count INTEGER;
  rec RECORD;
BEGIN
  -- Buscar ID do cliente PRINCIPAL: AH EVENTOS E PRODUCOES LTDA
  SELECT id INTO v_principal_id
  FROM pessoas
  WHERE LOWER(nome) LIKE '%ah%evento%'
  LIMIT 1;

  IF v_principal_id IS NULL THEN
    RAISE EXCEPTION 'Cliente AH EVENTOS E PRODUCOES LTDA não encontrado!';
  END IF;

  RAISE NOTICE 'Cadastro PRINCIPAL (AH EVENTOS): %', v_principal_id;

  -- Buscar e mesclar cadastros "UMA UMA" ou "UMA"
  FOR rec IN
    SELECT id, nome FROM pessoas
    WHERE (LOWER(nome) LIKE '%uma%uma%' OR LOWER(nome) = 'uma')
      AND id != v_principal_id
      AND ativo = true
  LOOP
    RAISE NOTICE 'Cadastro DUPLICADO encontrado: % - %', rec.id, rec.nome;
    v_duplicado_id := rec.id;

    -- Migrar lançamentos (cliente_centro_custo_id)
    UPDATE financeiro_lancamentos
    SET cliente_centro_custo_id = v_principal_id, updated_at = NOW()
    WHERE cliente_centro_custo_id = v_duplicado_id;

    -- Migrar lançamentos (pessoa_id)
    UPDATE financeiro_lancamentos
    SET pessoa_id = v_principal_id, updated_at = NOW()
    WHERE pessoa_id = v_duplicado_id;

    -- Migrar contratos
    UPDATE contratos
    SET cliente_id = v_principal_id, updated_at = NOW()
    WHERE cliente_id = v_duplicado_id;

    -- Migrar projetos
    UPDATE projetos
    SET cliente_id = v_principal_id, updated_at = NOW()
    WHERE cliente_id = v_duplicado_id;

    -- Desativar o cadastro duplicado
    UPDATE pessoas
    SET
      ativo = false,
      nome = nome || ' [MESCLADO → AH EVENTOS]',
      updated_at = NOW()
    WHERE id = v_duplicado_id;

    RAISE NOTICE 'Cadastro % mesclado e desativado', v_duplicado_id;
  END LOOP;

  -- Vincular lançamentos com "uma uma" ou "ah evento" na descrição
  UPDATE financeiro_lancamentos
  SET
    cliente_centro_custo_id = v_principal_id,
    updated_at = NOW()
  WHERE (
      LOWER(descricao) LIKE '%ah evento%'
      OR LOWER(descricao) LIKE '%uma uma%'
    )
    AND (cliente_centro_custo_id IS NULL OR cliente_centro_custo_id != v_principal_id);

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'MESCLAGEM E VINCULAÇÃO CONCLUÍDAS!';
  RAISE NOTICE '% lançamentos vinculados ao cliente AH EVENTOS E PRODUCOES LTDA', v_count;
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
WHERE LOWER(l.descricao) LIKE '%ah evento%'
   OR LOWER(l.descricao) LIKE '% uma %'
   OR LOWER(l.descricao) LIKE 'uma %'
   OR LOWER(l.descricao) LIKE '% uma'
ORDER BY l.data_competencia DESC;
