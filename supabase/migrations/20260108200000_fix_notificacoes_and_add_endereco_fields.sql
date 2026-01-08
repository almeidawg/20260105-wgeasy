-- ============================================================================
-- Migration: Corrigir tabela notificacoes_sistema e adicionar campos de endereço
-- Data: 2026-01-08
-- Problemas:
--   1. Tabela notificacoes_sistema não tem colunas referencia_tipo/referencia_id
--   2. Tabela cadastros_pendentes não tem campos numero/complemento
-- ============================================================================

-- ============================================================================
-- 1. CRIAR/CORRIGIR TABELA notificacoes_sistema
-- ============================================================================

-- Criar tabela com todas as colunas necessárias (se não existir)
CREATE TABLE IF NOT EXISTS public.notificacoes_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL DEFAULT 'info',
  titulo TEXT NOT NULL,
  mensagem TEXT,
  referencia_tipo TEXT,
  referencia_id UUID,
  destinatario_id UUID,
  para_todos_admins BOOLEAN DEFAULT false,
  lida BOOLEAN DEFAULT false,
  lida_em TIMESTAMPTZ,
  lida_por UUID,
  url_acao TEXT,
  texto_acao TEXT,
  nucleo_id UUID,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Se a tabela já existia, adicionar colunas faltantes
DO $$
BEGIN
  -- Coluna referencia_tipo
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notificacoes_sistema' AND column_name = 'referencia_tipo'
  ) THEN
    ALTER TABLE public.notificacoes_sistema ADD COLUMN referencia_tipo TEXT;
    RAISE NOTICE 'Coluna referencia_tipo adicionada';
  END IF;

  -- Coluna referencia_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notificacoes_sistema' AND column_name = 'referencia_id'
  ) THEN
    ALTER TABLE public.notificacoes_sistema ADD COLUMN referencia_id UUID;
    RAISE NOTICE 'Coluna referencia_id adicionada';
  END IF;

  -- Coluna destinatario_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notificacoes_sistema' AND column_name = 'destinatario_id'
  ) THEN
    ALTER TABLE public.notificacoes_sistema ADD COLUMN destinatario_id UUID;
    RAISE NOTICE 'Coluna destinatario_id adicionada';
  END IF;

  -- Coluna para_todos_admins
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notificacoes_sistema' AND column_name = 'para_todos_admins'
  ) THEN
    ALTER TABLE public.notificacoes_sistema ADD COLUMN para_todos_admins BOOLEAN DEFAULT false;
    RAISE NOTICE 'Coluna para_todos_admins adicionada';
  END IF;

  -- Coluna url_acao
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notificacoes_sistema' AND column_name = 'url_acao'
  ) THEN
    ALTER TABLE public.notificacoes_sistema ADD COLUMN url_acao TEXT;
    RAISE NOTICE 'Coluna url_acao adicionada';
  END IF;

  -- Coluna texto_acao
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notificacoes_sistema' AND column_name = 'texto_acao'
  ) THEN
    ALTER TABLE public.notificacoes_sistema ADD COLUMN texto_acao TEXT;
    RAISE NOTICE 'Coluna texto_acao adicionada';
  END IF;

  -- Coluna nucleo_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notificacoes_sistema' AND column_name = 'nucleo_id'
  ) THEN
    ALTER TABLE public.notificacoes_sistema ADD COLUMN nucleo_id UUID;
    RAISE NOTICE 'Coluna nucleo_id adicionada';
  END IF;

  -- Criar índices (dentro do bloco para garantir que colunas existem)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notificacoes_sistema_lida') THEN
    CREATE INDEX idx_notificacoes_sistema_lida ON public.notificacoes_sistema(lida);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notificacoes_sistema_destinatario') THEN
    CREATE INDEX idx_notificacoes_sistema_destinatario ON public.notificacoes_sistema(destinatario_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notificacoes_sistema_referencia') THEN
    CREATE INDEX idx_notificacoes_sistema_referencia ON public.notificacoes_sistema(referencia_tipo, referencia_id);
  END IF;
END $$;

-- RLS para notificacoes_sistema
ALTER TABLE public.notificacoes_sistema ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notificacoes_sistema_select_policy" ON public.notificacoes_sistema;
DROP POLICY IF EXISTS "notificacoes_sistema_insert_policy" ON public.notificacoes_sistema;
DROP POLICY IF EXISTS "notificacoes_sistema_update_policy" ON public.notificacoes_sistema;

CREATE POLICY "notificacoes_sistema_select_policy" ON public.notificacoes_sistema
  FOR SELECT USING (true);

CREATE POLICY "notificacoes_sistema_insert_policy" ON public.notificacoes_sistema
  FOR INSERT WITH CHECK (true);

CREATE POLICY "notificacoes_sistema_update_policy" ON public.notificacoes_sistema
  FOR UPDATE USING (true);

-- ============================================================================
-- 2. ADICIONAR CAMPOS numero e complemento EM cadastros_pendentes
-- ============================================================================

DO $$
BEGIN
  -- Coluna numero
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'cadastros_pendentes' AND column_name = 'numero'
  ) THEN
    ALTER TABLE public.cadastros_pendentes ADD COLUMN numero TEXT;
    RAISE NOTICE 'Coluna numero adicionada em cadastros_pendentes';
  END IF;

  -- Coluna complemento
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'cadastros_pendentes' AND column_name = 'complemento'
  ) THEN
    ALTER TABLE public.cadastros_pendentes ADD COLUMN complemento TEXT;
    RAISE NOTICE 'Coluna complemento adicionada em cadastros_pendentes';
  END IF;
END $$;

-- ============================================================================
-- 3. ATUALIZAR FUNÇÃO preencher_cadastro COM NOVOS CAMPOS
-- ============================================================================

-- Dropar versão antiga da função (assinatura diferente causa conflito)
DROP FUNCTION IF EXISTS preencher_cadastro(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS preencher_cadastro(character varying, character varying, character varying, character varying, character varying, character varying, character varying, text, character varying, character varying, character varying, text, character varying, character varying, character varying, character varying, character varying);

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

-- ============================================================================
-- 4. ATUALIZAR VIEW vw_cadastros_pendentes
-- ============================================================================

-- Dropar VIEW existente (necessário se tipos de colunas mudaram)
DROP VIEW IF EXISTS vw_cadastros_pendentes;

-- Nota: usuarios não tem coluna 'nome' diretamente, tem pessoa_id que liga a pessoas
-- Então precisamos buscar via pessoa vinculada ao usuário
CREATE VIEW vw_cadastros_pendentes AS
SELECT
  cp.*,
  COALESCE(p.nome, pu.nome) AS enviado_por_nome,
  CASE
    WHEN p.id IS NOT NULL THEN p.tipo
    WHEN u.id IS NOT NULL THEN u.tipo_usuario
    ELSE NULL
  END AS enviado_por_tipo,
  pai.token AS link_pai_token
FROM cadastros_pendentes cp
LEFT JOIN pessoas p ON p.id = cp.enviado_por
LEFT JOIN usuarios u ON u.id = cp.enviado_por
LEFT JOIN pessoas pu ON pu.id = u.pessoa_id  -- pessoa vinculada ao usuário
LEFT JOIN cadastros_pendentes pai ON pai.id = cp.link_pai_id;

-- Permissões na view
GRANT SELECT ON vw_cadastros_pendentes TO authenticated;
GRANT SELECT ON vw_cadastros_pendentes TO anon;

-- ============================================================================
-- 5. VERIFICAÇÃO FINAL
-- ============================================================================

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Verificar colunas em notificacoes_sistema
  SELECT COUNT(*) INTO v_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'notificacoes_sistema'
    AND column_name IN ('referencia_tipo', 'referencia_id', 'destinatario_id', 'para_todos_admins');

  RAISE NOTICE 'notificacoes_sistema: % colunas de referência encontradas', v_count;

  -- Verificar colunas em cadastros_pendentes
  SELECT COUNT(*) INTO v_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'cadastros_pendentes'
    AND column_name IN ('numero', 'complemento');

  RAISE NOTICE 'cadastros_pendentes: % colunas de endereço encontradas', v_count;
END $$;
