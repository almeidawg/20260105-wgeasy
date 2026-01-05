$ftpHost = "ftp://147.93.64.151"
$ftpUser = "u968231423.wgalmeida-com-br-238673.hostingersite.com"
$ftpPass = "130300@`$Wg"

Write-Host "Conectando ao FTP..." -ForegroundColor Cyan

try {
    $uri = "$ftpHost/"
    $request = [System.Net.FtpWebRequest]::Create($uri)
    $request.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $request.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
    $request.Timeout = 30000

    $response = $request.GetResponse()
    $stream = $response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $content = $reader.ReadToEnd()

    Write-Host ""
    Write-Host "Dominios encontrados:" -ForegroundColor Green
    Write-Host $content

    $reader.Close()
    $response.Close()
}
catch {
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
}
