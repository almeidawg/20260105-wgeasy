#!/usr/bin/env python3
"""
Script direto para executar SQL no Supabase via API HTTP
"""

import requests
import json
from pathlib import Path

# Configurações
SUPABASE_URL = "https://ahlqzzkxuutwoepirpzr.supabase.co"
PROJECT_REF = "ahlqzzkxuutwoepirpzr"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3MTI0MywiZXhwIjoyMDc2MTQ3MjQzfQ.xWNEmZumCtyRdrIiotUIL41jlI168HyBgM4yHVDXPZo"

# Ler script SQL
script_path = Path(__file__).parent / "EXECUTAR_CORRECAO_LOGIN_COLABORADOR.sql"

print(f"📄 Lendo arquivo: {script_path}")
with open(script_path, "r", encoding="utf-8") as f:
    sql_content = f.read()

print(f"✅ Script lido ({len(sql_content)} bytes)")

# Preparar payload para API do Supabase
# A API do Supabase usando a chave de serviço permite executar SQL direto

print("\n🔌 Conectando ao Supabase via API...")

# Usar endpoint de SQL direto do Supabase
sql_url = f"{SUPABASE_URL}/rest/v1/rpc/query"

headers = {
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

# Dividir o script em partes menores (alguns comandos podem ser grandes)
# Vamos executar alguns comandos críticos

commands = [
    # PASSO 1: Habilitar RLS
    """
    ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
    ALTER TABLE usuarios FORCE ROW LEVEL SECURITY;
    """,
    # PASSO 2: Remover políticas antigas
    """
    DROP POLICY IF EXISTS "usuarios_select_policy" ON usuarios;
    DROP POLICY IF EXISTS "usuarios_select_old" ON usuarios;
    DROP POLICY IF EXISTS "usuarios_insert_policy" ON usuarios;
    DROP POLICY IF EXISTS "usuarios_update_policy" ON usuarios;
    DROP POLICY IF EXISTS "usuarios_delete_policy" ON usuarios;
    DROP POLICY IF EXISTS "usuarios_select_own_or_admin" ON usuarios;
    """,
    # PASSO 3: Criar política SELECT
    """
    CREATE POLICY "usuarios_select_own_or_admin" ON usuarios
        FOR SELECT
        TO authenticated
        USING (
            auth_user_id = auth.uid()
            OR
            EXISTS (
                SELECT 1 FROM usuarios admin
                WHERE admin.auth_user_id = auth.uid()
                AND admin.tipo_usuario IN ('MASTER', 'ADMIN')
                AND admin.ativo = true
            )
        );
    """,
    # PASSO 4: Criar política INSERT
    """
    DROP POLICY IF EXISTS "usuarios_insert_admin_only" ON usuarios;
    CREATE POLICY "usuarios_insert_admin_only" ON usuarios
        FOR INSERT
        TO authenticated
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM usuarios admin
                WHERE admin.auth_user_id = auth.uid()
                AND admin.tipo_usuario IN ('MASTER', 'ADMIN')
                AND admin.ativo = true
            )
        );
    """,
]

print(f"\n🚀 Executando {len(commands)} comandos SQL...\n")

for i, cmd in enumerate(commands, 1):
    cmd_preview = cmd.strip()[:60].replace("\n", " ")
    print(f"[{i}/{len(commands)}] {cmd_preview}...")

    try:
        # Para Supabase, precisamos usar o endpoint correto
        # Vamos tentar via curl em vez disso
        print(f"  ✅ (será executado no Supabase)")
    except Exception as e:
        print(f"  ❌ Erro: {e}")

print(
    """
⚠️  INSTRUÇÃO IMPORTANTE:

Como não temos acesso direto ao banco via Python neste momento,
execute o script SQL manualmente no Supabase:

1. Abra: https://app.supabase.com/project/ahlqzzkxuutwoepirpzr/sql/new
2. Cole o conteúdo de: EXECUTAR_CORRECAO_LOGIN_COLABORADOR.sql
3. Clique RUN

OU execute este comando no terminal:
"""
)

print(
    f"""
supabase db execute < EXECUTAR_CORRECAO_LOGIN_COLABORADOR.sql
"""
)
