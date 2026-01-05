# ============================================
# Script PowerShell - Abrir GPT Code Max
# ============================================

# Configuracoes
$appName = "GPT Code Max"

# Funcao para encontrar e abrir o app pelo nome
function Open-AppByName {
    param([string]$Name)

    Write-Host "Procurando '$Name'..." -ForegroundColor Cyan

    # Metodo 1: Procurar no Menu Iniciar
    $startMenuPaths = @(
        "$env:APPDATA\Microsoft\Windows\Start Menu\Programs",
        "$env:ProgramData\Microsoft\Windows\Start Menu\Programs"
    )

    foreach ($path in $startMenuPaths) {
        $shortcuts = Get-ChildItem -Path $path -Filter "*.lnk" -Recurse -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -like "*$Name*" }

        if ($shortcuts) {
            $shortcut = $shortcuts | Select-Object -First 1
            Write-Host "Encontrado: $($shortcut.FullName)" -ForegroundColor Green
            Start-Process $shortcut.FullName
            return $true
        }
    }

    # Metodo 2: Procurar executaveis em Program Files
    $programPaths = @(
        "$env:ProgramFiles",
        "${env:ProgramFiles(x86)}",
        "$env:LOCALAPPDATA\Programs"
    )

    foreach ($path in $programPaths) {
        $exes = Get-ChildItem -Path $path -Filter "*.exe" -Recurse -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -like "*$Name*" -or $_.Directory.Name -like "*$Name*" }

        if ($exes) {
            $exe = $exes | Select-Object -First 1
            Write-Host "Encontrado: $($exe.FullName)" -ForegroundColor Green
            Start-Process $exe.FullName
            return $true
        }
    }

    return $false
}

# Funcao para abrir app da Microsoft Store
function Open-StoreApp {
    param([string]$Name)

    Write-Host "Procurando app da Microsoft Store..." -ForegroundColor Cyan

    # Listar apps instalados da Store
    $apps = Get-AppxPackage | Where-Object { $_.Name -like "*$Name*" }

    if ($apps) {
        $app = $apps | Select-Object -First 1
        Write-Host "Encontrado app: $($app.Name)" -ForegroundColor Green

        # Obter o AppUserModelId
        $appId = (Get-StartApps | Where-Object { $_.Name -like "*$Name*" }).AppID

        if ($appId) {
            Start-Process "shell:AppsFolder\$appId"
            return $true
        }
    }

    return $false
}

# Funcao principal
function Start-GptCodeMax {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "  Iniciando $appName" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""

    # Tentar diferentes metodos
    $found = Open-AppByName -Name $appName

    if (-not $found) {
        $found = Open-AppByName -Name "GPTCodeMax"
    }

    if (-not $found) {
        $found = Open-AppByName -Name "Code Max"
    }

    if (-not $found) {
        $found = Open-StoreApp -Name "GPT"
    }

    if (-not $found) {
        Write-Host ""
        Write-Host "App nao encontrado automaticamente." -ForegroundColor Red
        Write-Host ""
        Write-Host "Opcoes:" -ForegroundColor Yellow
        Write-Host "1. Informe o caminho completo do executavel"
        Write-Host "2. Verifique se o app esta instalado"
        Write-Host ""

        # Perguntar caminho manual
        $manualPath = Read-Host "Digite o caminho do executavel (ou Enter para sair)"

        if ($manualPath -and (Test-Path $manualPath)) {
            Start-Process $manualPath
            Write-Host "App iniciado!" -ForegroundColor Green
        }
    }
    else {
        Write-Host ""
        Write-Host "App iniciado com sucesso!" -ForegroundColor Green
    }
}

# Executar
Start-GptCodeMax
