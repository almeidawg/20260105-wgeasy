-- ============================================================
-- Script: Dividir lançamentos DARCIO entre 4 empresas do grupo
-- Favorecido: DARCIO
-- Divisão: 25% para cada empresa do grupo (Núcleo)
-- Data: 2026-01-08
-- ============================================================

-- ============================================================
-- PARTE 1: CONSULTAR FAVORECIDO DARCIO
-- ============================================================

-- 1.1 Buscar cadastro Darcio
SELECT id, nome, tipo, ativo
FROM pessoas
WHERE LOWER(nome) LIKE '%darcio%'
   OR LOWER(nome) LIKE '%dárcio%';

-- ============================================================
-- PARTE 2: CONSULTAR LANÇAMENTOS COM DARCIO
-- ============================================================

-- 2.1 Lançamentos com Darcio na descrição ou como favorecido
SELECT
  l.id,
  l.descricao,
  l.valor_total,
  l.tipo,
  l.status,
  l.data_competencia,
  fav.nome as favorecido_atual,
  cc.nome as centro_custo_atual
FROM financeiro_lancamentos l
LEFT JOIN pessoas fav ON fav.id = l.pessoa_id
LEFT JOIN pessoas cc ON cc.id = l.cliente_centro_custo_id
WHERE LOWER(l.descricao) LIKE '%darcio%'
   OR LOWER(l.descricao) LIKE '%dárcio%'
   OR LOWER(fav.nome) LIKE '%darcio%'
   OR LOWER(fav.nome) LIKE '%dárcio%'
ORDER BY l.data_competencia DESC;

-- ============================================================
-- PARTE 3: IDENTIFICAR AS 4 EMPRESAS DO GRUPO
-- ============================================================

-- 3.1 Listar empresas do grupo cadastradas
SELECT
  id,
  razao_social,
  nome_fantasia,
  cnpj,
  nucleo_id,
  ativo
FROM empresas_grupo
WHERE ativo = true
ORDER BY nome_fantasia;

-- ============================================================
-- PARTE 4: DIVIDIR LANÇAMENTOS ENTRE AS 4 EMPRESAS
-- (Busca automaticamente as empresas do grupo)
-- ============================================================
DO $$
DECLARE
  v_empresas UUID[];
  v_empresas_nomes TEXT[];
  v_darcio_id UUID;
  v_num_empresas INTEGER;
  v_valor_original NUMERIC;
  v_valor_parte NUMERIC;
  v_descricao_original TEXT;
  v_lancamento_id UUID;
  v_tipo TEXT;
  v_status TEXT;
  v_data_competencia DATE;
  v_data_vencimento DATE;
  v_categoria_id UUID;
  v_pessoa_id UUID;
  rec RECORD;
  emp RECORD;
  i INTEGER;
BEGIN
  -- ========================================
  -- 1. BUSCAR AS 4 EMPRESAS DO GRUPO
  -- ========================================
  -- Buscar empresas ativas e encontrar/criar cadastro em pessoas
  i := 1;
  FOR emp IN
    SELECT id, razao_social, nome_fantasia, cnpj
    FROM empresas_grupo
    WHERE ativo = true
    ORDER BY nome_fantasia
    LIMIT 4
  LOOP
    -- Verificar se existe cadastro em pessoas com mesmo nome ou CNPJ
    SELECT id INTO v_pessoa_id
    FROM pessoas
    WHERE LOWER(nome) LIKE '%' || LOWER(emp.nome_fantasia) || '%'
       OR LOWER(nome) LIKE '%' || LOWER(emp.razao_social) || '%'
       OR cnpj = emp.cnpj
    LIMIT 1;

    -- Se não existe, criar cadastro em pessoas
    IF v_pessoa_id IS NULL THEN
      INSERT INTO pessoas (
        nome,
        tipo,
        cnpj,
        ativo,
        created_at,
        updated_at
      ) VALUES (
        emp.razao_social,
        'CLIENTE',
        emp.cnpj,
        true,
        NOW(),
        NOW()
      ) RETURNING id INTO v_pessoa_id;

      RAISE NOTICE 'Cadastro criado em pessoas: % - %', v_pessoa_id, emp.razao_social;
    ELSE
      RAISE NOTICE 'Cadastro existente em pessoas: % - %', v_pessoa_id, emp.nome_fantasia;
    END IF;

    v_empresas := array_append(v_empresas, v_pessoa_id);
    v_empresas_nomes := array_append(v_empresas_nomes, emp.nome_fantasia);
    i := i + 1;
  END LOOP;

  v_num_empresas := array_length(v_empresas, 1);

  IF v_num_empresas IS NULL OR v_num_empresas < 1 THEN
    RAISE EXCEPTION 'Nenhuma empresa do grupo encontrada!';
  END IF;

  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE '% empresas do grupo encontradas:', v_num_empresas;
  FOR i IN 1..v_num_empresas LOOP
    RAISE NOTICE '  %: %', i, v_empresas_nomes[i];
  END LOOP;

  -- ========================================
  -- 2. BUSCAR FAVORECIDO DARCIO
  -- ========================================
  SELECT id INTO v_darcio_id
  FROM pessoas
  WHERE LOWER(nome) LIKE '%darcio%'
  LIMIT 1;

  IF v_darcio_id IS NULL THEN
    RAISE EXCEPTION 'Favorecido DARCIO não encontrado!';
  END IF;

  RAISE NOTICE 'Favorecido DARCIO ID: %', v_darcio_id;

  -- ========================================
  -- 3. DIVIDIR CADA LANÇAMENTO
  -- ========================================
  FOR rec IN
    SELECT
      l.id,
      l.descricao,
      l.valor_total,
      l.tipo,
      l.status,
      l.data_competencia,
      l.data_vencimento,
      l.categoria_id
    FROM financeiro_lancamentos l
    LEFT JOIN pessoas fav ON fav.id = l.pessoa_id
    WHERE LOWER(l.descricao) LIKE '%darcio%'
       OR LOWER(l.descricao) LIKE '%dárcio%'
       OR LOWER(fav.nome) LIKE '%darcio%'
  LOOP
    v_lancamento_id := rec.id;
    v_valor_original := rec.valor_total;
    v_descricao_original := rec.descricao;
    v_tipo := rec.tipo;
    v_status := rec.status;
    v_data_competencia := rec.data_competencia;
    v_data_vencimento := rec.data_vencimento;
    v_categoria_id := rec.categoria_id;

    -- Calcular valor de cada parte
    v_valor_parte := ROUND(v_valor_original / v_num_empresas, 2);

    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Dividindo lançamento: %', v_descricao_original;
    RAISE NOTICE 'Valor original: R$ % → % partes de R$ %',
      v_valor_original, v_num_empresas, v_valor_parte;

    -- Atualizar lançamento original para Empresa 1
    UPDATE financeiro_lancamentos
    SET
      valor_total = v_valor_parte,
      cliente_centro_custo_id = v_empresas[1],
      pessoa_id = v_darcio_id,
      descricao = v_descricao_original || ' [1/' || v_num_empresas || ' - ' || v_empresas_nomes[1] || ']',
      updated_at = NOW()
    WHERE id = v_lancamento_id;

    RAISE NOTICE '  1/%: % - R$ %', v_num_empresas, v_empresas_nomes[1], v_valor_parte;

    -- Criar lançamentos para as demais empresas
    FOR i IN 2..v_num_empresas LOOP
      INSERT INTO financeiro_lancamentos (
        descricao,
        valor_total,
        tipo,
        status,
        data_competencia,
        data_vencimento,
        categoria_id,
        cliente_centro_custo_id,
        pessoa_id,
        created_at,
        updated_at
      ) VALUES (
        v_descricao_original || ' [' || i || '/' || v_num_empresas || ' - ' || v_empresas_nomes[i] || ']',
        v_valor_parte,
        v_tipo,
        v_status,
        v_data_competencia,
        v_data_vencimento,
        v_categoria_id,
        v_empresas[i],
        v_darcio_id,
        NOW(),
        NOW()
      );

      RAISE NOTICE '  %/%: % - R$ %', i, v_num_empresas, v_empresas_nomes[i], v_valor_parte;
    END LOOP;
  END LOOP;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'DIVISÃO CONCLUÍDA!';
  RAISE NOTICE '========================================';
END $$;

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================
SELECT
  l.id,
  l.descricao,
  l.valor_total,
  l.tipo,
  cc.nome as centro_custo,
  fav.nome as favorecido
FROM financeiro_lancamentos l
LEFT JOIN pessoas cc ON cc.id = l.cliente_centro_custo_id
LEFT JOIN pessoas fav ON fav.id = l.pessoa_id
WHERE LOWER(l.descricao) LIKE '%darcio%'
   OR LOWER(l.descricao) LIKE '%dárcio%'
ORDER BY l.data_competencia DESC, l.descricao;
