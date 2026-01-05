// Script para atualizar a função aprovar_cadastro com criação automática de oportunidade
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ahlqzzkxuutwoepirpzr.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3MTI0MywiZXhwIjoyMDc2MTQ3MjQzfQ.xWNEmZumCtyRdrIiotUIL41jlI168HyBgM4yHVDXPZo";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function executarSQL() {
  console.log("=== ATUALIZANDO FUNCAO APROVAR_CADASTRO ===");
  console.log("Adicionando criacao automatica de oportunidade para CLIENTEs...\n");

  const sqlCompleto = `
-- Primeiro, dropar TODAS as versoes da funcao
DROP FUNCTION IF EXISTS aprovar_cadastro(UUID, VARCHAR, UUID);
DROP FUNCTION IF EXISTS aprovar_cadastro(UUID, VARCHAR, UUID, BOOLEAN);
DROP FUNCTION IF EXISTS aprovar_cadastro(UUID, VARCHAR, UUID, BOOLEAN, UUID);
DROP FUNCTION IF EXISTS aprovar_cadastro(UUID, VARCHAR, UUID, BOOLEAN, UUID, UUID);

-- Agora criar a nova versao com criacao de oportunidade para CLIENTEs
CREATE OR REPLACE FUNCTION aprovar_cadastro(
    p_cadastro_id UUID,
    p_tipo_usuario VARCHAR(50),
    p_aprovado_por UUID,
    p_is_master BOOLEAN DEFAULT NULL,
    p_indicado_por_id UUID DEFAULT NULL,
    p_categoria_comissao_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cadastro cadastros_pendentes%ROWTYPE;
    v_pessoa_id UUID;
    v_usuario_id UUID;
    v_auth_user_id UUID;
    v_senha VARCHAR(20);
    v_categoria_id UUID;
    v_is_master_final BOOLEAN;
    v_oportunidade_id UUID;
BEGIN
    SELECT * INTO v_cadastro
    FROM cadastros_pendentes
    WHERE id = p_cadastro_id;

    IF v_cadastro.id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Cadastro nao encontrado');
    END IF;

    IF v_cadastro.status != 'pendente_aprovacao' THEN
        RETURN json_build_object('success', false, 'error', 'Cadastro nao esta pendente de aprovacao');
    END IF;

    v_is_master_final := COALESCE(p_is_master, p_indicado_por_id IS NULL);

    IF p_categoria_comissao_id IS NULL AND v_cadastro.tipo_solicitado IN ('ESPECIFICADOR', 'COLABORADOR') THEN
        IF v_cadastro.tipo_solicitado = 'ESPECIFICADOR' THEN
            IF v_is_master_final THEN
                SELECT id INTO v_categoria_id FROM categorias_comissao WHERE codigo = 'ESPECIFICADOR_MASTER';
            ELSE
                SELECT id INTO v_categoria_id FROM categorias_comissao WHERE codigo = 'ESPECIFICADOR_INDICADO';
            END IF;
        ELSIF v_cadastro.tipo_solicitado = 'COLABORADOR' THEN
            SELECT id INTO v_categoria_id FROM categorias_comissao WHERE codigo = 'EQUIPE_INTERNA';
        END IF;
    ELSE
        v_categoria_id := p_categoria_comissao_id;
    END IF;

    INSERT INTO pessoas (
        nome, email, telefone, cpf, empresa, cargo, endereco, cidade, estado, cep,
        tipo, nucleo_id, is_master, indicado_por_id, categoria_comissao_id, data_inicio_comissao
    ) VALUES (
        v_cadastro.nome, v_cadastro.email, v_cadastro.telefone, v_cadastro.cpf_cnpj,
        v_cadastro.empresa, v_cadastro.cargo, v_cadastro.endereco, v_cadastro.cidade,
        v_cadastro.estado, v_cadastro.cep, LOWER(v_cadastro.tipo_solicitado),
        v_cadastro.nucleo_id, v_is_master_final, p_indicado_por_id, v_categoria_id, CURRENT_DATE
    )
    RETURNING id INTO v_pessoa_id;

    IF UPPER(v_cadastro.tipo_solicitado) = 'CLIENTE' THEN
        INSERT INTO oportunidades (
            titulo, cliente_id, descricao, valor, estagio, status, origem, data_abertura, observacoes
        ) VALUES (
            'Novo Cliente: ' || v_cadastro.nome,
            v_pessoa_id,
            'Oportunidade criada automaticamente a partir do cadastro do cliente ' || v_cadastro.nome ||
            CASE WHEN v_cadastro.empresa IS NOT NULL AND v_cadastro.empresa != ''
                THEN ' (' || v_cadastro.empresa || ')'
                ELSE ''
            END,
            NULL,
            'qualificacao',
            'novo',
            'cadastro_link',
            NOW(),
            'Cliente cadastrado via link de cadastro em ' || TO_CHAR(NOW(), 'DD/MM/YYYY HH24:MI')
        )
        RETURNING id INTO v_oportunidade_id;
    END IF;

    v_senha := 'WG' || substring(encode(gen_random_bytes(4), 'hex') from 1 for 6) || '!';

    IF v_cadastro.email IS NOT NULL AND v_cadastro.email != '' THEN
        SELECT id INTO v_auth_user_id FROM auth.users WHERE email = LOWER(v_cadastro.email);

        IF v_auth_user_id IS NULL THEN
            INSERT INTO auth.users (
                instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                created_at, updated_at, confirmation_token, recovery_token,
                raw_app_meta_data, raw_user_meta_data
            ) VALUES (
                '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
                LOWER(v_cadastro.email), crypt(v_senha, gen_salt('bf')), NOW(), NOW(), NOW(),
                '', '', '{"provider": "email", "providers": ["email"]}'::jsonb, '{}'::jsonb
            )
            RETURNING id INTO v_auth_user_id;
        ELSE
            UPDATE auth.users
            SET encrypted_password = crypt(v_senha, gen_salt('bf')), updated_at = NOW()
            WHERE id = v_auth_user_id;
        END IF;

        INSERT INTO usuarios (
            pessoa_id, cpf, auth_user_id, tipo_usuario, ativo, primeiro_acesso, nucleo_id
        ) VALUES (
            v_pessoa_id, COALESCE(v_cadastro.cpf_cnpj, ''), v_auth_user_id, p_tipo_usuario, true, true, v_cadastro.nucleo_id
        )
        RETURNING id INTO v_usuario_id;
    END IF;

    UPDATE cadastros_pendentes
    SET status = 'aprovado', aprovado_por = p_aprovado_por, aprovado_em = NOW(),
        tipo_usuario_aprovado = p_tipo_usuario, pessoa_id = v_pessoa_id, usuario_id = v_usuario_id,
        indicado_por_id = p_indicado_por_id, categoria_comissao_id = v_categoria_id, atualizado_em = NOW()
    WHERE id = p_cadastro_id;

    RETURN json_build_object(
        'success', true, 'pessoa_id', v_pessoa_id, 'usuario_id', v_usuario_id,
        'email', v_cadastro.email, 'senha_temporaria', v_senha,
        'is_master', v_is_master_final, 'categoria_comissao_id', v_categoria_id,
        'oportunidade_id', v_oportunidade_id, 'message', 'Cadastro aprovado com sucesso!'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION aprovar_cadastro(UUID, VARCHAR, UUID, BOOLEAN, UUID, UUID) TO authenticated;
`;

  console.log("Executando SQL...\n");

  const { data, error } = await supabase.rpc("exec_raw_sql", {
    sql: sqlCompleto
  });

  if (error) {
    console.error("Erro ao executar via RPC:", error.message);
    console.log("\n=== EXECUTE MANUALMENTE NO SUPABASE SQL EDITOR ===\n");
    console.log(sqlCompleto);
  } else {
    console.log("SUCESSO! Funcao atualizada!");
    console.log("Resultado:", data);
  }

  console.log("\n=== RESUMO ===");
  console.log("Quando um CLIENTE for aprovado:");
  console.log("  - Cria automaticamente uma oportunidade no Pipeline");
  console.log("  - Titulo: 'Novo Cliente: [nome]'");
  console.log("  - Estagio: 'qualificacao' (primeira coluna do kanban)");
  console.log("  - Status: 'novo'");
  console.log("  - Origem: 'cadastro_link'");
}

executarSQL().catch(console.error);
