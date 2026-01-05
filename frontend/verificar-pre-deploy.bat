@echo off
chcp 65001 >nul
echo ================================================================================
echo   WG EASY - VERIFICAÇÃO PRÉ-DEPLOY
echo ================================================================================
echo.

cd /d "%~dp0"

echo [1/8] Verificando estrutura de pastas...
if exist "src" (
    echo ✓ Pasta src existe
) else (
    echo ✗ Pasta src NAO encontrada
    goto :error
)

if exist "public" (
    echo ✓ Pasta public existe
) else (
    echo ✓ Pasta public nao existe (opcional)
)

echo.
echo [2/8] Verificando arquivos de configuração...

if exist "package.json" (
    echo ✓ package.json existe
) else (
    echo ✗ package.json NAO encontrado
    goto :error
)

if exist "vite.config.ts" (
    echo ✓ vite.config.ts existe
) else (
    echo ✗ vite.config.ts NAO encontrado
    goto :error
)

if exist "tsconfig.json" (
    echo ✓ tsconfig.json existe
) else (
    echo ✗ tsconfig.json NAO encontrado
    goto :error
)

if exist "vercel.json" (
    echo ✓ vercel.json existe
) else (
    echo ✗ vercel.json NAO encontrado
    goto :error
)

if exist ".gitignore" (
    echo ✓ .gitignore existe
) else (
    echo ✗ .gitignore NAO encontrado
    goto :error
)

if exist ".env.production.example" (
    echo ✓ .env.production.example existe
) else (
    echo ⚠ .env.production.example NAO encontrado (recomendado)
)

echo.
echo [3/8] Verificando node_modules...
if exist "node_modules" (
    echo ✓ node_modules existe
) else (
    echo ⚠ node_modules NAO existe - executar: npm install
)

echo.
echo [4/8] Verificando arquivos de documentação...
if exist "GUIA-DEPLOY-PRODUCAO.md" (
    echo ✓ GUIA-DEPLOY-PRODUCAO.md existe
) else (
    echo ⚠ GUIA-DEPLOY-PRODUCAO.md nao encontrado
)

if exist "DEPLOY-CHECKLIST.md" (
    echo ✓ DEPLOY-CHECKLIST.md existe
) else (
    echo ⚠ DEPLOY-CHECKLIST.md nao encontrado
)

if exist "DEPLOY-RAPIDO.html" (
    echo ✓ DEPLOY-RAPIDO.html existe
) else (
    echo ⚠ DEPLOY-RAPIDO.html nao encontrado
)

if exist "STATUS-DEPLOY.md" (
    echo ✓ STATUS-DEPLOY.md existe
) else (
    echo ⚠ STATUS-DEPLOY.md nao encontrado
)

echo.
echo [5/8] Verificando módulo de usuários...
if exist "src\lib\usuariosApi.ts" (
    echo ✓ usuariosApi.ts existe
) else (
    echo ✗ usuariosApi.ts NAO encontrado
    goto :error
)

if exist "src\types\usuarios.ts" (
    echo ✓ usuarios.ts (types) existe
) else (
    echo ✗ usuarios.ts (types) NAO encontrado
    goto :error
)

if exist "src\pages\usuarios\UsuariosPage.tsx" (
    echo ✓ UsuariosPage.tsx existe
) else (
    echo ✗ UsuariosPage.tsx NAO encontrado
    goto :error
)

if exist "src\pages\usuarios\UsuarioFormPage.tsx" (
    echo ✓ UsuarioFormPage.tsx existe
) else (
    echo ✗ UsuarioFormPage.tsx NAO encontrado
    goto :error
)

echo.
echo [6/8] Verificando componentes UI...
if exist "src\components\ui\table.tsx" (
    echo ✓ table.tsx existe
) else (
    echo ✗ table.tsx NAO encontrado
    goto :error
)

if exist "src\components\ui\dropdown-menu.tsx" (
    echo ✓ dropdown-menu.tsx existe
) else (
    echo ✗ dropdown-menu.tsx NAO encontrado
    goto :error
)

if exist "src\components\ui\switch.tsx" (
    echo ✓ switch.tsx existe
) else (
    echo ✗ switch.tsx NAO encontrado
    goto :error
)

if exist "src\components\ui\Badge.tsx" (
    echo ✓ Badge.tsx existe
) else (
    echo ✗ Badge.tsx NAO encontrado
    goto :error
)

echo.
echo [7/8] Testando build de produção...
echo Executando: npm run build
echo.

call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Build de produção SUCESSO
) else (
    echo.
    echo ✗ Build de produção FALHOU
    goto :error
)

echo.
echo [8/8] Verificando pasta dist...
if exist "dist" (
    echo ✓ Pasta dist criada
    if exist "dist\index.html" (
        echo ✓ index.html gerado
    ) else (
        echo ✗ index.html NAO encontrado em dist
        goto :error
    )
) else (
    echo ✗ Pasta dist NAO criada
    goto :error
)

echo.
echo ================================================================================
echo   ✓✓✓ VERIFICAÇÃO COMPLETA - SISTEMA PRONTO PARA DEPLOY! ✓✓✓
echo ================================================================================
echo.
echo Todos os arquivos e configuracoes estao corretos.
echo O sistema esta pronto para ser deployado em producao.
echo.
echo PROXIMO PASSO:
echo   1. Abrir DEPLOY-RAPIDO.html (guia visual)
echo   2. Ou executar: abrir-links-deploy.bat
echo   3. Ou seguir DEPLOY-CHECKLIST.md
echo.
echo ================================================================================
pause
exit /b 0

:error
echo.
echo ================================================================================
echo   ✗✗✗ VERIFICAÇÃO FALHOU ✗✗✗
echo ================================================================================
echo.
echo Alguns arquivos ou configuracoes estao faltando.
echo Verifique os itens marcados com ✗ acima.
echo.
echo SOLUCOES COMUNS:
echo   - Se node_modules nao existe: npm install
echo   - Se build falhou: npm run clean ^&^& npm install
echo   - Se arquivos estao faltando: verifique o diretorio correto
echo.
pause
exit /b 1
