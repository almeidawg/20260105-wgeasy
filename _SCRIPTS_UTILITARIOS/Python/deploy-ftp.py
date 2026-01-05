#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
==============================================
  DEPLOY FTP - SISTEMA WG EASY
  Destino: easy.wgalmeida.com.br
==============================================
"""

import os
import sys
import time
from ftplib import FTP

# Fix encoding for Windows console
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Configurações FTP - Sistema WG Easy
FTP_HOST = "147.93.64.151"
FTP_USER = "u968231423.easy.wgalmeida.com.br"
FTP_PASS = "WGEasy2026!"

# Diretórios
LOCAL_DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")
REMOTE_PATH = "/public_html"

def conectar():
    """Conecta ao servidor FTP"""
    ftp = FTP(FTP_HOST, timeout=30)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.set_pasv(True)
    return ftp

def criar_dir_recursivo(ftp, remote_dir):
    """Criar diretório e seus pais se necessário"""
    dirs = remote_dir.split('/')
    current = ""
    for d in dirs:
        if d:
            current += "/" + d
            try:
                ftp.mkd(current)
            except:
                pass

def upload_arquivo(ftp, local_file, remote_file):
    """Upload de um arquivo"""
    try:
        with open(local_file, 'rb') as f:
            ftp.storbinary(f'STOR {remote_file}', f)
        return True
    except Exception as e:
        return False

def main():
    print("=" * 60)
    print("  DEPLOY SISTEMA WG EASY")
    print("  Destino: https://easy.wgalmeida.com.br")
    print("=" * 60)
    print()

    # Verificar se dist existe
    if not os.path.exists(LOCAL_DIST):
        print("[ERRO] Pasta dist não encontrada!")
        print("Execute 'npm run build' primeiro.")
        return

    # Testar conexão
    print("Conectando ao servidor FTP...")
    try:
        ftp = conectar()
        print(f"[OK] Conectado!")
    except Exception as e:
        print(f"[ERRO] Conexão falhou: {e}")
        return

    # Coletar arquivos
    print("\nColetando arquivos para upload...")
    arquivos = []
    diretorios = set()

    for root, dirs, files in os.walk(LOCAL_DIST):
        rel_path = os.path.relpath(root, LOCAL_DIST)
        if rel_path == ".":
            rel_path = ""

        if rel_path:
            remote_dir = REMOTE_PATH + "/" + rel_path.replace("\\", "/")
            diretorios.add(remote_dir)

        for filename in files:
            local_file = os.path.join(root, filename)
            if rel_path:
                remote_file = REMOTE_PATH + "/" + rel_path.replace("\\", "/") + "/" + filename
            else:
                remote_file = REMOTE_PATH + "/" + filename
            arquivos.append((local_file, remote_file))

    print(f"[INFO] {len(arquivos)} arquivos encontrados")
    print(f"[INFO] {len(diretorios)} diretórios a criar")
    print()

    # Criar diretórios
    print("Criando estrutura de diretórios...")
    for d in sorted(diretorios):
        criar_dir_recursivo(ftp, d)

    ftp.quit()

    # Upload arquivos
    print("\nEnviando arquivos...")
    enviados = 0
    erros = 0
    total = len(arquivos)

    for i, (local_file, remote_file) in enumerate(arquivos, 1):
        nome = os.path.basename(remote_file)
        nome_display = nome[:40] if len(nome) > 40 else nome

        try:
            ftp = conectar()
            if upload_arquivo(ftp, local_file, remote_file):
                print(f"[{i}/{total}] {nome_display} [OK]")
                enviados += 1
            else:
                print(f"[{i}/{total}] {nome_display} [ERRO]")
                erros += 1
            ftp.quit()
        except Exception as e:
            print(f"[{i}/{total}] {nome_display} [ERRO]")
            erros += 1

    print()
    print("=" * 60)
    print(f"  DEPLOY CONCLUÍDO!")
    print(f"  {enviados} enviados, {erros} erros")
    print("=" * 60)
    print("\nAcesse: https://easy.wgalmeida.com.br")

if __name__ == "__main__":
    main()
