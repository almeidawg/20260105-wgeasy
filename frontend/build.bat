@echo off
title WGEasy - Build Production
color 0B

echo ========================================
echo   WGEasy - Build para Producao
echo ========================================
echo.

echo [1/3] Verificando tipos TypeScript...
call npm run type-check
if errorlevel 1 (
    echo.
    echo [ERRO] Problemas encontrados no TypeScript!
    pause
    exit /b 1
)

echo.
echo [2/3] Construindo aplicacao...
call npm run build
if errorlevel 1 (
    echo.
    echo [ERRO] Falha no build!
    pause
    exit /b 1
)

echo.
echo [3/3] Build concluido com sucesso!
echo.
echo Os arquivos estao em: dist/
echo.

choice /C SN /M "Deseja visualizar o preview"
if errorlevel 2 goto :end
if errorlevel 1 goto :preview

:preview
echo.
echo Iniciando preview...
call npm run preview

:end
pause
