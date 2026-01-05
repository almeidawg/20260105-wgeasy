# Script de Diagnóstico - WGEasy Frontend
# Execute com: .\diagnostico.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  WGEasy - Diagnóstico do Sistema" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$problemas = 0
$avisos = 0

# Verificar Node.js
Write-Host "[1/10] Node.js" -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*','$1')
    if ($nodeMajor -ge 18) {
        Write-Host "  ✓ Versão: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Versão antiga: $nodeVersion (recomendado: v18+)" -ForegroundColor Yellow
        $avisos++
    }
} catch {
    Write-Host "  ✗ Node.js não instalado" -ForegroundColor Red
    $problemas++
}

# Verificar npm
Write-Host "[2/10] npm" -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "  ✓ Versão: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ npm não instalado" -ForegroundColor Red
    $problemas++
}

# Verificar node_modules
Write-Host "[3/10] Dependências" -ForegroundColor Yellow
if (Test-Path "node_modules") {
    $modulesSize = (Get-ChildItem node_modules -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "  ✓ node_modules instalado ($([math]::Round($modulesSize, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "  ✗ node_modules não encontrado - Execute: npm install" -ForegroundColor Red
    $problemas++
}

# Verificar package.json
Write-Host "[4/10] package.json" -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "  ✓ package.json encontrado" -ForegroundColor Green
} else {
    Write-Host "  ✗ package.json não encontrado" -ForegroundColor Red
    $problemas++
}

# Verificar .env
Write-Host "[5/10] Configuração (.env)" -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "VITE_SUPABASE_URL=https://") {
        Write-Host "  ✓ .env configurado com Supabase" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ .env existe mas pode não estar configurado" -ForegroundColor Yellow
        $avisos++
    }
} else {
    Write-Host "  ⚠ .env não encontrado - Copie de .env.example" -ForegroundColor Yellow
    $avisos++
}

# Verificar TypeScript config
Write-Host "[6/10] TypeScript" -ForegroundColor Yellow
if (Test-Path "tsconfig.json") {
    Write-Host "  ✓ tsconfig.json encontrado" -ForegroundColor Green
} else {
    Write-Host "  ✗ tsconfig.json não encontrado" -ForegroundColor Red
    $problemas++
}

# Verificar Vite config
Write-Host "[7/10] Vite" -ForegroundColor Yellow
if (Test-Path "vite.config.ts") {
    Write-Host "  ✓ vite.config.ts encontrado" -ForegroundColor Green
} else {
    Write-Host "  ✗ vite.config.ts não encontrado" -ForegroundColor Red
    $problemas++
}

# Verificar src/
Write-Host "[8/10] Código fonte" -ForegroundColor Yellow
if (Test-Path "src") {
    $tsxFiles = (Get-ChildItem -Path "src" -Recurse -Filter "*.tsx" -File).Count
    Write-Host "  ✓ Pasta src/ encontrada ($tsxFiles arquivos .tsx)" -ForegroundColor Green
} else {
    Write-Host "  ✗ Pasta src/ não encontrada" -ForegroundColor Red
    $problemas++
}

# Verificar index.html
Write-Host "[9/10] index.html" -ForegroundColor Yellow
if (Test-Path "index.html") {
    Write-Host "  ✓ index.html encontrado" -ForegroundColor Green
} else {
    Write-Host "  ✗ index.html não encontrado" -ForegroundColor Red
    $problemas++
}

# Verificar cache do Vite
Write-Host "[10/10] Cache" -ForegroundColor Yellow
if (Test-Path ".vite") {
    $cacheSize = (Get-ChildItem .vite -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "  ℹ Cache do Vite: $([math]::Round($cacheSize, 2)) MB" -ForegroundColor Cyan
    Write-Host "    Execute 'npm run clean' para limpar" -ForegroundColor Gray
} else {
    Write-Host "  ✓ Sem cache (será criado no primeiro build)" -ForegroundColor Green
}

# Resumo
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Resumo do Diagnóstico" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($problemas -eq 0 -and $avisos -eq 0) {
    Write-Host "✓ Tudo OK! Sistema pronto para uso." -ForegroundColor Green
} elseif ($problemas -eq 0) {
    Write-Host "⚠ Sistema funcional com $avisos aviso(s)" -ForegroundColor Yellow
} else {
    Write-Host "✗ Encontrados $problemas problema(s) e $avisos aviso(s)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Soluções sugeridas:" -ForegroundColor White
    Write-Host "  1. Execute: .\setup.ps1" -ForegroundColor Gray
    Write-Host "  2. Ou execute: npm install" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Informações do Sistema:" -ForegroundColor White
Write-Host "  Diretório: $PWD" -ForegroundColor Gray
Write-Host "  Data/Hora: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
