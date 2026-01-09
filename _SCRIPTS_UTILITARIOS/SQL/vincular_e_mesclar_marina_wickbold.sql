-- ============================================================
-- Script: Vincular lançamentos e mesclar cadastros duplicados
-- Cliente: MARINA WICKBOLD
-- Termos de busca: Mari, Marina, Wickbold
-- Data: 2026-01-08
-- ============================================================

-- ============================================================
-- PARTE 1: IDENTIFICAR CADASTROS DUPLICADOS
-- ============================================================

-- 1.1 Buscar todos os cadastros com "Marina" ou "Wickbold"
SELECT
  id,
  nome,
  tipo,
  email,
  telefone,
  cpf,
  created_at
FROM pessoas
WHERE LOWER(nome) LIKE '%marina%'
   OR LOWER(nome) LIKE '%wickbold%'
ORDER BY created_at;

-- ============================================================
-- PARTE 2: VERIFICAR LANÇAMENTOS
-- ============================================================

-- 2.1 Contar lançamentos com Mari, Marina ou Wickbold
SELECT
  COUNT(*) as total_lancamentos,
  SUM(valor_total) as valor_total
FROM financeiro_lancamentos
WHERE LOWER(descricao) LIKE '%mari%'
   OR LOWER(descricao) LIKE '%marina%'
   OR LOWER(descricao) LIKE '%wickbold%';

-- 2.2 Visualizar os lançamentos
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
WHERE LOWER(l.descricao) LIKE '%mari%'
   OR LOWER(l.descricao) LIKE '%marina%'
   OR LOWER(l.descricao) LIKE '%wickbold%'
ORDER BY l.data_competencia DESC;

-- ============================================================
-- PARTE 3: MESCLAR CADASTROS E VINCULAR LANÇAMENTOS
-- ============================================================
DO $$
DECLARE
  v_principal_id UUID;
  v_duplicado_id UUID;
  v_count_lancamentos INTEGER;
  v_count_contratos INTEGER;
  v_count_projetos INTEGER;
  rec RECORD;
BEGIN
  -- Buscar o cadastro PRINCIPAL (o mais completo ou mais antigo)
  -- Vamos usar o que tem "MARINA WICKBOLD" no nome
  SELECT id INTO v_principal_id
  FROM pessoas
  WHERE LOWER(nome) LIKE '%marina%wickbold%'
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_principal_id IS NULL THEN
    -- Se não encontrou "MARINA WICKBOLD", buscar qualquer um com Marina ou Wickbold
    SELECT id INTO v_principal_id
    FROM pessoas
    WHERE LOWER(nome) LIKE '%marina%'
       OR LOWER(nome) LIKE '%wickbold%'
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  IF v_principal_id IS NULL THEN
    RAISE EXCEPTION 'Cliente MARINA WICKBOLD não encontrado!';
  END IF;

  RAISE NOTICE 'Cadastro PRINCIPAL ID: %', v_principal_id;

  -- Buscar cadastros duplicados (todos exceto o principal)
  FOR rec IN
    SELECT id, nome FROM pessoas
    WHERE (LOWER(nome) LIKE '%marina%' OR LOWER(nome) LIKE '%wickbold%')
      AND id != v_principal_id
  LOOP
    RAISE NOTICE 'Cadastro DUPLICADO encontrado: % - %', rec.id, rec.nome;
    v_duplicado_id := rec.id;

    -- Migrar lançamentos do duplicado para o principal
    UPDATE financeiro_lancamentos
    SET cliente_centro_custo_id = v_principal_id, updated_at = NOW()
    WHERE cliente_centro_custo_id = v_duplicado_id;

    -- Migrar pessoa_id (fornecedor) se houver
    UPDATE financeiro_lancamentos
    SET pessoa_id = v_principal_id, updated_at = NOW()
    WHERE pessoa_id = v_duplicado_id;

    -- Migrar contratos se houver
    UPDATE contratos
    SET cliente_id = v_principal_id, updated_at = NOW()
    WHERE cliente_id = v_duplicado_id;

    -- Migrar projetos se houver
    UPDATE projetos
    SET cliente_id = v_principal_id, updated_at = NOW()
    WHERE cliente_id = v_duplicado_id;

    -- Desativar o cadastro duplicado (não excluir para manter histórico)
    UPDATE pessoas
    SET
      ativo = false,
      nome = nome || ' [DUPLICADO - MESCLADO COM ' || v_principal_id || ']',
      updated_at = NOW()
    WHERE id = v_duplicado_id;

    RAISE NOTICE 'Cadastro % mesclado e desativado', v_duplicado_id;
  END LOOP;

  -- Vincular todos os lançamentos com Mari/Marina/Wickbold na descrição
  UPDATE financeiro_lancamentos
  SET
    cliente_centro_custo_id = v_principal_id,
    updated_at = NOW()
  WHERE (
      LOWER(descricao) LIKE '%mari%'
      OR LOWER(descricao) LIKE '%marina%'
      OR LOWER(descricao) LIKE '%wickbold%'
    )
    AND (cliente_centro_custo_id IS NULL OR cliente_centro_custo_id != v_principal_id);

  GET DIAGNOSTICS v_count_lancamentos = ROW_COUNT;

  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'MESCLAGEM E VINCULAÇÃO CONCLUÍDAS!';
  RAISE NOTICE 'Cadastro principal: %', v_principal_id;
  RAISE NOTICE '% lançamentos vinculados ao cliente MARINA WICKBOLD', v_count_lancamentos;
END $$;

-- ============================================================
-- PARTE 4: VERIFICAÇÃO FINAL
-- ============================================================

-- 4.1 Verificar cadastros de Marina/Wickbold
SELECT
  id,
  nome,
  tipo,
  ativo,
  created_at
FROM pessoas
WHERE LOWER(nome) LIKE '%marina%'
   OR LOWER(nome) LIKE '%wickbold%'
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
WHERE LOWER(l.descricao) LIKE '%mari%'
   OR LOWER(l.descricao) LIKE '%marina%'
   OR LOWER(l.descricao) LIKE '%wickbold%'
ORDER BY l.data_competencia DESC;
