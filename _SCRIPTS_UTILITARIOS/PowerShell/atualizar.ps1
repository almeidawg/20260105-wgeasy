# Script de Atualização - WGEasy Frontend
# Execute com: .\atualizar.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  WGEasy - Atualizar Dependências" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Verificando atualizações disponíveis..." -ForegroundColor Yellow
npm outdated

Write-Host ""
Write-Host "[2/4] Deseja continuar com a atualização?" -ForegroundColor Yellow
$resposta = Read-Host "Digite S para Sim ou N para Não"

if ($resposta -ne "S" -and $resposta -ne "s") {
    Write-Host "Atualização cancelada." -ForegroundColor Yellow
    Write-Host "Pressione qualquer tecla para sair..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

Write-Host ""
Write-Host "[3/4] Atualizando dependências..." -ForegroundColor Yellow
npm update

Write-Host ""
Write-Host "[4/4] Verificando se há dependências com vulnerabilidades..." -ForegroundColor Yellow
npm audit

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✓ Atualização concluída!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
