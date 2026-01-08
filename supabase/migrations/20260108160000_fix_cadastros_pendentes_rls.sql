-- ============================================================================
-- Migration: Criar tabela cadastros_pendentes (Sistema de Links de Cadastro)
-- Data: 2026-01-08
-- Problema: Tabela não existia no banco de dados
-- ============================================================================

-- 1. Criar tabela cadastros_pendentes
-- ============================================================================
CREATE TABLE IF NOT EXISTS cadastros_pendentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  tipo_solicitado TEXT NOT NULL CHECK (tipo_solicitado IN ('CLIENTE', 'COLABORADOR', 'FORNECEDOR', 'ESPECIFICADOR')),
  status TEXT NOT NULL DEFAULT 'aguardando_preenchimento' CHECK (status IN ('aguardando_preenchimento', 'pendente_aprovacao', 'aprovado', 'rejeitado')),

  -- Dados do cadastro (preenchidos pelo usuário)
  nome TEXT,
  email TEXT,
  telefone TEXT,
  cpf_cnpj TEXT,
  empresa TEXT,
  cargo TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  observacoes TEXT,

  -- Dados bancários (para Colaborador/Fornecedor)
  banco TEXT,
  agencia TEXT,
  conta TEXT,
  tipo_conta TEXT,
  pix TEXT,

  -- Metadados do link
  enviado_por UUID,
  enviado_via TEXT CHECK (enviado_via IS NULL OR enviado_via IN ('email', 'whatsapp')),
  nucleo_id UUID,
  expira_em TIMESTAMPTZ,

  -- Links reutilizáveis
  reutilizavel BOOLEAN DEFAULT false,
  uso_maximo INTEGER,
  total_usos INTEGER DEFAULT 0,
  link_pai_id UUID REFERENCES cadastros_pendentes(id),

  -- Título personalizado
  titulo_pagina TEXT,

  -- Aprovação
  aprovado_por UUID,
  aprovado_em TIMESTAMPTZ,
  tipo_usuario_aprovado TEXT,
  motivo_rejeicao TEXT,

  -- Comissionamento
  indicado_por_id UUID,
  categoria_comissao_id UUID,

  -- Resultado
  pessoa_id UUID,
  usuario_id UUID,

  -- Timestamps
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now(),
  preenchido_em TIMESTAMPTZ
);

-- 2. Índices
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_cadastros_pendentes_token ON cadastros_pendentes(token);
CREATE INDEX IF NOT EXISTS idx_cadastros_pendentes_status ON cadastros_pendentes(status);
CREATE INDEX IF NOT EXISTS idx_cadastros_pendentes_tipo ON cadastros_pendentes(tipo_solicitado);
CREATE INDEX IF NOT EXISTS idx_cadastros_pendentes_enviado_por ON cadastros_pendentes(enviado_por);
CREATE INDEX IF NOT EXISTS idx_cadastros_pendentes_nucleo ON cadastros_pendentes(nucleo_id);

-- 3. View para listagem
-- ============================================================================
-- Nota: usuarios não tem coluna 'nome' diretamente, tem pessoa_id que liga a pessoas
CREATE OR REPLACE VIEW vw_cadastros_pendentes AS
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
LEFT JOIN pessoas pu ON pu.id = u.pessoa_id
LEFT JOIN cadastros_pendentes pai ON pai.id = cp.link_pai_id;

-- 4. RLS (Row Level Security)
-- ============================================================================
ALTER TABLE cadastros_pendentes ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "cadastros_pendentes_select" ON cadastros_pendentes;
DROP POLICY IF EXISTS "cadastros_pendentes_insert" ON cadastros_pendentes;
DROP POLICY IF EXISTS "cadastros_pendentes_update" ON cadastros_pendentes;
DROP POLICY IF EXISTS "cadastros_pendentes_delete" ON cadastros_pendentes;
DROP POLICY IF EXISTS "cadastros_pendentes_public_select" ON cadastros_pendentes;
DROP POLICY IF EXISTS "cadastros_pendentes_public_update" ON cadastros_pendentes;

-- Política SELECT: Usuários autenticados podem ver todos os cadastros
CREATE POLICY "cadastros_pendentes_select" ON cadastros_pendentes
  FOR SELECT TO authenticated
  USING (true);

-- Política INSERT: Usuários autenticados podem criar cadastros
CREATE POLICY "cadastros_pendentes_insert" ON cadastros_pendentes
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Política UPDATE: Usuários autenticados podem atualizar cadastros
CREATE POLICY "cadastros_pendentes_update" ON cadastros_pendentes
  FOR UPDATE TO authenticated
  USING (true);

-- Política DELETE: Usuários autenticados podem deletar cadastros
CREATE POLICY "cadastros_pendentes_delete" ON cadastros_pendentes
  FOR DELETE TO authenticated
  USING (true);

-- Política especial: Acesso anônimo para SELECT (formulário público)
CREATE POLICY "cadastros_pendentes_public_select" ON cadastros_pendentes
  FOR SELECT TO anon
  USING (true);

-- Política especial: Acesso anônimo para UPDATE (preenchimento do formulário)
CREATE POLICY "cadastros_pendentes_public_update" ON cadastros_pendentes
  FOR UPDATE TO anon
  USING (status = 'aguardando_preenchimento');

-- 5. Permissões na view
-- ============================================================================
GRANT SELECT ON vw_cadastros_pendentes TO authenticated;
GRANT SELECT ON vw_cadastros_pendentes TO anon;

-- 6. Função preencher_cadastro (para formulário público)
-- ============================================================================
DROP FUNCTION IF EXISTS preencher_cadastro(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION preencher_cadastro(
  p_token TEXT,
  p_nome TEXT,
  p_email TEXT,
  p_telefone TEXT DEFAULT NULL,
  p_cpf_cnpj TEXT DEFAULT NULL,
  p_empresa TEXT DEFAULT NULL,
  p_cargo TEXT DEFAULT NULL,
  p_endereco TEXT DEFAULT NULL,
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
      endereco, cidade, estado, cep, observacoes,
      banco, agencia, conta, tipo_conta, pix,
      enviado_por, enviado_via, nucleo_id, expira_em,
      link_pai_id, preenchido_em
    ) VALUES (
      gen_random_uuid()::text, v_cadastro.tipo_solicitado, 'pendente_aprovacao',
      p_nome, LOWER(TRIM(p_email)), p_telefone, p_cpf_cnpj, p_empresa, p_cargo,
      p_endereco, p_cidade, p_estado, p_cep, p_observacoes,
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

-- 7. Função aprovar_cadastro
-- ============================================================================
DROP FUNCTION IF EXISTS aprovar_cadastro(UUID, TEXT, UUID, BOOLEAN, UUID, UUID);

CREATE OR REPLACE FUNCTION aprovar_cadastro(
  p_cadastro_id UUID,
  p_tipo_usuario TEXT,
  p_aprovado_por UUID DEFAULT NULL,
  p_is_master BOOLEAN DEFAULT NULL,
  p_indicado_por_id UUID DEFAULT NULL,
  p_categoria_comissao_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cadastro RECORD;
  v_pessoa_id UUID;
  v_usuario_id UUID;
  v_senha TEXT;
BEGIN
  -- Buscar dados do cadastro
  SELECT * INTO v_cadastro
  FROM cadastros_pendentes
  WHERE id = p_cadastro_id AND status = 'pendente_aprovacao';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cadastro não encontrado ou já processado');
  END IF;

  -- Verificar se email já existe
  IF EXISTS (SELECT 1 FROM pessoas WHERE LOWER(email) = LOWER(v_cadastro.email)) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Já existe um cadastro com este email');
  END IF;

  -- Criar pessoa
  INSERT INTO pessoas (
    nome, email, telefone, cpf, cnpj, tipo,
    cep, cidade, estado,
    is_master, indicado_por_id, categoria_comissao_id,
    ativo, criado_em, atualizado_em
  ) VALUES (
    v_cadastro.nome,
    LOWER(TRIM(v_cadastro.email)),
    v_cadastro.telefone,
    CASE WHEN LENGTH(REGEXP_REPLACE(v_cadastro.cpf_cnpj, '[^0-9]', '', 'g')) <= 11
         THEN v_cadastro.cpf_cnpj ELSE NULL END,
    CASE WHEN LENGTH(REGEXP_REPLACE(v_cadastro.cpf_cnpj, '[^0-9]', '', 'g')) > 11
         THEN v_cadastro.cpf_cnpj ELSE NULL END,
    COALESCE(p_tipo_usuario, v_cadastro.tipo_solicitado, 'CLIENTE'),
    v_cadastro.cep,
    v_cadastro.cidade,
    v_cadastro.estado,
    COALESCE(p_is_master, false),
    p_indicado_por_id,
    p_categoria_comissao_id,
    true,
    now(),
    now()
  )
  RETURNING id INTO v_pessoa_id;

  -- Gerar senha: 3 dígitos CPF + 3 letras Nome + 3 dígitos Telefone
  v_senha := CONCAT(
    COALESCE(LEFT(REGEXP_REPLACE(v_cadastro.cpf_cnpj, '[^0-9]', '', 'g'), 3), '000'),
    INITCAP(LEFT(REGEXP_REPLACE(v_cadastro.nome, '[^a-zA-Z]', '', 'g'), 3)),
    COALESCE(RIGHT(REGEXP_REPLACE(v_cadastro.telefone, '[^0-9]', '', 'g'), 3), '111')
  );

  -- Criar usuário
  INSERT INTO usuarios (
    pessoa_id,
    cpf,
    tipo_usuario,
    ativo,
    primeiro_acesso,
    criado_em,
    atualizado_em
  ) VALUES (
    v_pessoa_id,
    CASE WHEN LENGTH(REGEXP_REPLACE(v_cadastro.cpf_cnpj, '[^0-9]', '', 'g')) <= 11
         THEN v_cadastro.cpf_cnpj ELSE NULL END,
    COALESCE(p_tipo_usuario, v_cadastro.tipo_solicitado, 'CLIENTE'),
    true,
    true,
    now(),
    now()
  )
  RETURNING id INTO v_usuario_id;

  -- Atualizar status do cadastro
  UPDATE cadastros_pendentes
  SET
    status = 'aprovado',
    aprovado_por = p_aprovado_por,
    aprovado_em = now(),
    tipo_usuario_aprovado = COALESCE(p_tipo_usuario, v_cadastro.tipo_solicitado),
    pessoa_id = v_pessoa_id,
    usuario_id = v_usuario_id,
    indicado_por_id = p_indicado_por_id,
    categoria_comissao_id = p_categoria_comissao_id,
    atualizado_em = now()
  WHERE id = p_cadastro_id;

  RETURN jsonb_build_object(
    'success', true,
    'pessoa_id', v_pessoa_id,
    'usuario_id', v_usuario_id,
    'email', LOWER(TRIM(v_cadastro.email)),
    'senha_temporaria', v_senha,
    'is_master', COALESCE(p_is_master, false),
    'categoria_comissao_id', p_categoria_comissao_id,
    'message', 'Cadastro aprovado com sucesso!'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 8. Função rejeitar_cadastro
-- ============================================================================
DROP FUNCTION IF EXISTS rejeitar_cadastro(UUID, TEXT, UUID);

CREATE OR REPLACE FUNCTION rejeitar_cadastro(
  p_cadastro_id UUID,
  p_motivo TEXT,
  p_rejeitado_por UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cadastro RECORD;
BEGIN
  -- Buscar dados do cadastro
  SELECT * INTO v_cadastro
  FROM cadastros_pendentes
  WHERE id = p_cadastro_id AND status = 'pendente_aprovacao';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cadastro não encontrado ou já processado');
  END IF;

  -- Atualizar status
  UPDATE cadastros_pendentes
  SET
    status = 'rejeitado',
    motivo_rejeicao = p_motivo,
    aprovado_por = p_rejeitado_por,
    aprovado_em = now(),
    atualizado_em = now()
  WHERE id = p_cadastro_id;

  RETURN jsonb_build_object('success', true, 'message', 'Cadastro rejeitado');
END;
$$;
