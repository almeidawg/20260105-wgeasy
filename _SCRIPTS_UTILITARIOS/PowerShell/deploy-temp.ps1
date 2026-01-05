# Deploy temporario para WG Easy
$ftpHost = "ftp://147.93.64.151"
$ftpUser = "u968231423.wgalmeida-com-br-238673.hostingersite.com"
$ftpPass = '130300@$Wg'
$localPath = "C:\Users\Atendimento\Documents\01VISUALSTUDIO_OFICIAL\sistema\wgeasy\frontend\dist"
$remoteBasePath = "/domains/easy.wgalmeida.com.br/public_html"

Write-Host "Iniciando deploy para easy.wgalmeida.com.br..." -ForegroundColor Cyan

$files = Get-ChildItem -Path $localPath -Recurse -File
Write-Host "Total de arquivos: $($files.Count)"

$success = 0
foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($localPath.Length).Replace("\", "/")
    $remotePath = "$remoteBasePath$relativePath"

    try {
        $uri = "$ftpHost$remotePath"
        $webclient = New-Object System.Net.WebClient
        $webclient.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
        $webclient.UploadFile($uri, $file.FullName)
        Write-Host "[OK] $relativePath" -ForegroundColor Green
        $success++
    }
    catch {
        Write-Host "[ERRO] $relativePath - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Deploy concluido! $success arquivos enviados." -ForegroundColor Green
