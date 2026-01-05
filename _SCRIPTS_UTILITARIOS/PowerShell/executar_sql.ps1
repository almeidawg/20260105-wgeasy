#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Executa o script SQL de correção no Supabase
.DESCRIPTION
    Lê o arquivo SQL e orienta a execução no Supabase Dashboard
#>

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║     EXECUTAR CORREÇÃO DE RLS - LOGIN COLABORADOR         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host ""
Write-Host "📄 Carregando script SQL..." -ForegroundColor Cyan

$script_path = "EXECUTAR_CORRECAO_LOGIN_COLABORADOR.sql"
$sql_content = Get-Content -Path $script_path -Raw -Encoding UTF8

Write-Host "✅ Script carregado com sucesso!" -ForegroundColor Green
Write-Host "   Tamanho: $($sql_content.Length) caracteres" -ForegroundColor Gray

Write-Host ""
Write-Host "🔑 Opção 1: RECOMENDADO - Via Supabase Dashboard" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host @"
1. Abra: https://app.supabase.com/project/ahlqzzkxuutwoepirpzr/sql/new
2. Cole o conteúdo do arquivo: $script_path
3. Clique em "RUN" ou pressione Ctrl+Enter
4. Aguarde a conclusão
"@ -ForegroundColor White

Write-Host ""
Write-Host "🔑 Opção 2: Via PowerShell (se tiver Supabase CLI)" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "Comando:" -ForegroundColor White
Write-Host "  supabase db execute < $script_path" -ForegroundColor Cyan

Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS APÓS EXECUÇÃO:" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host @"
1. ✅ Execute o script SQL acima
2. 🧪 Rode os testes em: TESTES_RLS_LOGIN_COLABORADOR.md
3. 🔑 Faça login com usuário COLABORADOR
4. ✨ Verifique redirecionamento para /colaborador

Arquivos de suporte:
  • RESUMO_EXECUTIVO_LOGIN_COLABORADOR.md
  • TESTES_RLS_LOGIN_COLABORADOR.md
  • DIAGNOSTICO_LOGIN_COLABORADOR.sql
"@ -ForegroundColor White

Write-Host ""
Write-Host "📌 DICA: Copiar script para área de transferência" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray

# Copiar para clipboard
$sql_content | Set-Clipboard

Write-Host "✅ Script copiado para a área de transferência!" -ForegroundColor Green
Write-Host "   Cole no Supabase SQL Editor com Ctrl+V" -ForegroundColor Gray

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  👉 Abra o navegador e acesse Supabase Dashboard agora    ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
