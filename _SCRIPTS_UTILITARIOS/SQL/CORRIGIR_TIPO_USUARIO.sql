-- =============================================
-- SCRIPT: Verificar e corrigir tipo_usuario
-- Problema: Todos os usuários estão como CLIENTE
-- Data: 2026-01-02
-- =============================================

-- A função aprovar_cadastro está CORRETA (usa p_tipo_usuario)
-- O problema são os cadastros existentes que foram aprovados incorretamente

-- =============================================
-- EXECUTE ESTE UPDATE PARA CORRIGIR OS USUÁRIOS EXISTENTES:
-- =============================================

UPDATE usuarios u
SET
    tipo_usuario = p.tipo,
    atualizado_em = NOW()
FROM pessoas p
WHERE p.id = u.pessoa_id
  AND p.tipo IS NOT NULL
  AND p.tipo IN ('CLIENTE', 'COLABORADOR', 'ESPECIFICADOR', 'FORNECEDOR')
  AND p.tipo != u.tipo_usuario;

-- =============================================
-- APÓS O UPDATE, VERIFIQUE COM ESTA QUERY:
-- =============================================

-- 1. DIAGNÓSTICO: Ver usuários com tipo_pessoa vs tipo_usuario
SELECT
    u.id AS usuario_id,
    p.nome,
    p.email,
    p.tipo AS tipo_pessoa,
    u.tipo_usuario,
    CASE
        WHEN p.tipo = 'CLIENTE' AND u.tipo_usuario = 'CLIENTE' THEN '✅ OK'
        WHEN p.tipo = 'COLABORADOR' AND u.tipo_usuario = 'COLABORADOR' THEN '✅ OK'
        WHEN p.tipo = 'ESPECIFICADOR' AND u.tipo_usuario = 'ESPECIFICADOR' THEN '✅ OK'
        WHEN p.tipo = 'FORNECEDOR' AND u.tipo_usuario = 'FORNECEDOR' THEN '✅ OK'
        WHEN p.tipo != u.tipo_usuario THEN '❌ DIVERGENTE'
        ELSE '⚠️ VERIFICAR'
    END AS status
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
ORDER BY
    CASE WHEN p.tipo != u.tipo_usuario THEN 0 ELSE 1 END,
    p.nome;

-- 2. CONTAGEM: Quantos usuários de cada tipo
SELECT
    tipo_usuario,
    COUNT(*) AS quantidade
FROM usuarios
GROUP BY tipo_usuario
ORDER BY quantidade DESC;

-- 3. VER USUÁRIOS ONDE O TIPO NÃO BATE COM O TIPO DA PESSOA
SELECT
    u.id AS usuario_id,
    p.nome,
    p.email,
    p.tipo AS tipo_pessoa,
    u.tipo_usuario AS tipo_atual,
    'Deveria ser: ' || p.tipo AS sugestao
FROM usuarios u
JOIN pessoas p ON p.id = u.pessoa_id
WHERE p.tipo IS NOT NULL
  AND p.tipo != u.tipo_usuario
  AND p.tipo IN ('CLIENTE', 'COLABORADOR', 'ESPECIFICADOR', 'FORNECEDOR');

-- =============================================
-- 4. CORREÇÃO: Atualizar tipo_usuario baseado em pessoas.tipo
-- DESCOMENTE PARA EXECUTAR
-- =============================================

/*
UPDATE usuarios u
SET
    tipo_usuario = p.tipo,
    atualizado_em = NOW()
FROM pessoas p
WHERE p.id = u.pessoa_id
  AND p.tipo IS NOT NULL
  AND p.tipo IN ('CLIENTE', 'COLABORADOR', 'ESPECIFICADOR', 'FORNECEDOR')
  AND p.tipo != u.tipo_usuario;
*/

-- 5. VERIFICAR FUNÇÃO aprovar_cadastro
-- Execute isso para ver a definição atual da função:
SELECT
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_name = 'aprovar_cadastro'
  AND routine_schema = 'public';

-- =============================================
-- 6. CORRIGIR FUNÇÃO aprovar_cadastro SE NECESSÁRIO
-- Esta é a versão corrigida que usa o tipo_usuario passado
-- =============================================

/*
CREATE OR REPLACE FUNCTION public.aprovar_cadastro(
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
    v_auth_user_id UUID;
    v_senha TEXT;
    v_result JSONB;
BEGIN
    -- Buscar dados do cadastro
    SELECT * INTO v_cadastro
    FROM cadastros_pendentes
    WHERE id = p_cadastro_id AND status = 'PENDENTE';

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cadastro não encontrado ou já processado');
    END IF;

    -- Criar pessoa
    INSERT INTO pessoas (
        nome, email, telefone, cpf, cnpj, tipo,
        cep, logradouro, numero, complemento, bairro, cidade, estado,
        is_master, indicado_por_id, categoria_comissao_id,
        ativo, criado_em, atualizado_em
    ) VALUES (
        v_cadastro.nome,
        LOWER(TRIM(v_cadastro.email)),
        v_cadastro.telefone,
        v_cadastro.cpf,
        v_cadastro.cnpj,
        COALESCE(p_tipo_usuario, v_cadastro.tipo_solicitado, 'CLIENTE'),
        v_cadastro.cep,
        v_cadastro.logradouro,
        v_cadastro.numero,
        v_cadastro.complemento,
        v_cadastro.bairro,
        v_cadastro.cidade,
        v_cadastro.estado,
        COALESCE(p_is_master, false),
        p_indicado_por_id,
        p_categoria_comissao_id,
        true,
        NOW(),
        NOW()
    )
    RETURNING id INTO v_pessoa_id;

    -- Gerar senha: 3 dígitos CPF + 3 letras Nome + 3 dígitos Telefone
    v_senha := CONCAT(
        COALESCE(LEFT(REGEXP_REPLACE(v_cadastro.cpf, '[^0-9]', '', 'g'), 3), '000'),
        INITCAP(LEFT(REGEXP_REPLACE(v_cadastro.nome, '[^a-zA-Z]', '', 'g'), 3)),
        COALESCE(RIGHT(REGEXP_REPLACE(v_cadastro.telefone, '[^0-9]', '', 'g'), 3), '111')
    );

    -- Criar usuário (tipo_usuario vem do parâmetro!)
    INSERT INTO usuarios (
        pessoa_id,
        cpf,
        tipo_usuario,
        ativo,
        primeiro_acesso,
        cliente_pode_ver_valores,
        cliente_pode_ver_cronograma,
        cliente_pode_ver_documentos,
        cliente_pode_ver_proposta,
        cliente_pode_ver_contratos,
        cliente_pode_fazer_upload,
        cliente_pode_comentar,
        criado_em,
        atualizado_em
    ) VALUES (
        v_pessoa_id,
        v_cadastro.cpf,
        COALESCE(p_tipo_usuario, v_cadastro.tipo_solicitado, 'CLIENTE'), -- USA O TIPO PASSADO!
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        false,
        true,
        NOW(),
        NOW()
    )
    RETURNING id INTO v_usuario_id;

    -- Atualizar status do cadastro
    UPDATE cadastros_pendentes
    SET
        status = 'APROVADO',
        aprovado_por = p_aprovado_por,
        aprovado_em = NOW(),
        tipo_usuario_aprovado = COALESCE(p_tipo_usuario, v_cadastro.tipo_solicitado),
        atualizado_em = NOW()
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
*/

