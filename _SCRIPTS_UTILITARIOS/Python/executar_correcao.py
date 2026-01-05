#!/usr/bin/env python3
"""
Script para executar correção de RLS e login colaborador via Supabase
Data: 4 de Janeiro, 2026
"""

import os
import sys
from pathlib import Path

# ============================================================
# Configurações do Supabase
# ============================================================

SUPABASE_URL = "https://ahlqzzkxuutwoepirpzr.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = os.getenv(
    "SUPABASE_SERVICE_ROLE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3MTI0MywiZXhwIjoyMDc2MTQ3MjQzfQ.xWNEmZumCtyRdrIiotUIL41jlI168HyBgM4yHVDXPZo",
)

# ============================================================
# Importar Supabase Client
# ============================================================

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ Erro: supabase-py não está instalado")
    print("Instale com: pip install supabase")
    sys.exit(1)

# ============================================================
# Conectar ao Supabase
# ============================================================

print("🔌 Conectando ao Supabase...")
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    print("✅ Conectado ao Supabase com sucesso!")
except Exception as e:
    print(f"❌ Erro ao conectar: {e}")
    sys.exit(1)

# ============================================================
# Ler o script SQL
# ============================================================

script_path = Path(__file__).parent / "EXECUTAR_CORRECAO_LOGIN_COLABORADOR.sql"

print(f"\n📄 Lendo script: {script_path}")

try:
    with open(script_path, "r", encoding="utf-8") as f:
        sql_script = f.read()
    print(f"✅ Script lido com sucesso ({len(sql_script)} caracteres)")
except FileNotFoundError:
    print(f"❌ Arquivo não encontrado: {script_path}")
    sys.exit(1)

# ============================================================
# Dividir script em comandos SQL individuais
# ============================================================

print("\n🔄 Preparando comandos SQL...")

# Dividir por ; e remover comentários
commands = []
current_command = ""

for line in sql_script.split("\n"):
    # Pular linhas vazias e comentários
    if not line.strip() or line.strip().startswith("--"):
        continue

    current_command += line + "\n"

    # Se encontrar ;, é fim do comando
    if ";" in line:
        cmd = current_command.strip()
        if cmd:
            commands.append(cmd)
        current_command = ""

print(f"✅ {len(commands)} comandos SQL encontrados")

# ============================================================
# Executar comandos SQL
# ============================================================

print("\n" + "=" * 60)
print("🚀 EXECUTANDO CORREÇÃO DE RLS E LOGIN COLABORADOR")
print("=" * 60 + "\n")

success_count = 0
error_count = 0
errors = []

for i, command in enumerate(commands, 1):
    # Mostrar resumo do comando
    cmd_preview = command[:80].replace("\n", " ")
    if len(command) > 80:
        cmd_preview += "..."

    print(f"[{i}/{len(commands)}] Executando: {cmd_preview}")

    try:
        # Executar comando via RPC
        result = supabase.rpc("execute_sql", {"sql": command}).execute()

        print(f"  ✅ Sucesso")
        success_count += 1

    except Exception as e:
        # Tentar executar via query raw (fallback)
        try:
            # Alguns comandos podem não funcionar via RPC
            # Isso depende da versão do Supabase
            print(f"  ⚠️  Tentando método alternativo...")
            print(f"  ❌ Erro: {str(e)[:100]}")
            error_count += 1
            errors.append({"command": cmd_preview, "error": str(e)})
        except:
            print(f"  ❌ Erro: {str(e)[:100]}")
            error_count += 1
            errors.append({"command": cmd_preview, "error": str(e)})

# ============================================================
# Resumo Final
# ============================================================

print("\n" + "=" * 60)
print("📊 RESUMO DA EXECUÇÃO")
print("=" * 60)

print(
    f"""
✅ Comandos com sucesso: {success_count}
❌ Comandos com erro: {error_count}
📊 Total: {len(commands)}
"""
)

if errors:
    print("\n⚠️  ERROS ENCONTRADOS:")
    for i, err in enumerate(errors, 1):
        print(f"\n{i}. Comando: {err['command']}")
        print(f"   Erro: {err['error']}")

# ============================================================
# Resultado Final
# ============================================================

if error_count == 0:
    print("\n🎉 SUCESSO! RLS e login colaborador foram corrigidos!")
    print("\n📋 Próximos passos:")
    print("   1. Faça login com usuário COLABORADOR")
    print("   2. Verifique se redireciona para /colaborador")
    print("   3. Execute os testes em: TESTES_RLS_LOGIN_COLABORADOR.md")
else:
    print("\n⚠️  Alguns comandos falharam. Verifique os erros acima.")
    print("   Nota: Alguns erros podem ser esperados (políticas já existentes, etc)")

sys.exit(0 if error_count == 0 else 1)
