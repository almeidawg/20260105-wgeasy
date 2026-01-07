# ============================================================
# SCRIPT DE DEPLOY - WG Easy (PowerShell)
# Uso: .\deploy.ps1 "mensagem do commit"
# ============================================================

param(
    [string]$Mensagem = "deploy: atualizacao do sistema"
)

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  WG EASY - DEPLOY AUTOMATICO" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Mostrar status
Write-Host "[1/4] Verificando alteracoes..." -ForegroundColor Yellow
git status --short

# Adicionar todas as alteracoes
Write-Host ""
Write-Host "[2/4] Adicionando arquivos..." -ForegroundColor Yellow
git add .

# Fazer commit
Write-Host ""
Write-Host "[3/4] Criando commit: $Mensagem" -ForegroundColor Yellow
$commitResult = git commit -m "$Mensagem" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[!] Nenhuma alteracao para commitar." -ForegroundColor Red
    Write-Host ""
    exit 0
}

Write-Host $commitResult

# Push para disparar deploy
Write-Host ""
Write-Host "[4/4] Enviando para GitHub..." -ForegroundColor Yellow
git push origin master

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  DEPLOY INICIADO COM SUCESSO!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Acompanhe em:" -ForegroundColor White
Write-Host "  https://github.com/almeidawg/20260105-wgeasy/actions" -ForegroundColor Blue
Write-Host ""
Write-Host "  Frontend: https://easy.wgalmeida.com.br" -ForegroundColor White
Write-Host "  Backend:  https://wgeasy-production.up.railway.app" -ForegroundColor White
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
