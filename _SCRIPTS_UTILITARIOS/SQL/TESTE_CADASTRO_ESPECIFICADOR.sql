-- ============================================================================
-- TESTE: Criar link de cadastro e preencher com dados fictícios
-- Data: 2026-01-08
-- ============================================================================

-- 1. Criar um link de cadastro para ESPECIFICADOR (se não existir)
-- ============================================================================
INSERT INTO cadastros_pendentes (
  token,
  tipo_solicitado,
  status,
  enviado_via,
  criado_em
)
SELECT
  'TESTE-ESPECIFICADOR-' || to_char(now(), 'YYYYMMDDHH24MISS'),
  'ESPECIFICADOR',
  'aguardando_preenchimento',
  'email',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM cadastros_pendentes
  WHERE token LIKE 'TESTE-ESPECIFICADOR-%'
  AND status = 'aguardando_preenchimento'
);

-- Buscar o token criado
SELECT token, tipo_solicitado, status, criado_em
FROM cadastros_pendentes
WHERE token LIKE 'TESTE-ESPECIFICADOR-%'
ORDER BY criado_em DESC
LIMIT 1;

-- 2. Preencher o cadastro com dados fictícios usando a função
-- ============================================================================
-- NOTA: Substitua 'SEU_TOKEN_AQUI' pelo token retornado acima

SELECT preencher_cadastro(
  p_token := (SELECT token FROM cadastros_pendentes WHERE token LIKE 'TESTE-ESPECIFICADOR-%' AND status = 'aguardando_preenchimento' ORDER BY criado_em DESC LIMIT 1),
  p_nome := 'Maria Arquiteta Silva',
  p_email := 'maria.arquiteta.teste@exemplo.com',
  p_telefone := '(11) 99999-8888',
  p_cpf_cnpj := '123.456.789-00',
  p_empresa := 'Arquitetura Silva & Associados',
  p_cargo := 'Arquiteta Sênior',
  p_endereco := 'Rua das Palmeiras',
  p_numero := '1500',
  p_complemento := 'Sala 301, 3º Andar',
  p_cidade := 'São Paulo',
  p_estado := 'SP',
  p_cep := '01310-100',
  p_observacoes := 'Especializada em projetos residenciais de alto padrão. Interesse em parceria para indicação de clientes.',
  p_banco := NULL,
  p_agencia := NULL,
  p_conta := NULL,
  p_tipo_conta := NULL,
  p_pix := NULL
);

-- 3. Verificar o resultado
-- ============================================================================
SELECT
  id,
  token,
  tipo_solicitado,
  status,
  nome,
  email,
  telefone,
  cpf_cnpj,
  empresa,
  cargo,
  endereco,
  numero,
  complemento,
  cidade,
  estado,
  cep,
  observacoes,
  preenchido_em
FROM cadastros_pendentes
WHERE email = 'maria.arquiteta.teste@exemplo.com'
ORDER BY criado_em DESC
LIMIT 1;

-- 4. Testar a VIEW também
-- ============================================================================
SELECT
  id,
  tipo_solicitado,
  status,
  nome,
  email,
  endereco,
  numero,
  complemento,
  cidade,
  estado,
  enviado_por_nome,
  enviado_por_tipo
FROM vw_cadastros_pendentes
WHERE email = 'maria.arquiteta.teste@exemplo.com'
ORDER BY criado_em DESC
LIMIT 1;

-- 5. (Opcional) Limpar dados de teste depois
-- ============================================================================
-- DELETE FROM cadastros_pendentes WHERE email = 'maria.arquiteta.teste@exemplo.com';
-- DELETE FROM cadastros_pendentes WHERE token LIKE 'TESTE-ESPECIFICADOR-%';
