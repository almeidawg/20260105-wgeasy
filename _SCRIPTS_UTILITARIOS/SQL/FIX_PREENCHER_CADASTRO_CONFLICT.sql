-- ============================================================================
-- FIX: Resolver conflito de funções preencher_cadastro
-- Data: 2026-01-08
-- Problema: Existem duas versões da função com assinaturas diferentes
-- ============================================================================

-- 1. Listar todas as versões da função
SELECT
  p.proname AS function_name,
  pg_get_function_arguments(p.oid) AS arguments,
  pg_get_function_result(p.oid) AS return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'preencher_cadastro';

-- 2. Dropar TODAS as versões da função preencher_cadastro
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN
    SELECT p.oid, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname = 'preencher_cadastro'
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS public.preencher_cadastro(%s)', func_record.args);
    RAISE NOTICE 'Dropped function preencher_cadastro(%)', func_record.args;
  END LOOP;
END $$;

-- 3. Verificar se foi removida
SELECT
  p.proname AS function_name,
  pg_get_function_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'preencher_cadastro';

-- 4. Agora criar a versão correta (com numero e complemento)
CREATE OR REPLACE FUNCTION preencher_cadastro(
  p_token TEXT,
  p_nome TEXT,
  p_email TEXT,
  p_telefone TEXT DEFAULT NULL,
  p_cpf_cnpj TEXT DEFAULT NULL,
  p_empresa TEXT DEFAULT NULL,
  p_cargo TEXT DEFAULT NULL,
  p_endereco TEXT DEFAULT NULL,
  p_numero TEXT DEFAULT NULL,
  p_complemento TEXT DEFAULT NULL,
  p_cidade TEXT DEFAULT NULL,
  p_estado TEXT DEFAULT NULL,
  p_cep TEXT DEFAULT NULL,
  p_observacoes TEXT DEFAULT NULL,
  p_banco TEXT DEFAULT NULL,
  p_agencia TEXT DEFAULT NULL,
  p_conta TEXT DEFAULT NULL,
  p_tipo_conta TEXT DEFAULT NULL,
  p_pix TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cadastro RECORD;
  v_novo_id UUID;
BEGIN
  -- Buscar cadastro pelo token
  SELECT * INTO v_cadastro
  FROM cadastros_pendentes
  WHERE token = p_token;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Link inválido ou expirado');
  END IF;

  -- Verificar se expirou
  IF v_cadastro.expira_em IS NOT NULL AND v_cadastro.expira_em < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Este link expirou');
  END IF;

  -- Se for link reutilizável, criar novo registro filho
  IF v_cadastro.reutilizavel = true THEN
    -- Verificar limite de usos
    IF v_cadastro.uso_maximo IS NOT NULL AND v_cadastro.total_usos >= v_cadastro.uso_maximo THEN
      RETURN jsonb_build_object('success', false, 'error', 'Limite de usos atingido para este link');
    END IF;

    -- Criar novo registro
    INSERT INTO cadastros_pendentes (
      token, tipo_solicitado, status,
      nome, email, telefone, cpf_cnpj, empresa, cargo,
      endereco, numero, complemento, cidade, estado, cep, observacoes,
      banco, agencia, conta, tipo_conta, pix,
      enviado_por, enviado_via, nucleo_id, expira_em,
      link_pai_id, preenchido_em
    ) VALUES (
      gen_random_uuid()::text, v_cadastro.tipo_solicitado, 'pendente_aprovacao',
      p_nome, LOWER(TRIM(p_email)), p_telefone, p_cpf_cnpj, p_empresa, p_cargo,
      p_endereco, p_numero, p_complemento, p_cidade, p_estado, p_cep, p_observacoes,
      p_banco, p_agencia, p_conta, p_tipo_conta, p_pix,
      v_cadastro.enviado_por, v_cadastro.enviado_via, v_cadastro.nucleo_id, NULL,
      v_cadastro.id, now()
    )
    RETURNING id INTO v_novo_id;

    -- Incrementar contador de usos no pai
    UPDATE cadastros_pendentes
    SET total_usos = COALESCE(total_usos, 0) + 1,
        atualizado_em = now()
    WHERE id = v_cadastro.id;

    RETURN jsonb_build_object('success', true, 'message', 'Cadastro enviado com sucesso! Aguarde aprovação.', 'id', v_novo_id);
  ELSE
    -- Link de uso único - atualizar registro existente
    IF v_cadastro.status != 'aguardando_preenchimento' THEN
      RETURN jsonb_build_object('success', false, 'error', 'Este link já foi utilizado');
    END IF;

    UPDATE cadastros_pendentes
    SET
      nome = p_nome,
      email = LOWER(TRIM(p_email)),
      telefone = p_telefone,
      cpf_cnpj = p_cpf_cnpj,
      empresa = p_empresa,
      cargo = p_cargo,
      endereco = p_endereco,
      numero = p_numero,
      complemento = p_complemento,
      cidade = p_cidade,
      estado = p_estado,
      cep = p_cep,
      observacoes = p_observacoes,
      banco = p_banco,
      agencia = p_agencia,
      conta = p_conta,
      tipo_conta = p_tipo_conta,
      pix = p_pix,
      status = 'pendente_aprovacao',
      preenchido_em = now(),
      atualizado_em = now()
    WHERE id = v_cadastro.id;

    RETURN jsonb_build_object('success', true, 'message', 'Cadastro enviado com sucesso! Aguarde aprovação.');
  END IF;
END;
$$;

-- 5. Verificar se a nova função foi criada
SELECT
  p.proname AS function_name,
  pg_get_function_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'preencher_cadastro';
