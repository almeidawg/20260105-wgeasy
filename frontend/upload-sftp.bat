@echo off
echo ========================================
echo   UPLOAD SFTP - WGeasy Sistema
echo ========================================
echo.

REM Verificar se WinSCP existe
where winscp.com >nul 2>&1
if %errorlevel% neq 0 (
    echo WinSCP nao encontrado no PATH.
    echo.
    echo INSTRUCOES MANUAIS:
    echo.
    echo 1. Baixe WinSCP: https://winscp.net/eng/download.php
    echo    OU use FileZilla: https://filezilla-project.org/
    echo.
    echo 2. Use estas credenciais:
    echo    Protocolo: SFTP
    echo    Host: 147.93.151.64
    echo    Porta: 22
    echo    Usuario: u968231423.wgalmeida-com-br-238673.hostingersite.com
    echo    Senha: 130300@$Wg
    echo.
    echo 3. Navegue ate a pasta: /domains/
    echo    Procure a pasta easy.wgalmeida.com.br ou similar
    echo.
    echo 4. Faca upload da pasta dist:
    echo    %~dp0dist
    echo.
    pause
    exit /b 1
)

set SFTP_HOST=147.93.151.64
set SFTP_USER=u968231423.wgalmeida-com-br-238673.hostingersite.com
set SFTP_PASS=130300@$Wg
set LOCAL_PATH=%~dp0dist
set REMOTE_PATH=/domains

echo Conectando via SFTP...
echo.

REM Listar dominios primeiro
winscp.com /command ^
    "open sftp://%SFTP_USER%:%SFTP_PASS%@%SFTP_HOST%/ -hostkey=*" ^
    "ls %REMOTE_PATH%" ^
    "exit"

echo.
echo ========================================
echo   DOMINIOS LISTADOS ACIMA
echo ========================================
echo.
echo Qual e o caminho para easy.wgalmeida.com.br?
echo (Ex: /domains/easy-wgalmeida-com-br-123456.hostingersite.com/public_html)
echo.
set /p DESTINO="Digite o caminho completo: "

echo.
echo Iniciando upload para: %DESTINO%
echo.

winscp.com /command ^
    "open sftp://%SFTP_USER%:%SFTP_PASS%@%SFTP_HOST%/ -hostkey=*" ^
    "synchronize remote %LOCAL_PATH% %DESTINO%" ^
    "exit"

echo.
echo ========================================
echo   UPLOAD CONCLUIDO!
echo ========================================
pause
