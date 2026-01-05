# ============================================
# Script Direto - Abrir GPT Code Max
# ============================================
# Descomente e ajuste o caminho correto do seu app:

# OPCAO 1: Se for um app da Microsoft Store
# Start-Process "shell:AppsFolder\Microsoft.GPTCodeMax_8wekyb3d8bbwe!App"

# OPCAO 2: Se estiver em Program Files
# Start-Process "C:\Program Files\GPT Code Max\GPTCodeMax.exe"

# OPCAO 3: Se estiver em AppData Local
# Start-Process "$env:LOCALAPPDATA\Programs\GPT Code Max\GPTCodeMax.exe"

# OPCAO 4: Abrir pelo atalho do Menu Iniciar (mais comum)
$atalho = Get-ChildItem "$env:APPDATA\Microsoft\Windows\Start Menu\Programs" -Recurse -Filter "*.lnk" |
    Where-Object { $_.Name -like "*GPT*" -or $_.Name -like "*Code Max*" } |
    Select-Object -First 1

if ($atalho) {
    Write-Host "Abrindo: $($atalho.Name)" -ForegroundColor Green
    Start-Process $atalho.FullName
}
else {
    # OPCAO 5: Listar todos os apps instalados com "GPT" no nome
    Write-Host "Procurando apps com 'GPT' no nome..." -ForegroundColor Yellow
    Get-StartApps | Where-Object { $_.Name -like "*GPT*" } | Format-Table Name, AppID

    Write-Host ""
    Write-Host "Procurando apps com 'Code' no nome..." -ForegroundColor Yellow
    Get-StartApps | Where-Object { $_.Name -like "*Code*" } | Format-Table Name, AppID
}
