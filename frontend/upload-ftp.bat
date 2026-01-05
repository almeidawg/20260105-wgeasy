@echo off
echo ========================================
echo   UPLOAD FTP - WGeasy Sistema
echo ========================================
echo.

set FTP_HOST=147.93.151.64
set FTP_USER=u968231423.wgalmeida-com-br-238673.hostingersite.com
set FTP_PASS=130300@$Wg
set LOCAL_PATH=C:\Users\Atendimento\Documents\01VISUALSTUDIO_OFICIAL\sistema\wgeasy\frontend\dist
set REMOTE_PATH=/domains/easy.wgalmeida.com.br/public_html

echo Host: %FTP_HOST%
echo Destino: %REMOTE_PATH%
echo Origem: %LOCAL_PATH%
echo.
echo Iniciando upload...
echo.

REM Upload arquivos principais
curl -T "%LOCAL_PATH%\index.html" "ftp://%FTP_USER%:%FTP_PASS%@%FTP_HOST%%REMOTE_PATH%/index.html" --ftp-create-dirs
curl -T "%LOCAL_PATH%\.htaccess" "ftp://%FTP_USER%:%FTP_PASS%@%FTP_HOST%%REMOTE_PATH%/.htaccess" --ftp-create-dirs
curl -T "%LOCAL_PATH%\favicon.ico" "ftp://%FTP_USER%:%FTP_PASS%@%FTP_HOST%%REMOTE_PATH%/favicon.ico" --ftp-create-dirs

REM Upload pasta assets
for %%f in ("%LOCAL_PATH%\assets\*") do (
    echo Enviando: assets/%%~nxf
    curl -T "%%f" "ftp://%FTP_USER%:%FTP_PASS%@%FTP_HOST%%REMOTE_PATH%/assets/%%~nxf" --ftp-create-dirs
)

REM Upload pasta imagens
for %%f in ("%LOCAL_PATH%\imagens\*") do (
    echo Enviando: imagens/%%~nxf
    curl -T "%%f" "ftp://%FTP_USER%:%FTP_PASS%@%FTP_HOST%%REMOTE_PATH%/imagens/%%~nxf" --ftp-create-dirs
)

REM Upload pasta videos
for %%f in ("%LOCAL_PATH%\videos\*") do (
    echo Enviando: videos/%%~nxf
    curl -T "%%f" "ftp://%FTP_USER%:%FTP_PASS%@%FTP_HOST%%REMOTE_PATH%/videos/%%~nxf" --ftp-create-dirs
)

REM Upload SVGs
curl -T "%LOCAL_PATH%\logo-wg-grupo.svg" "ftp://%FTP_USER%:%FTP_PASS%@%FTP_HOST%%REMOTE_PATH%/logo-wg-grupo.svg" --ftp-create-dirs
curl -T "%LOCAL_PATH%\logo-wg-almeida.svg" "ftp://%FTP_USER%:%FTP_PASS%@%FTP_HOST%%REMOTE_PATH%/logo-wg-almeida.svg" --ftp-create-dirs
curl -T "%LOCAL_PATH%\simbolo-wg.svg" "ftp://%FTP_USER%:%FTP_PASS%@%FTP_HOST%%REMOTE_PATH%/simbolo-wg.svg" --ftp-create-dirs
curl -T "%LOCAL_PATH%\timbrado-wg.png" "ftp://%FTP_USER%:%FTP_PASS%@%FTP_HOST%%REMOTE_PATH%/timbrado-wg.png" --ftp-create-dirs

echo.
echo ========================================
echo   UPLOAD CONCLUIDO!
echo ========================================
pause
