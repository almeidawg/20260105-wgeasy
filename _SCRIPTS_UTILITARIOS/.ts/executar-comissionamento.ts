// Script para executar o SQL do sistema de comissionamento
// Executa usando a service_role_key do Supabase

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ahlqzzkxuutwoepirpzr.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3MTI0MywiZXhwIjoyMDc2MTQ3MjQzfQ.xWNEmZumCtyRdrIiotUIL41jlI168HyBgM4yHVDXPZo";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function executarSQL() {
  console.log("=== EXECUTANDO SISTEMA DE COMISSIONAMENTO ===\n");

  try {
    // 1. Criar tabela faixas_vgv
    console.log("1. Criando tabela faixas_vgv...");
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS faixas_vgv (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          cota INTEGER NOT NULL UNIQUE CHECK (cota BETWEEN 1 AND 10),
          nome VARCHAR(50) NOT NULL,
          valor_minimo DECIMAL(15,2) NOT NULL DEFAULT 0,
          valor_maximo DECIMAL(15,2),
          descricao TEXT,
          ativo BOOLEAN DEFAULT true,
          criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    }).then(r => { if(r.error) throw r.error; });

    // 2. Criar tabela categorias_comissao
    console.log("2. Criando tabela categorias_comissao...");
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS categorias_comissao (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          codigo VARCHAR(50) NOT NULL UNIQUE,
          nome VARCHAR(100) NOT NULL,
          descricao TEXT,
          tipo_pessoa VARCHAR(50) NOT NULL CHECK (tipo_pessoa IN ('VENDEDOR', 'ESPECIFICADOR', 'COLABORADOR', 'EQUIPE_INTERNA')),
          is_master BOOLEAN DEFAULT false,
          is_indicacao BOOLEAN DEFAULT false,
          ordem INTEGER DEFAULT 0,
          ativo BOOLEAN DEFAULT true,
          criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    }).then(r => { if(r.error) throw r.error; });

    // 3. Criar tabela percentuais_comissao
    console.log("3. Criando tabela percentuais_comissao...");
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS percentuais_comissao (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          categoria_id UUID NOT NULL REFERENCES categorias_comissao(id) ON DELETE CASCADE,
          faixa_id UUID NOT NULL REFERENCES faixas_vgv(id) ON DELETE CASCADE,
          percentual DECIMAL(5,2) NOT NULL CHECK (percentual >= 0 AND percentual <= 100),
          ativo BOOLEAN DEFAULT true,
          criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(categoria_id, faixa_id)
        );
      `
    }).then(r => { if(r.error) throw r.error; });

    console.log("\n=== TABELAS CRIADAS COM SUCESSO! ===");
    console.log("\nAgora execute o SQL completo no Supabase Dashboard para popular os dados.");

  } catch (error: any) {
    console.error("ERRO:", error.message || error);
  }
}

executarSQL();
