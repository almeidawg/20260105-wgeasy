# Script de Setup Automático - WGEasy Frontend
# Execute com: .\setup.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  WGEasy - Setup Automático" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Node.js está instalado
Write-Host "[1/5] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js não encontrado! Instale em: https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Verificar se npm está instalado
Write-Host "[2/5] Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "  ✓ npm encontrado: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ npm não encontrado!" -ForegroundColor Red
    exit 1
}

# Limpar cache e instalações antigas
Write-Host "[3/5] Limpando cache..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
    Write-Host "  ✓ node_modules removido" -ForegroundColor Green
}
if (Test-Path ".vite") {
    Remove-Item -Recurse -Force .vite
    Write-Host "  ✓ Cache do Vite removido" -ForegroundColor Green
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json
    Write-Host "  ✓ package-lock.json removido" -ForegroundColor Green
}

# Instalar dependências
Write-Host "[4/5] Instalando dependências..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Dependências instaladas com sucesso!" -ForegroundColor Green
} else {
    Write-Host "  ✗ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}

# Verificar arquivo .env
Write-Host "[5/5] Verificando configurações..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "  ✓ Arquivo .env encontrado" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Arquivo .env não encontrado" -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "  ✓ Arquivo .env criado a partir do exemplo" -ForegroundColor Green
        Write-Host "  ⚠ Configure suas credenciais do Supabase no arquivo .env" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✓ Setup concluído com sucesso!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Comandos disponíveis:" -ForegroundColor White
Write-Host "  npm run dev        - Iniciar servidor de desenvolvimento" -ForegroundColor Gray
Write-Host "  npm run build      - Build para produção" -ForegroundColor Gray
Write-Host "  npm run preview    - Preview do build" -ForegroundColor Gray
Write-Host "  npm run type-check - Verificar tipos TypeScript" -ForegroundColor Gray
Write-Host "  npm run fresh      - Limpar e reinstalar tudo" -ForegroundColor Gray
Write-Host ""
Write-Host "Pressione qualquer tecla para iniciar o servidor de desenvolvimento..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
npm run dev
