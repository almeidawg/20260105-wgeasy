@echo off
title OpenAI Codex CLI (WSL2 Ubuntu)
color 0A

echo.
echo ============================================
echo    OPENAI CODEX CLI - WSL2 Ubuntu
echo    Grupo WG Almeida
echo ============================================
echo.

echo [*] Iniciando Codex CLI no Ubuntu WSL2...
echo.

REM Defina a variável OPENAI_API_KEY no ambiente do Windows ou WSL antes de executar.
wsl -d Ubuntu --exec bash -c "codex"

pause
