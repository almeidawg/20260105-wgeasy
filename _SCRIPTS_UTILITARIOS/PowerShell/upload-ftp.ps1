# Script de Upload FTP para Hostinger - WGeasy
# Faz upload incremental (só arquivos modificados)

$ftpHost = "ftp://147.93.64.151"
$ftpUser = "u968231423.easy.wgalmeida.com.br"
$ftpPass = "WGEasy2026!"
$localPath = "C:\Users\Atendimento\Documents\01VISUALSTUDIO_OFICIAL\sistema\wgeasy\frontend\dist"
$remotePath = "/public_html"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  UPLOAD FTP - WGeasy Sistema" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Host: $ftpHost" -ForegroundColor Yellow
Write-Host "Destino: $remotePath" -ForegroundColor Yellow
Write-Host "Origem: $localPath" -ForegroundColor Yellow
Write-Host ""

# Criar objeto de credenciais
$ftpUri = "$ftpHost$remotePath"

function Upload-FTPFile {
    param (
        [string]$localFile,
        [string]$remoteFile
    )

    try {
        $uri = "$ftpHost$remoteFile"
        $webclient = New-Object System.Net.WebClient
        $webclient.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
        $webclient.UploadFile($uri, $localFile)
        Write-Host "  [OK] $remoteFile" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "  [ERRO] $remoteFile - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Create-FTPDirectory {
    param ([string]$remotePath)

    try {
        $uri = "$ftpHost$remotePath"
        $request = [System.Net.FtpWebRequest]::Create($uri)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $request.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
        $response = $request.GetResponse()
        $response.Close()
        Write-Host "  [DIR] $remotePath" -ForegroundColor Blue
    }
    catch {
        # Diretorio pode ja existir, ignorar erro
    }
}

Write-Host "Iniciando upload..." -ForegroundColor Cyan
Write-Host ""

$files = Get-ChildItem -Path $localPath -Recurse -File
$total = $files.Count
$current = 0
$success = 0

foreach ($file in $files) {
    $current++
    $relativePath = $file.FullName.Substring($localPath.Length).Replace("\", "/")
    $remoteFilePath = "$remotePath$relativePath"
    $remoteDir = Split-Path $remoteFilePath -Parent

    # Criar diretorio se necessario
    if ($remoteDir -ne $remotePath) {
        Create-FTPDirectory -remotePath $remoteDir
    }

    Write-Host "[$current/$total] Enviando: $relativePath" -ForegroundColor Gray

    if (Upload-FTPFile -localFile $file.FullName -remoteFile $remoteFilePath) {
        $success++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  UPLOAD CONCLUIDO!" -ForegroundColor Green
Write-Host "  $success de $total arquivos enviados" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
