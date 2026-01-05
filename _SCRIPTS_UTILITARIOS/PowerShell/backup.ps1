# Script de Backup Automático - WGEasy Frontend
# Execute com: .\backup.ps1

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupDir = "..\backups"
$backupName = "wgeasy-frontend_$timestamp.zip"
$backupPath = Join-Path $backupDir $backupName

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  WGEasy - Backup Automático" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Criar diretório de backup se não existir
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
    Write-Host "✓ Diretório de backup criado" -ForegroundColor Green
}

Write-Host "Criando backup..." -ForegroundColor Yellow
Write-Host "  Arquivo: $backupName" -ForegroundColor Gray
Write-Host ""

# Arquivos e pastas para incluir no backup
$itemsToBackup = @(
    "src",
    "public",
    "index.html",
    "package.json",
    "tsconfig.json",
    "vite.config.ts",
    "tailwind.config.js",
    ".env"
)

# Criar arquivo temporário para compactar
$tempDir = "temp_backup_$timestamp"
New-Item -ItemType Directory -Path $tempDir | Out-Null

foreach ($item in $itemsToBackup) {
    if (Test-Path $item) {
        Copy-Item -Path $item -Destination $tempDir -Recurse -Force
        Write-Host "  ✓ $item" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ $item (não encontrado)" -ForegroundColor Yellow
    }
}

# Compactar
Compress-Archive -Path "$tempDir\*" -DestinationPath $backupPath -Force

# Limpar diretório temporário
Remove-Item -Recurse -Force $tempDir

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✓ Backup criado com sucesso!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Local: $backupPath" -ForegroundColor White
Write-Host ""

# Listar backups existentes
Write-Host "Backups existentes:" -ForegroundColor White
Get-ChildItem -Path $backupDir -Filter "wgeasy-frontend_*.zip" |
    Sort-Object LastWriteTime -Descending |
    Select-Object Name, @{Name="Tamanho";Expression={"{0:N2} MB" -f ($_.Length / 1MB)}}, LastWriteTime |
    Format-Table -AutoSize

Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
