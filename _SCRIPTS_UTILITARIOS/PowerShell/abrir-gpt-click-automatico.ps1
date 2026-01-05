# ============================================
# Script com Automacao de Clique - GPT Code Max
# ============================================
# Este script usa automacao de UI para simular cliques

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName Microsoft.VisualBasic

# Funcao para simular clique do mouse
Add-Type @"
using System;
using System.Runtime.InteropServices;

public class MouseSimulator {
    [DllImport("user32.dll", CharSet = CharSet.Auto, CallingConvention = CallingConvention.StdCall)]
    public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint cButtons, uint dwExtraInfo);

    [DllImport("user32.dll")]
    public static extern bool SetCursorPos(int X, int Y);

    public const int MOUSEEVENTF_LEFTDOWN = 0x02;
    public const int MOUSEEVENTF_LEFTUP = 0x04;

    public static void Click(int x, int y) {
        SetCursorPos(x, y);
        mouse_event(MOUSEEVENTF_LEFTDOWN | MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
    }

    public static void DoubleClick(int x, int y) {
        SetCursorPos(x, y);
        mouse_event(MOUSEEVENTF_LEFTDOWN | MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
        System.Threading.Thread.Sleep(100);
        mouse_event(MOUSEEVENTF_LEFTDOWN | MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
    }
}
"@

# Funcao para abrir Menu Iniciar e buscar app
function Open-AppViaStartMenu {
    param([string]$AppName)

    Write-Host "Abrindo Menu Iniciar..." -ForegroundColor Cyan

    # Pressionar tecla Windows
    [System.Windows.Forms.SendKeys]::SendWait("^{ESC}")
    Start-Sleep -Milliseconds 500

    # Digitar nome do app
    Write-Host "Buscando '$AppName'..." -ForegroundColor Cyan
    [Microsoft.VisualBasic.Interaction]::AppActivate("Pesquisar")
    Start-Sleep -Milliseconds 300

    # Digitar o nome
    [System.Windows.Forms.SendKeys]::SendWait($AppName)
    Start-Sleep -Seconds 2

    # Pressionar Enter para abrir o primeiro resultado
    Write-Host "Abrindo app..." -ForegroundColor Green
    [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
}

# Funcao alternativa usando Run dialog
function Open-AppViaRun {
    param([string]$Command)

    Write-Host "Abrindo via Executar (Win+R)..." -ForegroundColor Cyan

    # Win+R
    [System.Windows.Forms.SendKeys]::SendWait("^{ESC}")
    Start-Sleep -Milliseconds 300
    [System.Windows.Forms.SendKeys]::SendWait("{ESC}")
    Start-Sleep -Milliseconds 200

    # Abrir Run
    $wshell = New-Object -ComObject WScript.Shell
    $wshell.Run("$Command")
}

# Menu de opcoes
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  Automacao - Abrir GPT Code Max" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Escolha o metodo:" -ForegroundColor Cyan
Write-Host "1. Buscar no Menu Iniciar (simula digitacao)"
Write-Host "2. Abrir diretamente (se souber o caminho)"
Write-Host "3. Listar apps disponiveis"
Write-Host ""

$opcao = Read-Host "Digite sua opcao (1-3)"

switch ($opcao) {
    "1" {
        $nomeApp = Read-Host "Digite o nome do app para buscar (ex: GPT Code Max)"
        if (-not $nomeApp) { $nomeApp = "GPT Code Max" }
        Open-AppViaStartMenu -AppName $nomeApp
    }
    "2" {
        $caminho = Read-Host "Digite o caminho completo do executavel"
        if (Test-Path $caminho) {
            Start-Process $caminho
            Write-Host "App iniciado!" -ForegroundColor Green
        }
        else {
            Write-Host "Caminho nao encontrado!" -ForegroundColor Red
        }
    }
    "3" {
        Write-Host ""
        Write-Host "Apps instalados (Start Menu):" -ForegroundColor Yellow
        Get-StartApps | Sort-Object Name | Format-Table Name -AutoSize
    }
    default {
        Write-Host "Opcao invalida" -ForegroundColor Red
    }
}
