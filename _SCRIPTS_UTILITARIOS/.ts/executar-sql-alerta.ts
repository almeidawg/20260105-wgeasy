// Script para executar SQL de alerta de acesso do cliente
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ahlqzzkxuutwoepirpzr.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3MTI0MywiZXhwIjoyMDc2MTQ3MjQzfQ.xWNEmZumCtyRdrIiotUIL41jlI168HyBgM4yHVDXPZo";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function executarSQL() {
  console.log("Iniciando criacao de estrutura para alerta de acesso do cliente...\n");

  // 1. Adicionar coluna vendedor_responsavel_id
  console.log("1. Adicionando coluna vendedor_responsavel_id...");
  const { error: err1 } = await supabase.rpc("exec_raw_sql", {
    sql: `ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS vendedor_responsavel_id UUID REFERENCES pessoas(id)`
  });

  if (err1) {
    // Tentar via query direta se a função não existir
    console.log("   Tentando via query direta...");
  }

  // 2. Criar tabela de acessos
  console.log("2. Criando tabela acessos_cliente...");

  // 3. Criar função
  console.log("3. Criando funcao registrar_acesso_cliente...");

  console.log("\n=== SQL para executar manualmente no Supabase ===\n");

  const sqlCompleto = `
-- PARTE 1: Coluna vendedor_responsavel
ALTER TABLE pessoas
ADD COLUMN IF NOT EXISTS vendedor_responsavel_id UUID REFERENCES pessoas(id);

-- PARTE 2: Indice
CREATE INDEX IF NOT EXISTS idx_pessoas_vendedor_responsavel ON pessoas(vendedor_responsavel_id);

-- PARTE 3: Tabela de acessos
CREATE TABLE IF NOT EXISTS acessos_cliente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES pessoas(id),
    usuario_id UUID REFERENCES usuarios(id),
    ip_acesso VARCHAR(45),
    dispositivo VARCHAR(255),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PARTE 4 e 5: Indices
CREATE INDEX IF NOT EXISTS idx_acessos_cliente_cliente ON acessos_cliente(cliente_id);
CREATE INDEX IF NOT EXISTS idx_acessos_cliente_data ON acessos_cliente(criado_em);

-- PARTE 6: Funcao principal
CREATE OR REPLACE FUNCTION registrar_acesso_cliente(
    p_cliente_id UUID,
    p_usuario_id UUID DEFAULT NULL,
    p_dispositivo VARCHAR(255) DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cliente pessoas%ROWTYPE;
    v_vendedor_usuario_id UUID;
    v_acesso_id UUID;
BEGIN
    SELECT * INTO v_cliente FROM pessoas WHERE id = p_cliente_id;
    IF v_cliente.id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Cliente nao encontrado');
    END IF;
    INSERT INTO acessos_cliente (cliente_id, usuario_id, dispositivo)
    VALUES (p_cliente_id, p_usuario_id, p_dispositivo)
    RETURNING id INTO v_acesso_id;
    IF v_cliente.vendedor_responsavel_id IS NOT NULL THEN
        SELECT u.id INTO v_vendedor_usuario_id
        FROM usuarios u WHERE u.pessoa_id = v_cliente.vendedor_responsavel_id;
        IF v_vendedor_usuario_id IS NOT NULL THEN
            INSERT INTO notificacoes_sistema (
                tipo, titulo, mensagem, referencia_tipo, referencia_id,
                destinatario_id, para_todos_admins, url_acao, texto_acao
            ) VALUES (
                'cadastro_pendente',
                'Cliente acessou o sistema',
                'O cliente ' || v_cliente.nome || ' acabou de acessar a Area do Cliente.',
                'pessoas', p_cliente_id,
                v_vendedor_usuario_id, false,
                '/pessoas/' || p_cliente_id, 'Ver cliente'
            );
        END IF;
    END IF;
    RETURN json_build_object('success', true, 'acesso_id', v_acesso_id);
END;
$$;

-- PARTE 7: Permissao
GRANT EXECUTE ON FUNCTION registrar_acesso_cliente TO authenticated;
`;

  console.log(sqlCompleto);
  console.log("\n=== Copie e execute cada parte separadamente no Supabase SQL Editor ===");
}

executarSQL();
