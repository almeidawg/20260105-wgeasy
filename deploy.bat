@echo off
:: ============================================================
:: SCRIPT DE DEPLOY - WG Easy
:: Uso: deploy "mensagem do commit"
:: ============================================================

setlocal enabledelayedexpansion

:: Verificar se foi passada uma mensagem
if "%~1"=="" (
    set "MSG=deploy: atualizacao do sistema"
) else (
    set "MSG=%~1"
)

echo.
echo ============================================================
echo   WG EASY - DEPLOY AUTOMATICO
echo ============================================================
echo.

:: Mostrar status
echo [1/4] Verificando alteracoes...
git status --short

:: Adicionar todas as alteracoes
echo.
echo [2/4] Adicionando arquivos...
git add .

:: Fazer commit
echo.
echo [3/4] Criando commit: %MSG%
git commit -m "%MSG%"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Nenhuma alteracao para commitar.
    echo.
    goto :end
)

:: Push para disparar deploy
echo.
echo [4/4] Enviando para GitHub...
git push origin master

echo.
echo ============================================================
echo   DEPLOY INICIADO COM SUCESSO!
echo ============================================================
echo.
echo   Acompanhe em:
echo   https://github.com/almeidawg/20260105-wgeasy/actions
echo.
echo   Frontend: https://easy.wgalmeida.com.br
echo   Backend:  https://wgeasy-production.up.railway.app
echo.
echo ============================================================

:end
endlocal
