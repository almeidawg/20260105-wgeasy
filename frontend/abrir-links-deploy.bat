@echo off
echo ============================================================
echo   WG EASY - ABRIR LINKS PARA DEPLOY
echo ============================================================
echo.
echo Abrindo todos os links necessarios para o deploy...
echo.

timeout /t 2 /nobreak >nul

REM Guia Rapido
echo [1/6] Abrindo guia rapido...
start "" "%~dp0DEPLOY-RAPIDO.html"
timeout /t 1 /nobreak >nul

REM GitHub - Criar repositorio
echo [2/6] Abrindo GitHub (criar repositorio)...
start "" "https://github.com/new"
timeout /t 1 /nobreak >nul

REM Vercel
echo [3/6] Abrindo Vercel...
start "" "https://vercel.com"
timeout /t 1 /nobreak >nul

REM Supabase - API Settings
echo [4/6] Abrindo Supabase API Settings (copiar ANON KEY)...
start "" "https://supabase.com/dashboard/project/ahlqzzkxuutwoepirpzr/settings/api"
timeout /t 1 /nobreak >nul

REM Supabase - Auth URLs
echo [5/6] Abrindo Supabase Auth URLs...
start "" "https://supabase.com/dashboard/project/ahlqzzkxuutwoepirpzr/auth/url-configuration"
timeout /t 1 /nobreak >nul

REM DNS Checker
echo [6/6] Abrindo DNS Checker...
start "" "https://dnschecker.org"
timeout /t 1 /nobreak >nul

echo.
echo ============================================================
echo   LINKS ABERTOS COM SUCESSO!
echo ============================================================
echo.
echo Agora siga os passos no guia DEPLOY-RAPIDO.html
echo.
echo Passos:
echo   1. Criar repositorio no GitHub
echo   2. Fazer deploy no Vercel
echo   3. Copiar ANON KEY do Supabase
echo   4. Configurar URLs no Supabase
echo   5. Verificar DNS apos configurar dominio
echo.
pause
