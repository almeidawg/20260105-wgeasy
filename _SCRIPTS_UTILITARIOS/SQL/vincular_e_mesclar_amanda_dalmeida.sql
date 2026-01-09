-- ============================================================
-- Script: Mesclar cadastros e vincular lançamentos AMANDA D'ALMEIDA
-- Mesclar: "Amanda D'Almeida Apto", "Amanda LM Eslaviero", "Amanda Almeida" → "Amanda D'Almeida"
-- Termos de busca nos lançamentos: Amanda, Amanda D'Almeida
-- Data: 2026-01-08
-- ============================================================

-- ============================================================
-- PARTE 1: IDENTIFICAR CADASTROS
-- ============================================================

-- 1.1 Buscar todos os cadastros com "Amanda"
SELECT
  id,
  nome,
  tipo,
  email,
  telefone,
  ativo,
  created_at
FROM pessoas
WHERE LOWER(nome) LIKE '%amanda%'
ORDER BY created_at;

-- ============================================================
-- PARTE 2: VERIFICAR LANÇAMENTOS
-- ============================================================

-- 2.1 Contar lançamentos com Amanda
SELECT
  COUNT(*) as total_lancamentos,
  SUM(valor_total) as valor_total
FROM financeiro_lancamentos
WHERE LOWER(descricao) LIKE '%amanda%';

-- 2.2 Visualizar os lançamentos
SELECT
  l.id,
  l.descricao,
  l.valor_total,
  l.tipo,
  l.status,
  cc.nome as centro_custo_atual
FROM financeiro_lancamentos l
LEFT JOIN pessoas cc ON cc.id = l.cliente_centro_custo_id
WHERE LOWER(l.descricao) LIKE '%amanda%'
ORDER BY l.data_competencia DESC;

-- ============================================================
-- PARTE 3: MESCLAR CADASTROS E VINCULAR LANÇAMENTOS
-- ============================================================
DO $$
DECLARE
  v_principal_id UUID;
  v_duplicado_id UUID;
  v_count_lancamentos INTEGER;
  rec RECORD;
BEGIN
  -- Buscar o cadastro PRINCIPAL "Amanda D'Almeida" (exato ou mais próximo)
  SELECT id INTO v_principal_id
  FROM pessoas
  WHERE LOWER(nome) = 'amanda d''almeida'
     OR LOWER(nome) = 'amanda dalmeida'
  ORDER BY created_at ASC
  LIMIT 1;

  -- Se não encontrou exato, buscar variação
  IF v_principal_id IS NULL THEN
    SELECT id INTO v_principal_id
    FROM pessoas
    WHERE LOWER(nome) LIKE '%amanda%d%almeida%'
      AND LOWER(nome) NOT LIKE '%apto%'
      AND LOWER(nome) NOT LIKE '%eslaviero%'
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  -- Se ainda não encontrou, pegar qualquer um com Amanda (exceto os que serão mesclados)
  IF v_principal_id IS NULL THEN
    SELECT id INTO v_principal_id
    FROM pessoas
    WHERE LOWER(nome) LIKE '%amanda%'
      AND LOWER(nome) NOT LIKE '%apto%'
      AND LOWER(nome) NOT LIKE '%eslaviero%'
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  IF v_principal_id IS NULL THEN
    RAISE EXCEPTION 'Cliente AMANDA D''ALMEIDA não encontrado!';
  END IF;

  RAISE NOTICE 'Cadastro PRINCIPAL ID: %', v_principal_id;

  -- Mostrar nome do principal
  FOR rec IN SELECT nome FROM pessoas WHERE id = v_principal_id LOOP
    RAISE NOTICE 'Nome do principal: %', rec.nome;
  END LOOP;

  -- Buscar e mesclar cadastros duplicados
  -- Mesclar: "Amanda D'Almeida Apto", "Amanda LM Eslaviero", "Amanda Almeida"
  FOR rec IN
    SELECT id, nome FROM pessoas
    WHERE (
        LOWER(nome) LIKE '%amanda%apto%'
        OR LOWER(nome) LIKE '%amanda%eslaviero%'
        OR LOWER(nome) LIKE '%amanda almeida%'
        OR (LOWER(nome) LIKE '%amanda%' AND LOWER(nome) NOT LIKE '%amanda d%almeida%')
      )
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
      nome = nome || ' [MESCLADO → AMANDA D''ALMEIDA]',
      updated_at = NOW()
    WHERE id = v_duplicado_id;

    RAISE NOTICE 'Cadastro % mesclado e desativado', v_duplicado_id;
  END LOOP;

  -- Vincular todos os lançamentos com "Amanda" na descrição
  UPDATE financeiro_lancamentos
  SET
    cliente_centro_custo_id = v_principal_id,
    updated_at = NOW()
  WHERE LOWER(descricao) LIKE '%amanda%'
    AND (cliente_centro_custo_id IS NULL OR cliente_centro_custo_id != v_principal_id);

  GET DIAGNOSTICS v_count_lancamentos = ROW_COUNT;

  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'MESCLAGEM E VINCULAÇÃO CONCLUÍDAS!';
  RAISE NOTICE 'Cadastro principal: %', v_principal_id;
  RAISE NOTICE '% lançamentos vinculados ao cliente AMANDA D''ALMEIDA', v_count_lancamentos;
END $$;

-- ============================================================
-- PARTE 4: VERIFICAÇÃO FINAL
-- ============================================================

-- 4.1 Verificar cadastros Amanda
SELECT
  id,
  nome,
  tipo,
  ativo,
  created_at
FROM pessoas
WHERE LOWER(nome) LIKE '%amanda%'
ORDER BY ativo DESC, created_at;

-- 4.2 Verificar lançamentos vinculados
SELECT
  l.id,
  l.descricao,
  l.valor_total,
  l.tipo,
  cc.nome as cliente_centro_custo
FROM financeiro_lancamentos l
LEFT JOIN pessoas cc ON cc.id = l.cliente_centro_custo_id
WHERE LOWER(l.descricao) LIKE '%amanda%'
ORDER BY l.data_competencia DESC;
